import { useParams } from 'react-router';
import { Icon } from '@iconify/react';
import { Badge, Divider, Loader, Title } from '@mantine/core';

import { useLlmModel } from '@/apis/queries/llm-models.queries';
import ModelBuckets from '@/components/modules/llm-models/ModelBuckets';
import { getLlmProviderIcon } from '@/lib/utils';

const ModelPage = () => {
  const { id } = useParams<{ id: string }>();
  const model = useLlmModel(id!);

  if (model.isFetching || model.isLoading) return <Loader />;

  if (!model.data) return <p>Model not Found</p>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Icon icon={getLlmProviderIcon(model.data.provider)} className="text-6xl" />

        <Title>{model.data.display_name}</Title>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Badge
          classNames={{ label: 'normal-case' }}
          size="xl"
          variant="light"
          rightSection={<Badge classNames={{ label: 'normal-case' }}>{model.data.name}</Badge>}>
          Model
        </Badge>

        <Badge
          classNames={{ label: 'normal-case' }}
          size="xl"
          variant="light"
          rightSection={<Badge>{model.data.provider}</Badge>}>
          Provider
        </Badge>

        <Badge
          classNames={{ label: 'normal-case' }}
          size="xl"
          variant="light"
          rightSection={<Badge>{model.data.context_window}</Badge>}>
          Context Window
        </Badge>

        <Badge
          classNames={{ label: 'normal-case' }}
          size="xl"
          variant="light"
          rightSection={<Badge>{model.data.max_output_tokens}</Badge>}>
          Max Output Tokens
        </Badge>
      </div>

      <Divider my="lg" />

      <ModelBuckets model={model.data} />
    </div>
  );
};

export default ModelPage;
