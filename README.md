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

### 1. **Authentication**
   - **Description**: Provides secure login, logout, and token-based authentication using JWT.
   - **APIs**:
     - `POST /auth/login`: Authenticate a user with email and password.
     - `POST /auth/logout`: Logout a user and invalidate the refresh token.
     - `POST /auth/refresh-token`: Generate a new access token using a valid refresh token.

### 2. **Media Management**
   - **Description**: Allows users to upload, process, and store media files. Extracts metadata from PDF files and stores it in the database.
   - **APIs**:
     - `POST /media/upload`: Upload media files (e.g., PDFs) to AWS S3 and extract metadata.
     - `GET /media/:id`: Retrieve metadata and details of a specific media file.
     - `GET /medias`: Retrieve all metadata of all uploaded files.
     - `DELETE /media/:id`: Delete a media file from AWS S3 and the database.

### 3. **AWS Integration**
   - **Description**: Uses AWS S3 for secure and scalable file storage.
   - **APIs**:
     - Integrated into the `POST /media/upload` API for uploading files to S3.
     - Automatically generates a public URL for accessing uploaded files.

### 4. **PDF Metadata Extraction**
   - **Description**: Extracts metadata such as title, author, and number of pages from uploaded PDF files using the `pdf-parse` library.
   - **APIs**:
     - Integrated into the `POST /media/upload` API to extract metadata during the upload process.

### 5. **Role-Based Access Control**
   - **Description**: Manages user roles (e.g., ADMIN, EDITOR) and permissions for accessing specific APIs.
   - **APIs**:
     - Middleware or guards are applied to APIs to restrict access based on roles.

### 6. **Ingestion Service**
   - **Description**: Triggers an external ingestion service to process uploaded data.
   - **APIs**:
     - Integrated into the `POST /media/upload` API to notify the ingestion service after a successful upload.

### 7. **Unit and Integration Testing**
   - **Description**: Comprehensive test coverage using Jest for unit tests.
   - **APIs**:
     - testing is internal to the project.

---

# Ingestion Service

## Description
The **Ingestion Service** is responsible for processing uploaded files once they are stored on the server. Once a file is uploaded, the system triggers an ingestion process to analyze the file and extract meaningful data. The progress of the ingestion can be monitored using the provided APIs.

---

## 1. **Ingestion Trigger API**

The **Ingestion Trigger API** is the entry point for initiating the data ingestion process. This API listens for incoming requests to start the ingestion, which can involve invoking mock service that simulates the ingestion process.

### Key Functions:
- **Triggering Ingestion:**  
  The API accepts an HTTP POST request containing essential parameters, such as documentId, to initiate the ingestion process.
  
- **Communication with Mock Service:**  
  Once the request is received, the Ingestion Trigger API communicates with a mock service (for testing purposes). This service processes the data, potentially involving fetching, transforming, and loading operations.

- **Response:**  
  Upon successfully triggering the ingestion process, the API returns a confirmation message, including a documentID, status (Processing) and a status code. This ID allows for monitoring and tracking the progress, handling retries, and ensuring the process completes correctly.

---

## 2. **Tracking Ingestion Status in the Database**

After the ingestion process is triggered, it is important to track the status of each ingestion job. This enables visibility into the process, ensuring that any issues can be detected early.

### Key Functions:
- **Database Design:**  
  The **`ingestion_status`** table will store metadata about each ingestion process. Each record will represent a unique ingestion task with the following fields:
  - **Ingestion ID**
  - **Source Data Information**
  - **Current Status** (e.g., `in-progress`, `completed`, `failed`)
  - **Error Details** (if applicable)
  - **Retry Count** (number of retries performed)

- **Status Updates:**  
  The status of each ingestion will be updated during its lifecycle:
  - **`in-progress`**: The ingestion is currently being processed.
  - **`completed`**: The ingestion process was completed successfully.
  - **`failed`**: An error occurred during the ingestion process.

- **Retry Tracking:**  
  If the ingestion fails, the system will attempt to retry. The retry count will be tracked in the database, and the process will only continue until a predefined retry limit is reached.

- **Database Interaction:**  
  The database will be accessed via an ORM (Object-Relational Mapping) tool or direct SQL queries. The ingestion service will regularly check the status of each ingestion and update the database accordingly.

---

## 3. **Ingestion Management API**

The **Ingestion Management API** provides an interface for checking the progress of the ongoing ingestion process. This API helps in monitoring the status of individual ingestion jobs and retrieving relevant details for reporting or debugging purposes.

### Key Functions:
- **Querying Ingestion Status:**  
  This API will allow clients (users or other systems) to check the current status of an ingestion process using a unique **Document ID**. It will return information such as:
  - The current state of the ingestion (e.g., `in-progress`, `completed`, `failed`)
  - Any error messages (if the process failed)

- **Progress Reporting:**  
  If applicable, the API can also return information about the progress of the ingestion. This can help users or systems monitor the efficiency of the ingestion process.

- **Error Handling:**  
  If the ingestion has failed, this API will provide detailed error messages to help diagnose and resolve the issue. The system may also provide guidance on potential causes of failure and solutions (e.g., missing data, timeout, network issues).

---

## 4. **Error Handling & Retries**

Handling errors and implementing retries is crucial to ensure that the ingestion process is resilient and fault-tolerant. This section defines how the system should handle failures and how it can automatically retry the ingestion in case of issues.

### Key Functions:
- **Error Detection:**  
  If any errors occur during the ingestion process (e.g., network timeout, data validation errors, database errors), the system should log these errors in the database and change the ingestion status to **failed**.

- **Retry Logic:**  
  To ensure reliability, the system should attempt to retry the ingestion a defined number of times before failing permanently. The retry mechanism could involve:
  - Exponential backoff (waiting progressively longer between retries)
  - Fixed number of retries

- **Retry Limits:**  
  A retry counter is maintained in the database for each ingestion job. The system will stop retrying once the maximum retry limit is reached. After that, the job will be marked as **failed**, and an error message will be returned to the user or system.

---

## Usage

1. **Trigger the Ingestion:**
   - Send a `POST` request to the **Ingestion Trigger API** with the required parameters (e.g., document Id).
   - The system will return a **documentId** for monitoring.

2. **Track the Status:**
   - Use the **Ingestion Management API** to check the current status of the ingestion using the docuemnt ID.
   - The API will provide updates on the current state and error details (if any).

3. **Handle Errors and Retries:**
   - If an error occurs during the ingestion process, the system will automatically retry based on the defined retry logic.
   - After the maximum retry limit is reached, the ingestion will be marked as **failed**, and notifications will be triggered if configured.

---

## Conclusion

The **Ingestion Service** ensures that the data ingestion process is efficient, reliable, and can handle any potential failures. With proper tracking, error handling, and retry mechanisms in place, this service allows users to confidently upload files and monitor the ingestion process, making it resilient and fault-tolerant.


### APIs for Ingestion Monitoring

1. **Trigger Ingestion**
   - **Endpoint**: `POST /ingestion/trigger/:documentId`
   - **Description**: Triggers the ingestion process for a specific document by its ID.
   - **Example**:
     ```bash
     curl -X POST http://localhost:3000/ingestion/trigger/123
     ```

2. **Get Ingestion Status**
   - **Endpoint**: `GET /ingestion/status/:documentId`
   - **Description**: Retrieves the current status of the ingestion process for a specific document.
   - **Example**:
     ```bash
     curl http://localhost:3000/ingestion/status/123
     ```

3. **Get Mock Embedding**
   - **Endpoint**: `GET /ingestion/embedding/:documentId`
   - **Description**: Retrieves mock embedding data for a specific document after ingestion.
   - **Example**:
     ```bash
     curl http://localhost:3000/ingestion/embedding/123
     ```


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

