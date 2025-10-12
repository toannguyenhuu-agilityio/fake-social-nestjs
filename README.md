<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" /></a>
</p>

<p align="center">
A <strong>NestJS</strong> backend API for a fake social media application, featuring <strong>user authentication, posts, and comments</strong> with JWT-based cookie authentication.
</p>

  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Fake Social NestJS is a backend API built with NestJS
, designed to power a simple social media platform.
It provides JWT-based authentication , user management, and full CRUD operations for posts and comments.
The project uses PostgreSQL as the database and Prisma ORM for database access and schema management.

## Features

- **User Management**
  - Sign-up / Sign-in
  - JWT-based authentication with cookies
  - Refresh and logout endpoints
- **Posts**
  - Create, Read, Update, Delete (CRUD)
  - Pagination for listing posts
  - Author-based access control
- **Comments**
  - Create, Read, Update, Delete (CRUD)
  - Author-based access control
- **Swagger Documentation**
  - Auto-generated API docs
- **Testing**
  - Unit tests for services and controllers
  - E2E tests for authentication, posts, and comments
- **Database**
  - PostgreSQL via Prisma ORM
  - Docker support for local development

## Prerequisites

- Node.js >= 20
- pnpm (or npm/yarn)
- Docker & Docker Compose (for local DB)

## Clone Repository

```bash
# Clone the repo
$ git clone https://github.com/toannguyenhuu-agilityio/fake-social-nestjs.git

# Go into project folder
$ cd fake-social-nestjs
```

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```bash
# Database configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_passwrord
POSTGRES_DB=fake_social_db
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"

# JWT authentication
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_jwt_refresh_secret"

# Optional: Server port
PORT=3000
```

## Run the Project with Docker

### Development

```bash
# Build Docker image
$ docker build -t fake-social-nestjs .

# Start PostgreSQL + NestJS containers
$ docker-compose -f compose.dev.yml up -d
```

### Production

```bash
# Build Docker image
$ docker build -t fake-social-nestjs .

# Run container (expose port 3000)
$ docker run -p 3000:3000 --env-file .env fake-social-nestjs

# Or using Docker Compose
$ docker-compose -f compose.yml up -d
```

#### Notes

- Make sure .env is configured with production variables (DB, JWT secret, etc.)

- Use docker-compose.prod.yml for orchestrating multiple services (app, PostgreSQL, Redis, etc.)

- You can attach a volume for persistent DB storage in production

## Database Migrations

```bash
# Initialize Prisma client
$ npx prisma init --db --output ../generated/prisma

# Generate Prisma migration
$ pnpm prisma migrate dev --name init

# Apply migrations
$ pnpm prisma migrate deploy
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## API Documentation

Swagger is enabled and can be accessed in development:

```bash
http://localhost:3000/api
```

It provides detailed documentation for all endpoints:

- /auth → login, refresh, logout

- /users → CRUD for users

- /posts → CRUD for posts

- /comments → CRUD for comments

## Project Structure

```bash
src/
├─ auth/          # JWT auth, guards, DTOs
├─ users/         # Users CRUD
├─ posts/         # Posts CRUD
├─ comments/      # Comments CRUD
├─ prisma/        # Prisma client
├─ shared/        # Common DTOs, constants, decorators
├─ app.module.ts
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- [NestJS Documentation](https://nestjs.com/)

- [Prisma Docs](https://www.prisma.io/docs)

- [Swagger Docs](https://swagger.io/docs/)

- [Testing with Jest](https://jestjs.io/docs/getting-started)

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

This project is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
