# Maestro ArchUI

The web-based user interface for Maestro, built with React and Vite. It is part of the [Maestro project](../Maestro/README.md).

## Features

- Browse and search issues from Jira repositories
- View and assign manual labels (existence, property, executive)
- View BERT and other ML model predictions with confidence scores
- Manage ML models, embeddings, and training configurations
- Full-text keyword search with prediction filtering
- Tag management and issue review workflow
- Statistics and data visualization

## Setup

### Prerequisites

- Docker and Docker Compose
- The `maestro_traefik` Docker network must exist (created by the main Maestro setup)

### Quick Start

```bash
cd maestro-project/maestro-ArchUI/
docker compose up --build -d
```

The UI will be available at `https://maestro.localhost:4269/archui/`.

## Configuration

### Connection Settings

The UI connects to three backend services. Default URLs (configured in `src/components/connectionSettings.tsx`):

| Service | Default URL |
|---------|-------------|
| Database API | `https://maestro.localhost:4269/issues-db-api` |
| DL Manager | `https://maestro.localhost:4269/dl-manager` |
| Search Engine | `https://maestro.localhost:4269/search-engine` |

These can be changed in the UI's **Settings** page. Changes are stored in the browser's localStorage.

### Base Path

The UI is served under `/archui/` (configured in `vite.config.js`).

## Development

The Docker container runs Vite in dev mode with hot module replacement. The source code is copied into the container at build time. To see changes, rebuild the image:

```bash
docker compose up --build -d
```
