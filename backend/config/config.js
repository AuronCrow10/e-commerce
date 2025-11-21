require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL, // e.g., postgres://postgres:yourpassword@localhost:5432/ecommerce_db
    dialect: 'postgres'
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres'
  }
};
