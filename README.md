# TRON - Temporal Reasoning & Orchestration Neuron

## System Architecture

```mermaid
flowchart TB
    User[User]

    FE[React Frontend]

    BE[FastAPI Backend]

    CASBIN[Casbin Authorization]

    DB[(PostgreSQL)]
    CACHE[(Redis)]
    KAFKA[(Kafka Message Broker)]
    VECTOR[(Qdrant Vector DB)]

    WORKER[Celery Worker]

    User -->|JWT Authentication| FE
    FE -->|HTTP / WebSocket / SSE| BE

    BE --> CASBIN
    CASBIN -->|Store Policies| DB

    BE --> DB
    BE --> CACHE
    BE --> VECTOR

    BE -->|Produce Events| KAFKA
    KAFKA -->|Consume Events| CACHE
    CACHE -->|Get Jobs| WORKER

    WORKER -->|Stream Progress| KAFKA

    WORKER -->|Store Results| DB
    WORKER -->|Update Job Status| CACHE
```

### Event Driven Flow

```mermaid
sequenceDiagram
    autonumber

    participant FE as React Frontend (WebSocket)
    participant BE as FastAPI Backend
    participant KP as Kafka Producer
    participant KC as Kafka Consumer (FastAPI Lifespan)
    participant K@{ "type" : "queue" } as Kafka Broker
    participant R as Redis
    participant CW as Celery Worker
    participant DB@{ "type" : "database" } as PostgreSQL

    %% Step 1: Backend produces event
    FE->>BE: Request "New Job Event"
    BE->>KP: Produce "New Job Event"
    KP->>K: Publish Event

    %% Step 2: Consumer receives event
    K-->>KC: Deliver Event

    %% Step 3: Create Celery Task
    KC->>R: Push Task to Redis (Celery Broker)

    %% Step 4: Task stored in Redis
    Note over R: Task queued for workers

    %% Step 5: Worker processes task
    CW->>R: Pull Task
    activate CW
    CW->>CW: Execute Job
    CW->>DB: Store Intermediate Results
    deactivate CW

    %% Step 6: Worker sends status updates via Kafka
    CW->>K: Publish "Task Status Update"

    %% Step 7: Backend streams updates to user
    K-->>BE: Consume Status Event
    BE->>FE: Stream via WebSocket

    %% Step 8: Store final result
    CW->>DB: Save Job Result
```

## FastAPI Backend

### Installation

Install [UV](https://docs.astral.sh/uv/) - Rust based python package manager

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### Create Virtual Environment for Python using UV

```bash
uv venv
source .venv/bin/activate
```

#### Install dependencies

```bash
uv sync
```

#### Dependencies

| Package                                              | Description            |
| ---------------------------------------------------- | ---------------------- |
| [Alembic](https://alembic.sqlalchemy.org/en/latest/) | Database Migration     |
| [Celery](https://docs.celeryq.dev/en/stable/)        | Background Worker      |
| [QDrant](https://qdrant.tech/documentation/)         | Vector Search Engine   |
| [Casbin](https://casbin.org/docs/get-started/)       | Access Control Library |

### Managing Migrations using Alembic

To create new migration

```bash
uv run alembic revision --autogenerate -m "add user table"
```

To run your migrations

```bash
uv run alembic upgrade head
```

To check migration history

```bash
uv run alembic history --verbose
```

To downgrade to beginning

```bash
uv run alembic downgrade base
```

### Development / Debug

### Qdrant

| Package         | Description                     |
| --------------- | ------------------------------- |
| Qdrant          | http://localhost:6333/dashboard |
| Redis Commander | http://localhost:8082/          |
| PG Admin        | http://localhost:5050/          |
| Adminer         | http://localhost:8080/          |
| Kafbat UI       | http://localhost:8081/          |
| Celery Flower   | http://localhost:5555/          |

### App Management CLI

```bash
python -m src.cli.manage --help
```

```bash

Usage: python -m src.cli.manage [OPTIONS] COMMAND [ARGS]...

 App Management CLI

╭─ Options ──────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ --install-completion          Install completion for the current shell.                                        │
│ --show-completion             Show completion for the current shell, to copy it or customize the installation. │
│ --help                        Show this message and exit.                                                      │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭─ Commands ─────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ users     User Management CLI                                                                                  │
│ seeders   Seeder CLI                                                                                           │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```
