-- Dados Iniciais para o Sistema Incentive+

-- =====================
-- DISCIPLINAS
-- =====================
INSERT INTO public.disciplines (name, teacher_name, schedule_info) VALUES
('Matemática Avançada', 'Prof. Euler Santos', 'Segunda e Quarta, 08:00-10:00'),
('Biologia Celular', 'Profa. Darwin Lima', 'Terça e Quinta, 10:00-12:00'),
('História do Brasil', 'Prof. Pedro Cabral', 'Segunda e Quarta, 14:00-16:00'),
('Física Moderna', 'Prof. Isaac Newton', 'Terça e Quinta, 08:00-10:00'),
('Química Orgânica', 'Profa. Marie Curie', 'Segunda e Quarta, 10:00-12:00'),
('Literatura Brasileira', 'Prof. Machado Assis', 'Terça e Quinta, 14:00-16:00'),
('Inglês Intermediário', 'Profa. Shakespeare Silva', 'Quarta e Sexta, 08:00-10:00'),
('Educação Física', 'Prof. Pelé Oliveira', 'Segunda e Quinta, 16:00-18:00');

-- =====================
-- RECOMPENSAS
-- =====================
INSERT INTO public.rewards (name, description, points_cost, is_active) VALUES
('Mentoria de Redação', 'Sessão individual de 30 minutos com professor especialista', 50, true),
('Curso de Git e GitHub', 'Acesso completo ao curso introdutório de versionamento', 80, true),
('Material de Matemática', 'Apostila premium com exercícios resolvidos', 60, true),
('Sessão de Tutoria', 'Aula particular de 1 hora em qualquer disciplina', 100, true),
('Livro Digital', 'E-book de literatura ou técnico à sua escolha', 40, true),
('Certificado de Mérito', 'Certificado de reconhecimento acadêmico', 150, true),
('Acesso Biblioteca Virtual', 'Acesso premium por 3 meses à biblioteca digital', 120, true),
('Workshop de Programação', 'Participação em workshop exclusivo', 200, true),
('Kit Papelaria Premium', 'Cadernos, canetas e material de qualidade', 70, true),
('Hora Extra de Lab', 'Tempo adicional no laboratório de informática', 30, true);

-- =====================
-- NOTÍCIAS
-- =====================
INSERT INTO public.news (title, category, content, link) VALUES
('Novo Sistema de Pontos Implementado', 'Novidades', 'O sistema Incentive+ agora permite que alunos ganhem pontos por participação ativa em aulas e feedbacks. Confira as novidades!', NULL),
('Prazo para Matrícula Estendido', 'Avisos', 'O prazo para matrícula nas disciplinas do próximo semestre foi estendido até o final do mês.', NULL),
('Palestra sobre Carreira Tech', 'Eventos', 'No dia 20/12 teremos uma palestra especial sobre carreiras em tecnologia. Inscrições abertas!', 'https://exemplo.com/palestra'),
('Novos Cursos Disponíveis', 'Cursos', 'Foram adicionados novos cursos de programação e desenvolvimento web ao catálogo de recompensas.', NULL),
('Manutenção do Sistema', 'Avisos', 'O sistema ficará em manutenção no sábado das 00h às 06h para melhorias de performance.', NULL);

-- =====================
-- DICAS
-- =====================
INSERT INTO public.tips (title, content, link) VALUES
('Como Estudar Matemática', 'Pratique diariamente! A consistência é mais importante que longas sessões de estudo. Reserve 30 minutos todos os dias para resolver exercícios.', NULL),
('Dicas de Redação', 'Leia bastante e escreva sempre. A prática leva à perfeição. Peça feedback dos seus professores.', NULL),
('Organize seu Tempo', 'Use técnicas como Pomodoro: estude por 25 minutos e descanse 5. Após 4 ciclos, descanse 15-30 minutos.', NULL),
('Aprenda Programação', 'Comece com projetos pequenos e práticos. A melhor forma de aprender é fazendo!', 'https://exemplo.com/programacao'),
('Técnicas de Memorização', 'Use flashcards e mapas mentais. A repetição espaçada é comprovadamente eficaz para memorização de longo prazo.', NULL),
('Prepare-se para Provas', 'Revise o conteúdo regularmente, não deixe para última hora. Faça simulados e teste seus conhecimentos.', NULL);
