import { Icon } from '@iconify/react';
import { ActionIcon, Card, Menu, Text, Title } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';

import { useLlmModels, useRemoveLlmModel } from '@/apis/queries/llm-models.queries';
import { getLlmProviderIcon } from '@/lib/utils';

const LlmModelList = () => {
  const models = useLlmModels();
  const removeModel = useRemoveLlmModel();

  const handleRemoveModel = (modelId: string) => {
    openConfirmModal({
      title: 'Are your sure you want to remove this model?',
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: () => {
        removeModel.mutate(modelId);
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {models.data?.map((model) => (
        <Card key={model.id} shadow="lg">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Icon icon={getLlmProviderIcon(model.provider)} className="text-6xl" />
            <div>
              <Title order={3}>{model.name}</Title>
              <Text>{model.provider}</Text>
            </div>

            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" size="lg">
                  <Icon icon="solar:menu-dots-bold-duotone" className="rotate-90 text-2xl" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  leftSection={<Icon icon="solar:trash-bin-2-bold-duotone" />}
                  onClick={() => handleRemoveModel(model.id)}>
                  Remove
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LlmModelList;
