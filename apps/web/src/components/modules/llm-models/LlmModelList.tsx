import { Link } from 'react-router';
import { Icon } from '@iconify/react';
import { ActionIcon, Anchor, Card, Menu, Text } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

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
        removeModel.mutate(modelId, {
          onError: (err) => {
            notifications.show({
              message: err.message,
              color: 'red',
            });
          },
        });
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
              <Anchor
                component={Link}
                to={`/admin/models/${model.id}`}
                className="text-xl! font-bold!">
                {model.display_name}
              </Anchor>
              <Text>{model.name}</Text>
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
