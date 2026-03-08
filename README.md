# 💊 MediTrack

Sistema web para controle pessoal de remédios. Cada usuário gerencia seus próprios medicamentos de forma isolada — cadastro de remédios, registro de doses, controle de estoque e histórico completo.

---

## Stack

**Backend** — Django 5 · Django REST Framework · SimpleJWT · SQLite  
**Frontend** — Next.js 14 (App Router) · Tailwind CSS · Axios  

---

## Funcionalidades

- Autenticação com JWT (register, login, logout)
- Cadastro de medicamentos com horários, dosagem e estoque
- Registro de doses com desconto automático de estoque
- Alerta visual de estoque baixo
- Dashboard diário com indicador de adesão
- Histórico de doses com filtros por remédio e data
- Dados completamente isolados por usuário

---

## Como rodar localmente

### Pré-requisitos

- Python 3.12+
- Node.js 18+

### Backend

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/meditrack.git
cd meditrack

# 2. Crie e ative o ambiente virtual
python3 -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com sua SECRET_KEY

# 5. Rode as migrations
python manage.py migrate

# 6. Crie um superusuário (opcional)
python manage.py createsuperuser

# 7. Suba o servidor
python manage.py runserver
```

API disponível em `http://localhost:8000`

### Frontend

```bash
# Em outro terminal, dentro da pasta frontend/
cd frontend
npm install
npm run dev
```

App disponível em `http://localhost:3000`

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores:

```env
SECRET_KEY=sua-secret-key-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## Estrutura do projeto

```
meditrack/
├── config/          # Configurações do Django
├── usuarios/        # Autenticação JWT
├── medicamentos/    # CRUD de medicamentos
├── doses/           # Registro de doses
├── .env.example     # Template de variáveis de ambiente
├── requirements.txt
└── frontend/        # Next.js App
    ├── app/
    │   ├── login/
    │   ├── register/
    │   ├── dashboard/
    │   ├── medicamentos/
    │   └── historico/
    ├── components/
    ├── hooks/
    └── lib/
```

---

## API — Endpoints principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register/` | Criar conta |
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/medicamentos/` | Listar remédios |
| POST | `/api/medicamentos/` | Cadastrar remédio |
| GET | `/api/medicamentos/hoje/` | Remédios do dia |
| POST | `/api/doses/` | Registrar dose |
| GET | `/api/doses/` | Histórico de doses |

Todos os endpoints (exceto register e login) exigem o header:
```
Authorization: Bearer <access_token>
```

---

## Roadmap

- [ ] Lembretes por e-mail
- [ ] Notificações push no navegador
- [ ] Modo família (dependentes)
- [ ] Relatório PDF de adesão
- [ ] Deploy em produção (PostgreSQL + Vercel + Railway)
