import typer

import src.cli.seeders.seeder as seeders
import src.cli.users.users as users

app = typer.Typer(help="App Management CLI")

app.add_typer(users.app, name="users")
app.add_typer(seeders.app, name="seeders")

if __name__ == "__main__":
    app()
