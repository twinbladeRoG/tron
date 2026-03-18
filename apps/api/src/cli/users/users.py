import typer
from rich import print_json
from sqlmodel import Session

from src.core.db import engine
from src.models.models import User
from src.modules.users.controller import UserController
from src.modules.users.repository import UserRepository
from src.modules.users.schema import UserCreate

app = typer.Typer(help="User Management CLI")


@app.command("create")
def create_user(
    username: str = typer.Option(None, prompt=True),
    email: str = typer.Option(None, prompt=True),
    password: str = typer.Option(
        None, prompt=True, hide_input=True, confirmation_prompt=True
    ),
    first_name: str = typer.Option(None, prompt=True),
    last_name: str = typer.Option(None, prompt=True),
):
    """
    Create a new user
    """

    with Session(engine) as session:
        try:
            controller = UserController(
                repository=UserRepository(model=User, session=session)
            )

            model = UserCreate(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )

            print_json(model.model_dump_json(indent=2))

            if not typer.confirm("Create this user?"):
                raise typer.Abort()

            user = controller.create(model)

            typer.secho(f"User create with id: {user.id}", fg=typer.colors.GREEN)
        except Exception as e:
            typer.echo(f"Error: {e}")
            raise typer.Exit(code=1)
