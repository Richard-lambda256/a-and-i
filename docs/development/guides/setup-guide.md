# Development Environment Setup Guide

## Overview
This guide will help you set up your local development environment for the A&I project. Follow these steps to get started.

## Prerequisites
- **Node.js**: v16.x or later
- **npm**: v7.x or later
- **PostgreSQL**: v13.x or later
- **Git**: Latest version

## Step 1: Clone the Repository
1. Open your terminal and navigate to the directory where you want to clone the project.
2. Run the following command to clone the repository:
   ```bash
   git clone <repository-url>
   cd a-and-i
   ```

## Step 2: Install Dependencies
1. Install the project dependencies using npm:
   ```bash
   npm install
   ```

## Step 3: Set Up Environment Variables
1. Create a `.env` file in the root directory of the project.
2. Add the following environment variables to the `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/a_and_i
   API_KEY=your-api-key
   ```
   Replace `username`, `password`, and `your-api-key` with your actual database credentials and API key.

## Step 4: Set Up the Database
1. Ensure your PostgreSQL server is running.
2. Create a new database named `a_and_i`:
   ```bash
   createdb a_and_i
   ```
3. Run the database migrations using Prisma:
   ```bash
   npx prisma migrate dev
   ```

## Step 5: Start the Development Server
1. Start the development server using the following command:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000` to see the application running.

## Additional Notes
- **Hot Reloading**: The development server supports hot reloading, so any changes you make to the code will automatically reflect in the browser.
- **Debugging**: Use the browser's developer tools to debug any issues.
- **Testing**: Run tests using the command `npm test`.

## Troubleshooting
- If you encounter any issues with the database connection, ensure that your PostgreSQL server is running and the credentials in the `.env` file are correct.
- If you have any questions or need further assistance, please refer to the project's documentation or contact the development team.

## Next Steps
- Review the API documentation to understand how to interact with the backend.
- Check the user guide for instructions on how to use the application.
- Explore the project's architecture and design documents for a deeper understanding of the system.