# Mini CRM Platform

A modern Mini CRM Platform built with a robust and scalable tech stack, leveraging a monorepo structure for efficient development and management.

## Monorepo Structure

This project utilizes Turborepo to orchestrate a monorepo containing the following distinct applications and shared packages:

-   **`apps/`**: Houses the individual, runnable applications that form the CRM.
    -   **`backend/`**: The core Node.js backend application, responsible for API endpoints, business logic, and data management. Built with **Express.js**.
    -   **`frontend/`**: The user-friendly Next.js frontend application, providing the interface for users to interact with the CRM.
-   **`packages/`**: Contains reusable code and configurations shared across different parts of the project.
    -   **`db/`**: Manages the PostgreSQL database schema using **Prisma**, including schema definition and migrations.
    -   **`ui/`**: A collection of reusable UI components and styling, built with **Tailwind CSS** and **Headless UI**.

## Tech Stack

-   **Monorepo Management**: Turborepo
-   **Frontend**: Next.js
-   **Backend**: Node.js with **Express.js**
-   **Database**: PostgreSQL
-   **ORM (Object-Relational Mapper)**: **Prisma**
-   **Authentication**: **NextAuth.js** (with Google OAuth Provider)
-   **API Documentation**: Postman (https://.postman.co/workspace/My-Workspace~9a33beb8-4275-44d1-814d-583fb2ba4c90/collection/32709758-c8e940e4-fcc3-41f9-9f85-be6d9a652a3a?action=share&creator=32709758)
-   **AI Integration**: **Hugging Face API** (for features like sentiment analysis or automated responses)
-   **Email Service**: SMTP via **Nodemailer**
-   **Shared UI**: **Tailwind CSS** for styling and **Headless UI** for unstyled, accessible UI primitives.

## Getting Started

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git https://github.com/Shivanshu840/crm.git
    cd crm
    ```

2.  **Install dependencies:**
    From the root of the monorepo, run your preferred package manager's install command:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Database Setup:**
    -   Ensure your PostgreSQL server is running.
    -   Create a new database for the project (e.g., `mini_crm_db`). You can use a tool like `psql` or a GUI database client.
    -   Navigate to the `packages/db` directory:
        ```bash
        cd packages/db
        ```
    -   Run the initial Prisma migrations to create the database schema:
        ```bash
        npx prisma migrate dev --name initial_data
        ```
    -   Generate the Prisma Client, which the backend uses to interact with the database:
        ```bash
        npx prisma generate
        ```
    -   Return to the root of the monorepo:
        ```bash
        cd ../..
        ```

4.  **Environment Variables:**

    * **Backend Configuration (`apps/backend/.env`):**
        Create a `.env` file in the `apps/backend/` directory and populate it with your specific configurations:

        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?sslmode=prefer" # e.g., postgresql://postgres:mysecretpassword@localhost:5432/mini_crm_db?sslmode=prefer
        JWT_SECRET="your_strong_jwt_secret_here" # Replace with a strong, unique secret
        PORT=5000
        HUGGINGFACE_API_KEY="yourapikey" # Your Hugging Face API Key
        EMAIL_USER="your-email" # Your email address for sending emails
        EMAIL_PASSWORD="your-password" # Your email password or app-specific password
        EMAIL_HOST="smtp.example.com" # Your SMTP host
        EMAIL_PORT=587
        EMAIL_SECURE=true # Use true if your SMTP provider uses SSL/TLS
        ```

    * **Frontend Configuration (`apps/frontend/.env.local`):**
        Create a `.env.local` file in the `apps/frontend/` directory and configure the following variables:

        ```env
        NEXT_PUBLIC_API_URL=http://localhost:5000/api
        NEXTAUTH_URL=http://localhost:3000
        NEXTAUTH_SECRET="your_strong_nextauth_secret_here" # Generate one: openssl rand -hex 32
        GOOGLE_CLIENT_ID="your-google-client-id-here" # Your Google OAuth Client ID
        GOOGLE_CLIENT_SECRET="your-google-client-secret-here" # Your Google OAuth Client Secret
        ```

        **Important Security Notes:**
        * **Never commit your `.env` or `.env.local` files to Git.** Ensure they are added to your `.gitignore` file to prevent accidental exposure of sensitive information.
        * For `JWT_SECRET` and `NEXTAUTH_SECRET`, generate cryptographically strong, unique random strings.

### Running the Development Servers

1.  **To run all applications in development mode concurrently (from the root of the monorepo):**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

2.  **To run a specific application in development mode (e.g., the frontend):**
    ```bash
    npm run dev --filter=frontend
    # or
    yarn workspace frontend dev
    # or
    pnpm --filter frontend dev
    ```

    -   The Next.js frontend will typically be accessible at `http://localhost:3000`.
    -   The Node.js backend API will typically be accessible at `http://localhost:5000`.

## Building for Production

To build the applications for production deployment, run the following command from the root of the monorepo:

```bash
npm run build
# or
yarn build
# or
pnpm build