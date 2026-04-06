import Link from 'next/link';

const highlights = [
  'Agent and chat workflows for multi-step AI interactions',
  'Knowledge base and RAG pipelines for document-grounded answers',
  'Usage tracking, access control, and team-oriented management tools',
];

const technologies = [
  {
    name: 'Frontend',
    stack: [
      { label: 'React 19', href: 'https://react.dev' },
      { label: 'Vite', href: 'https://vite.dev/guide/' },
      { label: 'Tailwind CSS 4', href: 'https://tailwindcss.com/docs' },
      { label: 'Mantine', href: 'https://mantine.dev' },
      { label: 'TanStack Query', href: 'https://tanstack.com/query/latest' },
    ],
  },
  {
    name: 'Documentation',
    stack: [
      { label: 'Next.js', href: 'https://nextjs.org/docs' },
      { label: 'FumaDocs', href: 'https://fumadocs.dev/docs' },
      { label: 'MDX', href: 'https://mdxjs.com/docs/' },
    ],
  },
  {
    name: 'Backend',
    stack: [
      { label: 'FastAPI', href: 'https://fastapi.tiangolo.com' },
      { label: 'SQLModel', href: 'https://sqlmodel.tiangolo.com' },
      { label: 'Alembic', href: 'https://alembic.sqlalchemy.org/en/latest/' },
      { label: 'Typer', href: 'https://typer.tiangolo.com' },
    ],
  },
  {
    name: 'AI and orchestration',
    stack: [
      { label: 'LangChain', href: 'https://docs.langchain.com/oss/python/langchain/overview' },
      { label: 'LangGraph', href: 'https://docs.langchain.com/oss/python/langgraph/overview' },
      { label: 'Qdrant', href: 'https://qdrant.tech/documentation/' },
      { label: 'Playwright', href: 'https://playwright.dev/docs/intro' },
    ],
  },
  {
    name: 'Infrastructure',
    stack: [
      { label: 'PostgreSQL', href: 'https://www.postgresql.org/docs/' },
      { label: 'Redis', href: 'https://redis.io/docs/latest/' },
      { label: 'Kafka', href: 'https://kafka.apache.org/documentation/' },
      { label: 'Celery', href: 'https://docs.celeryq.dev/en/stable/' },
    ],
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-16 sm:px-10 lg:py-24">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6 text-left">
          <div className="inline-flex w-fit rounded-full border border-fd-border bg-fd-card px-3 py-1 text-sm text-fd-muted-foreground">
            TRON Documentation
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Temporal reasoning and orchestration for AI-powered workflows
            </h1>
            <p className="max-w-2xl text-base leading-7 text-fd-muted-foreground sm:text-lg">
              TRON is an application for building and operating AI experiences
              across chat, agents, browser automation, and retrieval-augmented
              knowledge bases. It brings together orchestration, access control,
              and usage tracking so teams can run LLM-powered workflows in one
              place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center rounded-full bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore Docs
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-fd-border bg-fd-card p-6 text-left shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-fd-muted-foreground">
            What the platform covers
          </p>
          <ul className="mt-5 space-y-4">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-fd-border bg-fd-background px-4 py-3 text-sm leading-6 text-fd-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-5 text-left">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Technologies used
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-fd-muted-foreground sm:text-base">
            The TRON platform is organized as a monorepo with dedicated apps for
            the web client, API services, and documentation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {technologies.map((item) => (
            <article
              key={item.name}
              className="rounded-3xl border border-fd-border bg-fd-card p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-fd-foreground">
                {item.name}
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-fd-muted-foreground">
                {item.stack.map((technology) => (
                  <li key={technology.label}>
                    <a
                      href={technology.href}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-fd-foreground hover:underline"
                    >
                      {technology.label}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
