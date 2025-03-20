# JK-Tech

A NestJS-based project that provides authentication, media management, and other core functionalities. This project is designed with modularity and scalability in mind, leveraging TypeScript, TypeORM, and AWS services.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Technologies Used](#technologies-used)

---

## Features

- **Authentication**: Secure login, logout, and token-based authentication.
- **Media Management**: Upload, process, and store media files with metadata extraction.
- **AWS Integration**: Uses AWS S3 for file storage.
- **PDF Metadata Extraction**: Extracts metadata like title, author, and number of pages from PDF files.
- **Role-Based Access Control**: Manage user roles and permissions.
- **Ingestion Service**: Trigger Service for update about Ingestion Data.
- **Unit and Integration Testing**: Comprehensive test coverage using Jest.

---

## Project Structure
```
jk-tech/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   ├── logout.dto.ts
│   │   ├── entities/
│   │   │   ├── refresh-token.entity.ts
│   │   ├── enum/
│   │   │   ├── user.role.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   ├── core/
│   │   ├── common/
│   │   │   ├── common.service.ts
│   │   │   ├── common.service.spec.ts
│   │   ├── jwt-token/
│   │   │   ├── jwt-token.service.ts
│   │   │   ├── jwt-token.service.spec.ts
│   ├── media/
│   │   ├── entities/
│   │   │   ├── media.entity.ts
│   │   ├── media.controller.ts
│   │   ├── media.service.ts
│   │   ├── media.module.ts
│   │   ├── media.service.spec.ts
│   ├── user/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   ├── enum/
│   │   │   ├── user.role.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   ├── user.service.spec.ts
│   ├── app.module.ts
│   ├── main.ts
├── test/
│   ├── jest-e2e.json
├── .eslintrc.js
├── .prettierrc
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── README.md
```
---
## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/jk-tech.git
   cd jk-tech

2. Install dependencies:
   ```bash
    npm install

3. Build the project:
   ```bash
    npm run build

## Environment Variables
Create a .env file in the root directory and configure the following variables:

```bash
DATABASE_URL=your-postgres-db-url
NODE_ENV=development
PORT=3000
AT_SECRET=88735c5e208a155571779b493eaa0134cb7b18b7a8c968b9cfb4a88ca196443e
RT_SECRET=88735c5e208a155571779b493eaa0134cb7b18b7a8c968b9cfb4a88ca196443e
AT_EXPIRY=60d
RT_EXPIRY=60d
OTP_VALIDITY=300
OTP_EXPIRY_IN_MINUTES=5
ISS=url
DEBUG=*
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```
## Usage
Start the Development Server
```bash
npm run start:dev
```

Lint the Code
```bash
npm run lint
```

Testing
Run Unit Tests
```
npm run test
```

## Technologies Used

1. NestJS: Progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
2. TypeScript: A strongly typed programming language that builds on JavaScript.
3. TypeORM: ORM for TypeScript and JavaScript, simplifying database interactions.
4. AWS S3: Cloud storage for file uploads.
5. Jest: Testing framework for unit and integration tests.
6. PDF-Parse: Library for extracting metadata from PDF files.

