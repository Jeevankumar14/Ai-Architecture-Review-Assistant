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
   # Create a .env file based on environment requirements
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
