# ArchReview AI 🚀

ArchReview AI is a modern, AI-powered software architecture review assistant. It helps engineering teams, solution architects, and developers automatically analyze System Requirement Specifications (SRS), High-Level Design (HLD) documents, and architecture diagrams to identify technical debt, security vulnerabilities, and scalability bottlenecks before they reach production.

## ✨ Features

- **Automated Architecture Review**: Upload SRS, HLD, or API specs for instant analysis.
- **Comprehensive Scoring**: Get detailed scores across 6 key dimensions: Security, Performance, Scalability, Cost Optimization, Maintainability, and Overall Architecture Health.
- **Risk Detection**: Automatically identify critical security vulnerabilities and architectural anti-patterns using OWASP and AWS Well-Architected Framework guidelines.
- **Context-Aware AI Chat**: Ask follow-up questions about your architecture with a fully context-aware AI assistant (Powered by Gemini / LLMs).
- **Modern Dark-Mode UI**: A premium, responsive dashboard built with React, Tailwind CSS, and Framer Motion.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Framer Motion
- React Router DOM
- Lucide Icons

**Backend:**
- Node.js & Express
- MongoDB (Mongoose)
- Security: Helmet, Express-Mongo-Sanitize, XSS-Clean, HPP
- Rate Limiting (Custom AI endpoints protection)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jeevankumar14/Ai-Architecture-Review-Assistant.git
   cd Ai-Architecture-Review-Assistant
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory using this template:
   ```env
   # PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5174

   # ─── MongoDB ────────────────────────────────────────────────────────
   # Note: MongoDB Atlas Vector Search is required for the knowledge base
   MONGODB_URI=

   # ─── AI Providers (Groq & Gemini) ──────────────────────────────
   GEMINI_API_KEY=
   GROQ_API_KEY=

   # ─── AWS S3 (Document Uploads) ──────────────────────────────────────
   AWS_REGION=ap-south-2
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=

   S3_BUCKET_NAME=
   S3_UPLOAD_PREFIX=uploads

   # ─── Authentication ──────────────────────────────────────────────────
   JWT_SECRET=
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   JWT_REMEMBER_ME_EXPIRES_IN=30d

   # ─── Email (Password Reset) ──────────────────────────────────────────
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   EMAIL_FROM=
   ```
   Then start the server:
   ```bash
   npm start
   ```

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file (e.g., VITE_API_URL)
   npm run dev
   ```

## 🔒 Security
This project implements robust backend security measures including strict CORS origins, rate limiting specifically designed for expensive AI API routes, and comprehensive payload sanitization to prevent NoSQL injection and XSS attacks.

## 📄 License
This project is proprietary and confidential.

---
*Trusted by engineering teams to build scalable, secure, and resilient software architectures.*
