# Clínica Médica SPP

`Clínica Médica SPP` é um sistema completo para agendamento de consultas médicas, construído com uma arquitetura moderna de frontend móvel e backend robusto. A aplicação permite que os pacientes visualizem profissionais, agendem, gerenciem e cancelem suas consultas de forma intuitiva.

## ✨ Funcionalidades

* **Autenticação de Usuário:** Sistema seguro de login e registro com tokens JWT.
* **Dashboard do Paciente:** Painel central para visualizar próximas consultas e consultas passadas.
* **Agendamento de Consultas:** Um fluxo completo para marcar novas consultas com profissionais disponíveis.
* **Listagem de Profissionais:** Visualize todos os profissionais, com a capacidade de filtrar por especialidade.
* **Gerenciamento de Perfil:** Os usuários podem visualizar e gerenciar suas informações de perfil.
* **Cancelamento de Agendamentos:** Opção para que os pacientes cancelem suas consultas agendadas.

## 🚀 Tecnologias Utilizadas

Este projeto é um monorepo dividido em duas partes principais: `frontend` e `backend`.

### Frontend (Mobile - React Native)

| Tecnologia | Descrição |
| :--- | :--- |
| **React Native (Expo)** | Framework para desenvolvimento de aplicações móveis nativas. |
| **React Navigation** | Para gerenciamento de rotas e navegação entre telas. |
| **React Native Paper**| Biblioteca de componentes de UI baseada no Material Design. |
| **Axios** | Cliente HTTP para realizar requisições à API do backend. |
| **AsyncStorage** | Para armazenamento local seguro de dados, como tokens de autenticação. |

### Backend (API - Node.js)

| Tecnologia | Descrição |
| :--- | :--- |
| **Node.js** | Ambiente de execução JavaScript no servidor. |
| **Express.js** | Framework web para a construção da API RESTful. |
| **Sequelize** | ORM (Object-Relational Mapper) para interagir com o banco de dados. |
| **MySQL2 (ou outro)**| Driver do banco de dados relacional. Pode ser adaptado para PostgreSQL, SQLite, etc. |
| **JSON Web Token (JWT)**| Para autenticação e autorização baseada em tokens. |
| **Bcrypt.js** | Para a criptografia segura de senhas de usuários. |
| **Dotenv** | Para gerenciar variáveis de ambiente de forma segura. |

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

* [Node.js](https://nodejs.org/) (versão LTS recomendada)
* [Yarn](https://yarnpkg.com/) ou [NPM](https://www.npmjs.com/)
* [Expo Go](https://expo.dev/client) (aplicativo no seu celular para testar o frontend)
* Um servidor de banco de dados SQL (ex: MySQL, PostgreSQL, MariaDB).

## ⚙️ Instalação e Execução

Siga os passos abaixo para configurar e executar o projeto localmente.

### 1. Configurando o Backend

Primeiro, vamos configurar e iniciar o servidor da API.

```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. Instale as dependências
npm install
````

**Configuração do Banco de Dados:**

1.  Crie um arquivo `.env` na raiz da pasta `backend`, baseado no arquivo `config/database.js`.

2.  Adicione as seguintes variáveis de ambiente ao seu arquivo `.env`, substituindo com suas credenciais:

    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=sua_senha_secreta
    DB_NAME=clinica_spp
    DB_DIALECT=mysql

    JWT_SECRET=seu_segredo_jwt_super_secreto
    ```

3.  Certifique-se de ter criado um banco de dados com o nome que você especificou em `DB_NAME`.

4.  O Sequelize irá sincronizar os modelos com o banco de dados automaticamente ao iniciar o servidor.

**Iniciando o Servidor:**

```bash
# Inicie o servidor em modo de desenvolvimento (com auto-reload)
npm run dev

# Ou inicie em modo de produção
npm start
```

O servidor backend estará rodando em `http://localhost:3000`.

### 2\. Configurando o Frontend

Agora, vamos configurar e iniciar o aplicativo móvel.

```bash
# 1. Em um novo terminal, navegue até a pasta do frontend
cd frontend

# 2. Instale as dependências
npm install
```

**Conexão com a API:**

1.  Abra o arquivo `frontend/src/services/api.js`.

2.  Certifique-se de que a `baseURL` corresponde ao endereço do seu servidor backend. Se estiver rodando localmente no mesmo computador, pode ser necessário usar o seu IP local em vez de `localhost` para que o aplicativo no celular consiga acessá-lo.

    ```javascript
    // Exemplo em frontend/src/services/api.js
    const api = axios.create({
      baseURL: 'http://SEU_IP_LOCAL:3000/api', // Ex: [http://192.168.1.10:3000/api](http://192.168.1.10:3000/api)
    });
    ```

**Iniciando o Aplicativo:**

```bash
# Inicie o servidor de desenvolvimento do Expo
npx expo start
```

Um QR code será exibido no seu terminal. Abra o aplicativo **Expo Go** no seu celular e escaneie o QR code para carregar o aplicativo.

## 📂 Estrutura do Projeto

```
/
├── backend/        # Código-fonte da API Node.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
└── frontend/       # Código-fonte do aplicativo React Native (Expo)
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── navigation/
    │   ├── screens/
    │   └── services/
    └── App.js
```