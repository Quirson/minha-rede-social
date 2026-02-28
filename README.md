<!--
████████████████████████████████████████████████████████████████████████████
  SOCIAL DEAL — REDE SOCIAL FULL-STACK
  Next.js · TypeScript · PostgreSQL · NextAuth · TailwindCSS
  Trabalho Académico · ISCTEM · Quirson Fernando Ngale
████████████████████████████████████████████████████████████████████████████
-->

<!-- HEADER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:060612,40:1e1b4b,100:6366f1&height=220&section=header&text=Social%20Deal&fontSize=72&fontColor=ffffff&fontAlignY=40&desc=Rede%20Social%20Full-Stack%20%7C%20Next.js%20%C2%B7%20TypeScript%20%C2%B7%20PostgreSQL&descSize=17&descAlignY=62&animation=fadeIn" width="100%"/>

<div align="center">

<a href="https://github.com/Quirson">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=20&duration=2800&pause=1000&color=6366F1&center=true&vCenter=true&repeat=true&width=700&height=55&lines=Rede+Social+Completa+%F0%9F%9A%80;Posts+%C2%B7+Feed+%C2%B7+Likes+%C2%B7+Coment%C3%A1rios;Chat+em+Tempo+Real+%F0%9F%92%AC;Seguidores+%2B+Perfis+de+Utilizador;Autenticac%CC%A7a%CC%83o+NextAuth+%F0%9F%94%90;Trabalho+Acade%CC%81mico+%E2%80%94+ISCTEM+2024" alt="Typing SVG"/>
</a>

<br/><br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white&labelColor=060612)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=060612)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=060612)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=060612)](https://www.postgresql.org)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-purple?style=for-the-badge&logo=auth0&logoColor=white&labelColor=060612)](https://next-auth.js.org)

[![Status](https://img.shields.io/badge/Status-Concluído-22c55e?style=for-the-badge&labelColor=060612)]()
[![Type](https://img.shields.io/badge/Tipo-Trabalho_Académico-6366f1?style=for-the-badge&labelColor=060612)]()
[![Institution](https://img.shields.io/badge/ISCTEM-Eng._Informática-a855f7?style=for-the-badge&labelColor=060612)]()

</div>

---

## `> cat README.social_deal`

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║   Social Deal é uma rede social full-stack construída de raiz            ║
║   como trabalho final da cadeira de Programação Web no ISCTEM.           ║
║                                                                          ║
║   Funcionalidades completas: autenticação, feed de posts, likes,         ║
║   comentários, sistema de follows, perfis de utilizador e chat           ║
║   em tempo real — tudo num só projeto Next.js com TypeScript.            ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## `> ls ./features --icons`

<div align="center">

|  | Funcionalidade | Descrição |
|:---:|:---|:---|
| 📰 | **Feed Dinâmico** | Timeline personalizada com posts dos utilizadores seguidos |
| 👤 | **Perfis de Utilizador** | Página de perfil com bio, avatar, seguidores e publicações |
| ❤️ | **Likes & Reações** | Sistema de likes em posts e comentários em tempo real |
| 💬 | **Comentários** | Thread de comentários aninhados por post |
| ➕ | **Follows / Seguidores** | Sistema completo de seguir/deixar de seguir utilizadores |
| 💌 | **Chat / Mensagens** | Chat privado entre utilizadores |
| 🔐 | **Autenticação** | Login seguro via NextAuth.js (OAuth + credenciais) |
| 🔔 | **Notificações** | Alertas de likes, comentários e novos seguidores |

</div>

---

## `> cat ARCHITECTURE.md`

```
social-deal/
├── src/
│   ├── app/                    ← App Router (Next.js 15)
│   │   ├── (auth)/             ← Login · Register
│   │   ├── feed/               ← Timeline principal
│   │   ├── profile/[username]/ ← Página de perfil dinâmica
│   │   ├── messages/           ← Chat privado
│   │   ├── api/                ← REST API routes
│   │   │   ├── auth/[...nextauth]/ ← NextAuth handler
│   │   │   ├── posts/          ← CRUD posts
│   │   │   ├── users/          ← Perfis e follows
│   │   │   └── messages/       ← Mensagens
│   │   └── layout.tsx          ← Root layout
│   ├── components/
│   │   ├── ui/                 ← Componentes base (Tailwind)
│   │   ├── feed/               ← PostCard, FeedList, StoryBar
│   │   ├── profile/            ← ProfileHeader, FollowButton
│   │   └── chat/               ← ChatWindow, MessageBubble
│   ├── lib/
│   │   ├── db.ts               ← PostgreSQL connection
│   │   ├── auth.ts             ← NextAuth config
│   │   └── utils.ts            ← Helpers
│   └── types/                  ← TypeScript interfaces
├── public/                     ← Assets estáticos
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## `> show TECH_STACK`

<div align="center">

### Frontend
![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

### Backend & API
![Next.js API](https://img.shields.io/badge/Next.js_API_Routes-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-8B5CF6?style=for-the-badge)
![REST API](https://img.shields.io/badge/REST_API-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

### Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### Tooling
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

</div>

---

## `> schema --database`

```sql
-- Principais tabelas PostgreSQL

CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   VARCHAR(30) UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  bio        TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content    TEXT NOT NULL,
  author_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE likes (
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id  UUID REFERENCES posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE follows (
  follower_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  sent_at     TIMESTAMP DEFAULT NOW()
);
```

---

## `> npm run setup`

```bash
# 1. Clonar o repositório
git clone https://github.com/Quirson/social-deal.git
cd social-deal

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local:
# DATABASE_URL="postgresql://user:password@localhost:5432/socialdeal"
# NEXTAUTH_SECRET="your-secret-key"
# NEXTAUTH_URL="http://localhost:3000"

# 4. Configurar a base de dados
npx prisma migrate dev
# ou executar os scripts SQL manualmente

# 5. Iniciar o servidor de desenvolvimento
npm run dev
# → http://localhost:3000
```

---

## `> env --required`

```bash
# .env.local

# Base de Dados
DATABASE_URL="postgresql://user:password@host:5432/socialdeal"

# NextAuth
NEXTAUTH_SECRET="super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (opcional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

---

## `> git log --author="Quirson"`

<div align="center">

```
commit f53aa5a — Docente (3 months ago)
commit a2c3b1d — Actualizacao Front-End (4 months ago)  
commit 9e1f8c2 — Initial commit (5 months ago)

Author: Quirson Fernando Ngale <quirsonngale@gmail.com>
Institution: ISCTEM — Computer Engineering
Subject: Programação Web
Year: 2024
```

<br/>

**Desenvolvido com 💜 por [Quirson Fernando Ngale](https://github.com/Quirson)**

[![Portfolio](https://img.shields.io/badge/Portfolio-quirsonngale.dev-6366f1?style=for-the-badge&labelColor=060612)](https://www.quirsonngale.dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white&labelColor=060612)](https://www.linkedin.com/in/quirson-fernando-ngale)
[![GitHub](https://img.shields.io/badge/GitHub-@Quirson-ffffff?style=for-the-badge&logo=github&logoColor=white&labelColor=060612)](https://github.com/Quirson)

*Engenharia Informática · ISCTEM · Maputo, Moçambique 🇲🇿*

</div>

<!-- FOOTER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,40:1e1b4b,100:060612&height=120&section=footer" width="100%"/>
