import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useAddFileToKnowledgeBase } from '@/apis/queries/knowledge-base.queries';
import { cn } from '@/lib/utils';

import SelectFiles from '../shared/form/SelectFiles';

interface AddFilesProps {
  className?: string;
  knowledgeBaseId: string;
}

const schema = yup.object({
  file_ids: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Must select minimum of 1 file')
    .required('Required'),
});

const AddFiles: React.FC<AddFilesProps> = ({ knowledgeBaseId, className }) => {
  const form = useForm({ resolver: yupResolver(schema), defaultValues: { file_ids: [] } });
  const addFiles = useAddFileToKnowledgeBase();

  const handleSubmit = form.handleSubmit((data) => {
    addFiles.mutate(
      { id: knowledgeBaseId, fileIds: data.file_ids },
      {
        onSuccess: () => {
          form.reset();
        },
        onError: (err) => {
          notifications.show({
            message: err.message,
            color: 'red',
          });
        },
      }
    );
  });

  return (
    <form className={cn('grid grid-cols-[1fr_auto] gap-4', className)} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="file_ids"
        render={({ field, fieldState }) => (
          <SelectFiles
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button type="submit" size="lg" loading={addFiles.isPending}>
        Add
      </Button>
    </form>
  );
};

export default AddFiles;
