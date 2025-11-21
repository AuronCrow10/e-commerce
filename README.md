# CryptoShields E-commerce Platform

Ecommerce platform with fully configurable navigation, admin-managed catalog, authentication, cart and Stripe-based checkout.

## Features

- **Dynamic Product Catalog**: Administrators can manage brands, categories, subcategories, materials, and product models through a dedicated admin panel.
- **Secure Admin Panel**: JWT-based authentication ensures that only authorized administrators can access and manage the store.
- **Shopping Cart**: Users can add products to a shopping cart for purchase.
- **Multiple Payment Gateways**:
    - **Stripe**: Seamless credit card payments powered by Stripe.
    - **Cryptocurrency**: Pay with USDT or USDC via a Web3 wallet (e.g., MetaMask).
- **Order Management**: View and manage customer orders through the admin dashboard.
- **RESTful API**: A well-structured backend API for managing all platform functionalities.

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL, Sequelize ORM
- **Frontend**: React, Material-UI, React Router
- **Payments**: Stripe API, Ethers.js

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- Node.js (v14 or later)
- npm
- PostgreSQL database

### Backend Setup

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and add the following variables. Replace the values with your own.
    ```env
    PORT=5000
    DATABASE_URL=postgres://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/YOUR_DB_NAME
    JWT_SECRET=your_super_secret_jwt_key
    STRIPE_SECRET_KEY=your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
    STIPE_BILLING_ENABLED=false
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    FRONTEND_URL=http://localhost:3000
    ```

4.  **Run the database migrations:**
    The application uses Sequelize and will attempt to sync models on startup. Ensure your PostgreSQL server is running and accessible via the `DATABASE_URL`.

5.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The backend server will be running on `http://localhost:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```sh
    cd frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `frontend` directory and add the following variables.
    ```env
    REACT_APP_API_URL=/api
    REACT_APP_BACKEND_URL=http://localhost:5000
    REACT_APP_FRONTEND_URL=http://localhost:3000
    REACT_APP_USDT_ADDRESS=YOUR_USDT_CONTRACT_ADDRESS
    REACT_APP_USDC_ADDRESS=YOUR_USDC_CONTRACT_ADDRESS
    REACT_APP_RECEIVER_ADDRESS=YOUR_CRYPTO_RECEIVER_WALLET_ADDRESS
    ```

4.  **Start the React application:**
    ```sh
    npm start
    ```
    The frontend will be available at `http://localhost:3000`.
