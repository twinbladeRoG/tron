import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon, Image, Modal, ScrollArea, type ScrollAreaProps } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

interface ImageSliderProps extends ScrollAreaProps {
  sources?: Array<string>;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ sources, ...props }) => {
  const [opened, handler] = useDisclosure();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const selectedImage = useMemo(
    () => (selectedImageIndex !== null ? sources?.[selectedImageIndex] : undefined),
    [sources, selectedImageIndex]
  );

  if (!sources || sources.length === 0) return null;

  return (
    <>
      <ScrollArea h={200} {...props}>
        <div className="flex gap-2">
          {sources?.map((image, index) => (
            <Image
              // eslint-disable-next-line @eslint-react/no-array-index-key, react-x/no-array-index-key
              key={index}
              onClick={() => {
                setSelectedImageIndex(index);
                handler.open();
              }}
              radius="md"
              src={`data:image/png;base64,${image}`}
              alt="image"
              className="aspect-video max-h-[200px]"
            />
          ))}
        </div>
      </ScrollArea>

      <Modal centered size={'100%'} opened={opened} onClose={handler.close}>
        <Image
          radius="md"
          src={`data:image/png;base64,${selectedImage}`}
          alt="image"
          className="h-auto w-full"
        />

        <div className="mt-4 flex w-full justify-center gap-2">
          <ActionIcon
            variant="light"
            disabled={selectedImageIndex === 0}
            onClick={() => setSelectedImageIndex((prev) => (prev !== null ? prev - 1 : 0))}>
            <Icon icon="solar:arrow-left-bold-duotone" />
          </ActionIcon>
          <ActionIcon
            variant="light"
            disabled={selectedImageIndex === (sources ?? []).length - 1}
            onClick={() => setSelectedImageIndex((prev) => (prev !== null ? prev + 1 : 0))}>
            <Icon icon="solar:arrow-right-bold-duotone" />
          </ActionIcon>
        </div>
      </Modal>
    </>
  );
};

export default ImageSlider;
