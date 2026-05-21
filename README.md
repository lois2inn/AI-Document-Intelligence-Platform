# AI Knowledge Tracker / Docs Intelligence Portal

AI Knowledge Tracker is a full-stack document processing system that ingests documents, processes them through a pipeline, and prepares them for downstream AI use cases such as semantic search and retrieval.

---

## Problem Overview

Managing and retrieving knowledge from unstructured documents is inefficient with traditional keyword search.

This project solves that by:

* Ingesting documents via API
* Cleaning and processing text asynchronously
* Generating embeddings
* Enabling semantic (meaning-based) search using vector similarity

---

## Architecture

**Backend Stack:**

* FastAPI (API layer)
* SQLAlchemy ORM (data layer)
* Alembic (database migrations)
* PostgreSQL + pgvector (vector storage)
* Background Tasks (document processing pipeline)

**Frontend Stack:**

* React (Next.js)
* TypeScript
* Tailwind CSS
  
**Design Patterns:**

* Service Layer Pattern
* Repository Pattern
* Dependency Injection

**High-Level Flow:**

1. User submits document → `/documents`
2. Document stored with `PENDING` status
3. Background job processes document:

   * Clean text
   * Chunk content (overlap-aware)
   * Generate embeddings
4. Store embeddings in PostgreSQL (pgvector)
5. Semantic search endpoint retrieves similar content

<img src="/img/sample_page.png" width=700/>
---

## AI Processing Pipeline

```text
EXTRACTING
→ CLEANING
→ CHUNKING
→ EMBEDDING
→ DONE
```

The pipeline supports:
- observable stage tracking
- rerun workflows
- background processing
- job history
- event timelines

---

## Key Features:

- Document upload & storage
- Real-time pipeline status tracking
- Chunk preview
- Cleaned text preview
- Embedding generation
- Embedding progress visualization
- pgvector integration
- Reprocess pipeline
- Job history tracking
- Stage/event observability
  
---

## Running Locally

### 1. Clone repo

```
git clone <your-repo-url>
cd ai-knowledge-tracker
```

---

### 2. Setup environment

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### 3. Setup frontend dependencies

```bash
cd frontend
npm install
```

---

### 4. Start PostgreSQL (Docker)

```bash
docker compose up -d
```

---

### 5. Enable pgvector

```bash
docker exec -it ai_tracker_postgres psql -U ai_user -d ai_tracker
```

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

### 6. Run migrations

```bash
alembic upgrade head
```

---

### 7. Start API

```bash
uvicorn app.main:app --reload
```

Backend API available at:

```text
http://127.0.0.1:8000/docs
```

---

### 8. Start frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Frontend available at:

```text
http://localhost:3000
```

---
## pgvector + Embeddings

The system stores vector embeddings directly on document chunks using PostgreSQL + pgvector.

Example embedding column:

```python
embedding = mapped_column(
    Vector(1536),
    nullable=True,
)
```

Current embedding model:

```text
text-embedding-3-small
```

Embedding dimension:

```text
1536
```

This enables:
- semantic search
- vector similarity retrieval
- future RAG workflows

---


## Design Decisions

### Job Model

- One document → many jobs
- Each job = one full pipeline run

### Retry Strategy

- Retries are modeled as new jobs
- Existing job history remains immutable

### Chunk Strategy

- One active chunk set per document
- Reprocessing regenerates chunks + embeddings

### Duration Calculation

- Computed using `@property` in SQLAlchemy
- Exposed via Pydantic



---

## Future Enhancements

* Semantic Search API
* Semantic Search UI
* Retrieval-Augmented Generation (RAG)
* Vector similarity ranking
* Concurrent job pipelines
* Job dependency graph (DAG)
* Advanced job timeline view
* Authentication & user-specific knowledge bases
* Microservice-based ingestion pipeline

---

## Author

GitHub: https://github.com/lois2inn
