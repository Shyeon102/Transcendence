# Transcendence

> This project has been created as part of the 42 curriculum by [llarrey](https://github.com/Angeuh), [jihyeki2](https://github.com/JesuisJ), [seong-ki](https://github.com/Shyeon102), [thelee](https://github.com/thelee42), [jaoh](https://github.com/aejone1013)

## 🚀 Getting Started
```bash
git clone https://github.com/Shyeon102/Transcendence.git
cp .env.example .env   # Write .env file
docker compose up --build
```

## 👥 Team


| Name           | Role                      | GitHub                                      |
| -------------- | ------------------------- | ------------------------------------------- |
| Jihye Kim      | PM / Frontend             | [JesuisJ](https://github.com/JesuisJ)       |
| Jaeone Oh      | Frontend                  | [aejone1013](https://github.com/aejone1013) |
| Lucas Larrey   | PO / Backend              | [Angeuh](https://github.com/Angeuh)         |
| Thea Lee       | AI                        | [thelee42](https://github.com/thelee42)     |
| Seonghyeon Kim | Architect / Data / DevOps | [Shyeon102](https://github.com/Shyeon102)   |


The last project of 42 curriculum: FT_Transcendence

# 🎬 Media Platform

A web service for discovering, recommandation and discussing movies, anime, and dramas.

## Features

- 🎯 Personalized media recommendations (collaborative filtering + RAG)
- 📝 Personal review space
- 💬 Community board with real-time discussion rooms
- 👥 Follow system based on taste

## Tech Stack


|     **PART** |               **STACK**                        |
| ------------ | ---------------------------------------------- |
| **Frontend** | React + TypeScript + Redux Toolkit (RTK Query) |
| **Backend**  | Django + DRF + Django Channels                 |
| **Database** | PostgreSQL + Redis                             |
| **AI**       | Collaborative Filtering + RAG (pgvector)       |
| **DevOps**   | Docker + AWS EC2 + GitHub Actions              |


## 📁 Project Structure

```bash
root-workspace/  
├── frontend/                # React + TypeScript  
├── backend/                 # Django + DRF + Channels  
├── ai/                      # recommand pipeline + RAG + Celery 
├── .github/  
│   └── workflows/           # GitHub Actions CI/CD  
├── docker-compose.yml       # local dev enviroment  
├── docker-compose.prod.yml  # production enviroment  (WIP)
├── .env.example             # .env template  
└── .gitignore
```

## 🌿 Branching Strategy


| Branch                   | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `main`                   | Production/Deployment (Direct push forbidden) |
| `dev`                    | Integration & Development branch              |
| `feature/<feature_name>` | New feature implementation                    |
| `fix/<error_name>`       | Bug fixes                                     |
| `test/<test_name>`       | Testing                                       |
| `docs/<docs_name>`       | Documentation updates                         |


- All work should be branched from `dev`.
- Pull Requests (PR) flow: `feature/`*, `fix/`*, `test/*`, `docs/*` → `dev`.
- Merge to `main` only upon completion of a major milestone.

## 📝 Commit Convention


| Type     | Usage                                                  |
| -------- | ------------------------------------------------------ |
| `feat:`  | Adding a new feature                                   |
| `fix:`   | Bug fixes (typos, path changes, etc.)                  |
| `test:`  | Writing or modifying test code                         |
| `setup:` | Environment configuration (Docker, CI, packages, etc.) |
| `docs:`  | Documentation changes (README, etc.)                   |


### Examples

- `feat: implement media recommendation API`
- `fix: resolve login token expiration error`
- `setup: initial Docker Compose configuration`
- `docs: add branching strategy to README`

