# AI Smart System for Community-Based Crime Prevention

Starter monorepo with:
- Frontend: React + Vite
- Backend: Node.js + Express + MongoDB (Mongoose)
- AI Service: Python FastAPI (risk scoring endpoint)

## Project Structure

```text
.
|-- frontend/
|-- backend/
|-- ai-service/
|-- docker-compose.yml
`-- package.json
```

## 1) Start MongoDB

```bash
docker compose up -d
```

## 2) Install JS dependencies

```bash
npm install
```

## 3) Run frontend + backend together

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 4) Run AI service

```bash
cd ai-service
python -m venv .venv
# Windows
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- AI service: http://localhost:8000
- Health: http://localhost:8000/health

## Key API Endpoints

- `GET /api/health`
- `GET /api/incidents`
- `POST /api/incidents`
- `POST /api/predict-risk`

## Notes

- Set backend env vars in `backend/.env` from `backend/.env.example`.
- `POST /api/predict-risk` proxies request to FastAPI service.
