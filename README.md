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