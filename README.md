# 💰 Expense Management System (Backend)

A complete **MERN-based Expense Management System** backend built using **Node.js, Express, MongoDB, and JWT Authentication**.  
This backend helps users securely manage their **income, expenses, budgets, goals, and notifications**, with features like **auto budget tracking**, **token refresh**, and **email-based password reset**.

---

## 🚀 Features

✅ Secure **JWT Authentication** with access & refresh tokens  
✅ **Token Refresh Flow** to prevent expiry interruptions  
✅ **Expense & Income Management**  
✅ **Budgets with Auto Alerts** when 80% of limit is spent  
✅ **Savings & Goals Tracking**  
✅ **Notifications for Spending & Due Dates**  
✅ **Password Reset via Email**  
✅ **Dashboard Summary** endpoint for quick insights  

---

## 🧰 Tech Stack

| Component | Technology |
|------------|-------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT (Access + Refresh Tokens) |
| **Mailing** | Nodemailer |
| **Security** | bcrypt (password hashing) |
| **Env Config** | dotenv |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/beeProject
ACCESS_TOKEN_SECRET=R8S8Oqp7rZCUkrqGt4sTrBjfkoWudMC1j7kIiykDFmg
REFRESH_TOKEN_SECRET=xIthmMbfVwncs5tNE1KASM6iVhtzYJwlN-E5ussVGkRIRHCrrtf-RDKtwPSpCj4f
EMAIL_USER=sanskarpersonalgrowth@gmail.com
EMAIL_PASS=ejnxrwxygmrllbgp
