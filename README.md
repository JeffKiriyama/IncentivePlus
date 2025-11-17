# 🚀 Incentive+

**Plataforma de Gamificação Educacional para Engajamento de Alunos**

O **Incentive+** é um sistema completo de gamificação educacional que utiliza pontos, recompensas e feedback para aumentar o engajamento dos alunos em atividades escolares. O projeto simula um ambiente virtual onde o estudante ganha pontos por participação e pode trocá-los por benefícios educacionais.

Este projeto é **Full-Stack**, composto por:

* **Front-end:** Next.js (React)
* **Back-end:** Node.js (Express) + MySQL

---

## ✨ Funcionalidades Principais

O sistema opera com três perfis:

### 🎓 Aluno

* Dashboard com saldo e atividades.
* Visualização e matrícula em disciplinas.
* Envio de feedback (1–5 estrelas) gerando **+10 pontos**.
* Loja de recompensas (cursos, mentorias etc.).
* Resgates com status (pendente, aprovado, negado).
* Histórico completo de transações.

### 👨‍🏫 Professor

* Dashboard com estatísticas das disciplinas.
* Listagem das disciplinas ministradas.
* Visualização de alunos matriculados e feedbacks recebidos.

### ⚙️ Administrador

* Dashboard geral do sistema.
* Gerenciamento de usuários.
* Cadastro e controle de recompensas.
* Aprovação/negação de resgates com devolução de pontos.
* Publicação de notícias e dicas.

---

## 🛠️ Tecnologias Utilizadas

### **Back-end**

* Node.js
* Express.js
* MySQL (XAMPP)
* mysql2
* JWT (autenticação)
* bcrypt.js (hash de senha)

### **Front-end**

* Next.js (App Router)
* React + TypeScript
* Tailwind CSS
* shadcn/ui
* fetch API centralizada em `lib/api.ts`

---

## 📁 Estrutura do Projeto

```
/
├── back-end/
│   ├── src/
│   │   ├── controllers/      # Lógica de negócios
│   │   ├── routes/           # Rotas da API
│   │   ├── middleware/       # Autenticação (JWT)
│   │   ├── config/
│   │   │   └── db.js         # Conexão MySQL
│   │   └── server.js         # Entrada da API
│   ├── .env                  # Variáveis de ambiente
│   └── package.json
│
└── front-end/
    ├── app/
    │   ├── (admin)/          # Área do Admin
    │   ├── (aluno)/          # Área do Aluno
    │   ├── (professor)/      # Área do Professor
    │   ├── auth/             # Login/Cadastro
    │   └── page.tsx          # Página Inicial
    ├── components/
    │   ├── ui/               # shadcn/ui
    │   └── navigation.tsx    # Barra de navegação
    ├── lib/
    │   └── api.ts            # Conexão com o back-end
    ├── .env.local
    └── package.json
```

---

## ⚙️ Instalação e Execução

### 1. Pré-requisitos

* Node.js 20+
* XAMPP (MySQL)
* MySQL Workbench

---

## 2. Configuração do Banco de Dados (MySQL)

No Workbench:

1. Inicie o MySQL pelo XAMPP
2. Execute:

```sql
CREATE DATABASE IF NOT EXISTS incentive;
USE incentive;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('aluno','professor','admin') NOT NULL,
  points_balance INT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disciplines (
  discipline_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  teacher_name VARCHAR(120) NOT NULL,
  schedule_info VARCHAR(200),
  teacher_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  user_id INT NOT NULL,
  discipline_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, discipline_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (discipline_id) REFERENCES disciplines(discipline_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedbacks (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  discipline_id INT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (discipline_id) REFERENCES disciplines(discipline_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rewards (
  reward_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  points_cost INT NOT NULL CHECK (points_cost > 0),
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS redemptions (
  redemption_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('pendente','aprovado','negado','cancelado') DEFAULT 'pendente',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  admin_notes TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS redemption_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  redemption_id INT NOT NULL REFERENCES redemptions(redemption_id) ON DELETE CASCADE,
  reward_id INT NOT NULL REFERENCES rewards(reward_id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  points_spent INT NOT NULL CHECK (points_spent > 0)
);

CREATE TABLE IF NOT EXISTS points_transactions (
  tx_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tx_type ENUM('credito','debito') NOT NULL,
  points_delta INT NOT NULL,
  reason VARCHAR(200),
  ref_table VARCHAR(50),
  ref_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS news (
  news_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(60),
  content TEXT,
  link VARCHAR(400),
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tips (
  tip_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  link VARCHAR(400),
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Para popular o banco com dados de teste, use:
`front-end/scripts/002_seed_data.sql`

---

## 3. Rodando o Back-end (porta 4000)

```bash
cd back-end
```

Crie `.env`:

```
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=incentive
JWT_SECRET=um_segredo_bem_grande_e_dificil
JWT_EXPIRES_IN=1d
```

Instale e execute:

```bash
npm install
npm run dev
```

A API deve iniciar em:

```
http://localhost:4000
```

---

## 4. Rodando o Front-end (porta 3000)

```bash
cd front-end
```

Crie `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Instale as dependências:

```bash
npm install --legacy-peer-deps
npm run dev
```

Acesse:

```
http://localhost:3000
```

---

## 📚 Licença

Este projeto pode ser utilizado para fins educacionais e acadêmicos.
Para outros usos, consulte o autor.
