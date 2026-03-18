import typer
from rich import print
from sqlmodel import Session

from src.core.db import engine
from src.models.models import Feature
from src.modules.features.repository import FeatureRepository
from src.modules.features.schema import FeatureBase

app = typer.Typer(help="Seeder CLI")

FEATURES = [
    {
        "name": "AI Agent Chat",
        "slug": "chat",
        "description": "Interact with AI-powered agents using large language models for conversational tasks, problem-solving, and assistance.",
        "is_active": True,
    },
    {
        "name": "Model Usage",
        "slug": "model-usage",
        "description": "Track, monitor, and analyze token consumption and usage metrics across different LLM models.",
        "is_active": True,
    },
    {
        "name": "Scrapper",
        "slug": "scrapper",
        "description": "Extract and process data from external web sources to support automation, analysis, and AI workflows.",
        "is_active": True,
    },
    {
        "name": "LLM Models",
        "slug": "models",
        "description": "Manage and configure large language models from multiple providers, including access control and usage settings.",
        "is_active": True,
    },
    {
        "name": "RAG",
        "slug": "rag",
        "description": "Enhance AI responses using Retrieval-Augmented Generation by fetching relevant data from connected knowledge sources.",
        "is_active": True,
    },
    {
        "name": "Knowledge Base",
        "slug": "knowledge-base",
        "description": "Create, manage, and organize structured and unstructured data sources used by AI systems for retrieval and context.",
        "is_active": True,
    },
    {
        "name": "Upload Files",
        "slug": "files",
        "description": "Upload and manage documents and files that can be processed, indexed, and used within AI workflows.",
        "is_active": True,
    },
]


@app.command("features")
def seed_features():
    """
    Seed features table
    """

    created = 0
    skipped = 0

    with Session(engine) as session:
        repository = FeatureRepository(model=Feature, session=session)

        for feature in FEATURES:
            try:
                repository.get_by("slug", feature["slug"], unique=True)
                print(f"Feature [bold red]{feature['slug']}[/bold red] already exists")
                skipped += 1
            except:
                repository.create(
                    FeatureBase(
                        name=feature["name"],
                        slug=feature["slug"],
                        description=feature["description"],
                        is_active=True,
                    ).model_dump()
                )

                created += 1

        print(
            f"[green]Seed completed[/green] -> "
            f"Created: [bold green]{created}[/bold green], "
            f"Skipped [bold yellow]{skipped}[/bold yellow]"
        )
