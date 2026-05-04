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

---

## Key Features:

- Document upload & storage
- Real-time pipeline status tracking
- Chunk preview
- Cleaned text preview
- Reprocess pipeline
- Job history tracking
  
---

## Running Locally

### 1. Clone repo

```
git clone <your-repo-url>
cd ai-knowledge-tracker
```

---

### 2. Setup environment

```
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### 3. Start PostgreSQL (Docker)

```
docker compose up -d
```

---

### 4. Enable pgvector

```
docker exec -it ai_tracker_postgres psql -U ai_user -d ai_tracker
```

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

### 5. Run migrations

```
alembic upgrade head
```

---

### 6. Start API

```
uvicorn app.main:app --reload
```

API available at:

```
http://127.0.0.1:8000/docs
```

---

## Design Decisions

### Job Model
- One document → many jobs
- Each job = one full pipeline run

### Retry Strategy
- Retries are modeled as **new jobs**
- No mutation of existing jobs

### Duration Calculation
- Computed using `@property` in SQLAlchemy
- Exposed via Pydantic


---

## Future Enhancements

* Embeddings + vector search (pgvector)
* Semantic Search UI
* Concurrent job pipelines
* Job dependency graph (DAG)
* Advanced job timeline view
* Authentication & user-specific knowledge bases
* Microservice-based ingestion pipeline

---

## Author

GitHub: https://github.com/lois2inn
