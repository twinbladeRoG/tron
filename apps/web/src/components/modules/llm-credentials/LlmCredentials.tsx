import { useState } from 'react';
import { Button, Divider, Drawer, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import type { ILlmCredential } from '@/types';

import LlmCredentialForm from './LlmCredentialForm';
import LlmCredentialTable from './LlmCredentialTable';

const LlmCredentials = () => {
  const [opened, handlers] = useDisclosure();
  const [editingCredential, setEditingCredential] = useState<ILlmCredential | null>(null);

  const handleCreate = () => {
    setEditingCredential(null);
    handlers.open();
  };

  const handleEdit = (credential: ILlmCredential) => {
    setEditingCredential(credential);
    handlers.open();
  };

  const handleClose = () => {
    setEditingCredential(null);
    handlers.close();
  };

  return (
    <div>
      <div className="flex">
        <Title>LLM Credentials</Title>
        <Button ml="auto" onClick={handleCreate}>
          Add
        </Button>
      </div>

      <Divider my="md" />

      <LlmCredentialTable onEdit={handleEdit} />

      <Drawer
        position="right"
        opened={opened}
        onClose={handleClose}
        title={editingCredential ? 'Edit LLM Credential' : 'Add LLM Credential'}>
        <LlmCredentialForm credential={editingCredential} onSubmit={handleClose} />
      </Drawer>
    </div>
  );
};

export default LlmCredentials;
