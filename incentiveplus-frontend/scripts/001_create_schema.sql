-- Incentive+ Database Schema
-- Sistema de Gerenciamento Educacional com Gamificação

-- =====================
-- TABELAS PRINCIPAIS
-- =====================

-- Estende auth.users com informações específicas do sistema
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('aluno', 'professor', 'admin')),
    points_balance INT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disciplinas
CREATE TABLE IF NOT EXISTS public.disciplines (
    discipline_id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    teacher_name VARCHAR(120) NOT NULL,
    schedule_info VARCHAR(200),
    teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matrículas (Aluno × Disciplina)
CREATE TABLE IF NOT EXISTS public.enrollments (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    discipline_id INT NOT NULL REFERENCES public.disciplines(discipline_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, discipline_id)
);

-- Feedbacks
CREATE TABLE IF NOT EXISTS public.feedbacks (
    feedback_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    discipline_id INT NOT NULL REFERENCES public.disciplines(discipline_id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_discipline_created_at ON public.feedbacks(discipline_id, created_at);

-- Recompensas
CREATE TABLE IF NOT EXISTS public.rewards (
    reward_id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    points_cost INT NOT NULL CHECK (points_cost > 0),
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resgates
CREATE TABLE IF NOT EXISTS public.redemptions (
    redemption_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'negado', 'cancelado')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    admin_notes TEXT
);

-- Itens do Resgate
CREATE TABLE IF NOT EXISTS public.redemption_items (
    item_id SERIAL PRIMARY KEY,
    redemption_id INT NOT NULL REFERENCES public.redemptions(redemption_id) ON DELETE CASCADE,
    reward_id INT NOT NULL REFERENCES public.rewards(reward_id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    points_spent INT NOT NULL CHECK (points_spent > 0)
);

-- Transações de Pontos
CREATE TABLE IF NOT EXISTS public.points_transactions (
    tx_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tx_type TEXT NOT NULL CHECK (tx_type IN ('credito', 'debito')),
    points_delta INT NOT NULL,
    reason VARCHAR(200),
    ref_table VARCHAR(50),
    ref_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (tx_type = 'credito' AND points_delta > 0) OR
        (tx_type = 'debito' AND points_delta < 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user_created_at ON public.points_transactions(user_id, created_at);

-- Notícias
CREATE TABLE IF NOT EXISTS public.news (
    news_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(60),
    content TEXT,
    link VARCHAR(400),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dicas
CREATE TABLE IF NOT EXISTS public.tips (
    tip_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    link VARCHAR(400),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

-- Users: podem ver todos, editar apenas próprio perfil
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_all" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Disciplines: todos podem ver
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "disciplines_select_all" ON public.disciplines
    FOR SELECT USING (true);

CREATE POLICY "disciplines_insert_professor_admin" ON public.disciplines
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('professor', 'admin')
        )
    );

CREATE POLICY "disciplines_update_professor_admin" ON public.disciplines
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('professor', 'admin')
        )
    );

-- Enrollments: alunos veem suas matrículas
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select_own" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "enrollments_insert_own" ON public.enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enrollments_delete_own" ON public.enrollments
    FOR DELETE USING (auth.uid() = user_id);

-- Feedbacks: usuários veem seus feedbacks e feedbacks das disciplinas que participam
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedbacks_select_all" ON public.feedbacks
    FOR SELECT USING (true);

CREATE POLICY "feedbacks_insert_own" ON public.feedbacks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedbacks_update_own" ON public.feedbacks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "feedbacks_delete_own" ON public.feedbacks
    FOR DELETE USING (auth.uid() = user_id);

-- Rewards: todos podem ver
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rewards_select_active" ON public.rewards
    FOR SELECT USING (is_active = true OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    ));

CREATE POLICY "rewards_insert_admin" ON public.rewards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "rewards_update_admin" ON public.rewards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Redemptions: usuários veem seus resgates, admins veem todos
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redemptions_select_own_or_admin" ON public.redemptions
    FOR SELECT USING (
        auth.uid() = user_id OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "redemptions_insert_own" ON public.redemptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "redemptions_update_admin" ON public.redemptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Redemption Items: herdam permissões dos redemptions
ALTER TABLE public.redemption_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redemption_items_select_via_redemption" ON public.redemption_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.redemptions r
            WHERE r.redemption_id = redemption_items.redemption_id
            AND (r.user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.users 
                WHERE id = auth.uid() 
                AND role = 'admin'
            ))
        )
    );

CREATE POLICY "redemption_items_insert_via_redemption" ON public.redemption_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.redemptions r
            WHERE r.redemption_id = redemption_items.redemption_id
            AND r.user_id = auth.uid()
        )
    );

-- Points Transactions: usuários veem suas transações
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "points_transactions_select_own" ON public.points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "points_transactions_insert_system" ON public.points_transactions
    FOR INSERT WITH CHECK (true);

-- News: todos podem ver
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_select_all" ON public.news
    FOR SELECT USING (true);

CREATE POLICY "news_insert_admin" ON public.news
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Tips: todos podem ver
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tips_select_all" ON public.tips
    FOR SELECT USING (true);

CREATE POLICY "tips_insert_admin" ON public.tips
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- =====================
-- TRIGGERS E FUNCTIONS
-- =====================

-- Trigger para criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, name, role, points_balance)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'aluno'),
        0
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function para atualizar saldo de pontos
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users
    SET points_balance = points_balance + NEW.points_delta,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_points_transaction ON public.points_transactions;

CREATE TRIGGER on_points_transaction
    AFTER INSERT ON public.points_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_points();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
