# ArchReview AI 🚀

> **Autonomous Software & Cloud Architecture Review Platform**  
> Supercharge architectural governance with instant AI evaluations, deterministic rule audits, multi-modal diagram/document ingestion, and grounded conversational RAG.

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TailwindCSS-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20ESM-green.svg)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20Vector%20Search-forestgreen.svg)](https://www.mongodb.com/atlas)
[![AI Providers](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash%20%7C%20Cohere%20Cloud-purple.svg)](https://ai.google.dev/)
[![Queue & Cache](https://img.shields.io/badge/Async%20Worker-BullMQ%20%7C%20Redis%20%7C%20In--Memory-red.svg)](https://bullmq.io/)
[![License](https://img.shields.io/badge/License-Proprietary-darkgrey.svg)]()

---

## 📖 Overview

**ArchReview AI** is a production-grade software and cloud architecture review assistant designed for engineering teams, solution architects, and tech leads. It automates the inspection of System Requirement Specifications (SRS), High-Level Design (HLD) documents, and architecture diagrams to pinpoint single points of failure (SPOFs), security flaws, cost inefficiencies, and scalability bottlenecks before systems reach production.

By decoupling **Immediate Review Generation (< 5-7s Fast Path)** from **Heavy Background Embedding Generation (Asynchronous RAG Path)**, ArchReview AI provides instant feedback while continuously indexing documents for deep contextual chat.

---

## ⚡ Key Highlights & Recent Upgrades

- **🚀 Sub-7s Fast Review Path (vs. Legacy ~60s)**:
  - **Deterministic Architecture Extractor (`< 25ms`)**: High-throughput regex pattern matching and technology dictionaries extract services, databases, caches, message brokers, and connections with **0 LLM calls**.
  - **Single-Turn Gemini 2.5 Flash Synthesis**: Grounded architectural evaluation at `temperature: 0.0`.
  - **Concurrent Rule & KB Evaluation**: Deterministic rule checking and Knowledge Base vector retrieval run in parallel via `Promise.all`.
- **⚡ SHA-256 Deduplication & Multi-Tier Caching**:
  - Re-uploading previously analyzed documents serves completed reviews in **< 500 ms** via Redis/MongoDB hash lookup.
  - Caches parsed document text, diagram topologies, and Knowledge Base vector queries.
- **🔄 Isolated Background RAG Worker Process (`worker.js`)**:
  - Heavy chunking and embedding operations are offloaded to an asynchronous **BullMQ & Redis** queue (with seamless high-performance in-memory fallback).
  - Web server remains 100% non-blocking; background worker runs with `concurrency: 2`.
- **🌐 Cloud Embeddings via Cohere Cloud (`embed-v4.0`, 1024-dim)**:
  - Replaced CPU-bound local ONNX models with Cohere Cloud v2 API.
  - Generates 1024-dimensional embeddings matching MongoDB Atlas Vector Index definition with batching up to 96 chunks.
- **📄 Multi-Modal Ingestion Matrix**:
  - **Diagram-Only**: PNG, JPG, JPEG, WEBP via Gemini Vision + OCR topology extraction.
  - **Document-Only**: PDF (via `pdf-parse`), DOC / DOCX (via `officeparser`), TXT, JSON, YAML.
  - **Combined Ingestion**: Upload diagrams and design specs together; unified and deduplicated via `architectureNormalizer.mergeAndNormalize()`.
- **🛡️ 6-Pillar Deterministic Rule Engine**:
  1. **Authentication & Access Control** (`Security`, Critical: -30 pts)
  2. **Single Point of Failure (SPOF)** (`Scalability`, High: -18 pts)
  3. **Direct Database Isolation** (`Security`, Critical: -30 pts)
  4. **Load Balancing & Ingress Gateway** (`Performance`, High: -18 pts)
  5. **Database Caching Layer** (`Performance`, Medium: -8 pts)
  6. **Transport Security & TLS** (`Security`, Medium: -8 pts)
- **📊 5-Pillar Well-Architected Scoring Engine**:
  - Mathematical deductions with strict severity caps: Security (25%), Scalability (20%), Performance (20%), Cost (15%), Maintainability (20%).
- **💬 Dual-Retrieval Conversational Chat RAG**:
  - Dual vector retrieval querying project-specific document chunks + curated cloud best practices with Cohere Reranking.
  - Server-Sent Events (SSE) streaming for real-time, low-latency AI responses.
- **🔒 Production Guardrails**:
  - Prompt injection detection, architectural domain enforcement, PII scrubbing, safe JSON parsing, rate limiting, and NoSQL/XSS sanitization.

---

## ⏱️ Performance Benchmarks

| Milestone | Legacy Architecture | Modernized Architecture | Improvement |
|---|---|---|---|
| **Identical Document Re-upload** | ~25,000 ms (full re-run) | **< 480 ms** | **98% faster** (SHA-256 Redis cache) |
| **Architecture Extraction** | ~4,500 ms (LLM call) | **< 25 ms** | **99% faster** (Deterministic Extractor) |
| **Rule Check & KB Search** | Sequential (~2,200 ms) | **~650 ms** | Concurrent (`Promise.all`) |
| **Fresh Review Generation** | ~35,000 – 60,000 ms | **~4,800 – 6,200 ms** | **85% faster** (Fast Path) |
| **Chunk Embedding Generation** | Local CPU ONNX (CPU spike) | **Cloud Batch (< 800 ms/batch)** | Cohere `embed-v4.0` in isolated `worker.js` |
| **Follow-up Chat RAG Query** | ~4,500 ms | **~1,200 ms** | Dual vector search + SSE streaming |

---

## 🏗️ System Architecture

<p align="center">
  <img width="1024" alt="ArchReview AI System Architecture" src="https://github.com/user-attachments/assets/d7764b27-f1f2-4652-b83a-1090fb61c1e3" />
</p>

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS, Class Variance Authority, Radix UI primitives
- **Motion & Visuals**: Framer Motion, Lucide Icons, Canvas-based radar charts
- **Data & Export**: Axios, React Markdown, HTML2PDF, React-to-Print

### Backend & Core Services
- **Runtime & API**: Node.js (ES Modules), Express 4
- **Database**: MongoDB Atlas with Vector Search (`mongoose`)
- **Queue & Worker**: BullMQ, IORedis (with automatic in-memory fallback), dedicated `worker.js`
- **Object Storage**: AWS S3 (`@aws-sdk/client-s3`, `multer-s3`)
- **Document & Diagram Parsers**: `pdf-parse`, `officeparser`, `sharp`
- **Security & Hygiene**: Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, HPP, XSS-Clean, JWT

### AI & Embeddings
- **Reasoning Engine**: Google Gemini 2.5 Flash (`@google/genai`)
- **Conversational Chat**: Gemini 2.5 Flash / Groq Llama 3.3 70B Versatile
- **Cloud Vector Embeddings**: Cohere Cloud `embed-v4.0` (1024 output dimensions)
- **Reranking**: Cohere Rerank v3.5
- **Vision & OCR**: Gemini Multimodal Vision

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB Atlas**: Cluster with Atlas Vector Search index configured
- **API Keys**: Google Gemini API key and Cohere API key (free tier available)
- **AWS S3**: Bucket with read/write access for document storage
- **Redis** *(Optional)*: Redis instance for BullMQ (falls back to built-in in-memory queue if omitted)

---

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jeevankumar14/Ai-Architecture-Review-Assistant.git
   cd Ai-Architecture-Review-Assistant
   ```

2. **Configure the Backend**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend/` directory:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/archreview?retryWrites=true&w=majority

   # AI Providers
   GEMINI_API_KEY=your_gemini_api_key_here
   COHERE_API_KEY=your_cohere_api_key_here
   COHERE_EMBEDDING_MODEL=embed-v4.0
   GROQ_API_KEY=your_optional_groq_api_key

   # AWS S3 (Document & Diagram Uploads)
   AWS_REGION=ap-south-2
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   S3_BUCKET_NAME=your_s3_bucket_name
   S3_UPLOAD_PREFIX=uploads

   # Redis / Queue (Optional - omit for built-in in-memory queue)
   REDIS_URL=redis://localhost:6379

   # Authentication (JWT)
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   JWT_REMEMBER_ME_EXPIRES_IN=30d

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Email / Password Reset (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   EMAIL_FROM=noreply@archreview.ai
   ```

3. **Index Knowledge Base with Cohere Embeddings (One-Time Setup)**
   ```bash
   npm run seed:cohere
   ```

4. **Start the Backend**
   
   To run both the **Express API Server** and the **Asynchronous BullMQ Worker** concurrently with auto-reload:
   ```bash
   npm run dev
   ```

   *Alternatively, run in separate terminals:*
   ```bash
   # Terminal 1: API Server
   npm start

   # Terminal 2: Background RAG Worker
   npm run worker
   ```

5. **Setup & Start Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Repository Structure

```
Ai-Architecture-Review-Assistant/
├── backend/
│   ├── seed/
│   │   ├── reindexCohere.js            # Cohere 1024-dim KB re-indexer
│   │   └── runSeed.js                  # Knowledge base seeder
│   ├── src/
│   │   ├── config/                     # Environment, DB, AWS S3, Passport configs
│   │   ├── controllers/                # Document, Review, Chat, Auth controllers
│   │   ├── middleware/                 # Upload (Multer-S3), Auth, Rate limiter
│   │   ├── models/                     # Document, Review, Project, ChatSession models
│   │   ├── prompts/                    # Gemini grounded review & chat prompts
│   │   ├── routes/                     # Express REST routes
│   │   └── services/
│   │       ├── architectureExtractor.js # <25ms deterministic regex/dictionary extractor
│   │       ├── architectureNormalizer.js# Canonical schema unification & multi-doc merger
│   │       ├── cacheService.js         # Redis & In-memory multi-tier cache
│   │       ├── queueService.js         # BullMQ & In-memory background job manager
│   │       ├── rerankService.js        # Cohere Rerank & Reciprocal Rank Fusion
│   │       ├── guardrailService.js     # Injection checks, PII scrubbing, safe parsing
│   │       ├── reviewEngine.js         # Fast review orchestrator (Rules + KB + Gemini)
│   │       ├── ruleEngine.js           # 6 deterministic architectural rule evaluations
│   │       ├── scoringEngine.js        # 5-Pillar Well-Architected mathematical scorer
│   │       ├── vectorSearchService.js  # Atlas vector & hybrid keyword search
│   │       └── diagramProcessor.js     # Vision OCR and topology extraction
│   ├── server.js                       # Express application entrypoint
│   ├── worker.js                       # Isolated OS worker for background RAG embeddings
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/                 # UI components, radar charts, upload modals
│   │   ├── pages/                      # Dashboard, ProjectDetails, Reviews, Chat
│   │   ├── services/                   # Axios API clients
│   │   └── index.css                   # Tailwind CSS design system
│   ├── vite.config.js
│   └── package.json
│
├── finalarchitecture.md                # Comprehensive technical system specification
└── README.md
```

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT access tokens |
| `POST` | `/api/projects` | Create a new architecture project workspace |
| `POST` | `/api/projects/:id/documents` | Upload architectural diagrams or documents (S3 + SHA-256) |
| `GET` | `/api/projects/:id/documents` | List uploaded documents with `ragReady` status |
| `GET` | `/api/projects/:id/reviews/latest` | Retrieve latest review status (`generating` vs `completed`) |
| `GET` | `/api/projects/:id/reviews/:reviewId` | Retrieve full 5-pillar review and scores |
| `POST` | `/api/chat/sessions/:sessionId/messages` | Grounded conversational Q&A with SSE streaming |

---

## 🔒 Security & Compliance

- **Zero Data Leakage**: Prompts utilize strict schema grounding with no sensitive training retention.
- **PII Scrubbing & Input Guardrails**: Sensitive data (emails, API keys, credentials) are sanitized before prompt formulation.
- **Defensive API Hardening**: Automated Helmet headers, CORS origin enforcement, MongoDB query sanitization, and route-specific rate limiters for AI endpoints.

---

## 📄 License

This project is proprietary and confidential.  
Copyright © 2026 ArchReview AI. All rights reserved.
