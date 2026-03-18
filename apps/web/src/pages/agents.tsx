import { Link } from 'react-router';
import { Icon, type IconifyIcon } from '@iconify/react';
import { Badge, Button, Card, Text, Title, Tooltip } from '@mantine/core';

import { cn } from '@/lib/utils';

type Tool = {
  name: string;
  description: string;
};

type Agent = {
  name: string;
  description: string;
  tools: Tool[];
  coming_soon: boolean;
  className: string;
  link: string;
  icon: string | IconifyIcon;
};

const AgentsPage = () => {
  const agents: Agent[] = [
    {
      name: 'Chat Agent',
      description:
        'A general-purpose conversational agent that can answer questions, fetch real-time data, and interact with external sources.',
      tools: [
        {
          name: 'Get Current Time',
          description: 'Returns the current system time',
        },
        {
          name: 'Web Scraper',
          description: 'Extracts content from a given website URL',
        },
        {
          name: 'Web Search',
          description:
            'Searches the web for up-to-date information using Duck Duck Go search engine',
        },
      ],
      coming_soon: false,
      className: 'from-cyan-500 to-blue-500/0',
      link: '/agent',
      icon: 'solar:chat-round-dots-bold-duotone',
    },
    {
      name: 'RAG Agent',
      description:
        'An intelligent agent that allows users to chat with a selected knowledge base using Retrieval-Augmented Generation (RAG).',
      tools: [
        {
          name: 'Knowledge Base Retriever',
          description: 'Fetches relevant documents from the selected knowledge base',
        },
        {
          name: 'Contextual Answer Generator',
          description: 'Generates answers based on retrieved context',
        },
      ],
      coming_soon: false,
      className: 'from-fuchsia-500 to-cyan-500/0',
      link: '/rag-agent',
      icon: 'solar:book-bold-duotone',
    },
    {
      name: 'SQL Agent',
      description:
        'An agent that converts natural language into SQL queries and interacts with databases to fetch results.',
      tools: [
        {
          name: 'SQL Query Generator',
          description: 'Converts natural language into SQL queries',
        },
        {
          name: 'Database Executor',
          description: 'Executes queries on the connected database',
        },
        {
          name: 'Result Formatter',
          description: 'Formats query results into readable output',
        },
      ],
      coming_soon: true,
      className: 'from-teal-400 to-yellow-200/0',
      link: '/rag-gent',
      icon: 'solar:database-bold-duotone',
    },
    {
      name: 'Excel Agent',
      description:
        'An agent designed to analyze, manipulate, and extract insights from Excel files using natural language.',
      tools: [
        {
          'name': 'Excel Parser',
          description: 'Reads and extracts data from Excel files',
        },
        {
          'name': 'Data Analyzer',
          description: 'Performs aggregations, filtering, and calculations',
        },
        {
          'name': 'Report Generator',
          description: 'Generates summaries and insights from the data',
        },
      ],
      coming_soon: true,
      className: 'from-teal-200 to-teal-500/0',
      link: '/rag-gent',
      icon: 'solar:chart-square-bold-duotone',
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((agent) => (
          <Card
            key={agent.name}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className="transition-all duration-200 hover:shadow-lg">
            <Card.Section
              mb="lg"
              className={cn('bg-linear-to-b from-cyan-500 to-blue-500 p-4 pb-10', agent.className)}>
              <div className="flex items-center gap-2">
                <Icon icon={agent.icon} className="text-3xl text-white" />
                <Title order={2} className="text-white">
                  {agent.name}
                </Title>
              </div>
            </Card.Section>

            <Text size="sm" c="dimmed" mb="md">
              {agent.description}
            </Text>

            <div className="space-y-2">
              <Text size="sm" fw={500} mb="xs">
                Tools
              </Text>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                {agent.tools.map((tool) => (
                  <Tooltip label={tool.description} key={tool.name}>
                    <Badge variant="light" className="text-sm normal-case!" c="teal">
                      {tool.name}
                    </Badge>
                  </Tooltip>
                ))}
              </div>
            </div>

            {agent.coming_soon ? (
              <Button
                variant="light"
                leftSection={<Icon icon="solar:chat-round-bold-duotone" />}
                color="yellow"
                fullWidth
                radius="md"
                mt="auto">
                Coming Soon
              </Button>
            ) : (
              <Button
                component={Link}
                to={agent.link}
                leftSection={<Icon icon="solar:chat-round-bold-duotone" />}
                color="blue"
                fullWidth
                radius="md"
                mt="auto"
                disabled={agent.coming_soon}>
                Chat Now
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentsPage;
