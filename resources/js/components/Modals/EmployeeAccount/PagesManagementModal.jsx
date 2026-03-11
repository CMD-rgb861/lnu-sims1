import { useCallback, useEffect, useMemo } from 'react';
import {
  Modal,
  Grid,
  TextInput,
  Button,
  LoadingOverlay,
  Fieldset,
  Stack,
  Group,
  useMantineColorScheme,
  useMantineTheme
} from '@mantine/core';
import {
  IconAlertCircle,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';

const PagesManagementModal = ({
  opened,
  onClose,
  onSubmit,
  pageToEdit,
  isSubmitting
}) => {

  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  const isEditMode = !!pageToEdit;

  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
    },
    validate: {
      name: (value) => value.trim().length > 0 ? null : 'Page name is required',
      slug: (value) => value.trim().length > 0 ? null : 'Page slug is required',
    },
  });

  useEffect(() => {
    if (isEditMode && pageToEdit) {

      form.setValues({
        name: pageToEdit.name || '',
        slug: pageToEdit.slug || '',
      });
    } else {
      form.reset();
    }
  }, [opened, isEditMode, pageToEdit]); 

  const handleSubmit = (values) => {
    const submissionData = isEditMode ? { ...values, id: pageToEdit.id } : values;
    onSubmit(submissionData);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? `Edit Page` : 'Add Page'}
      centered
      size="sm"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={isSubmitting} overlayBlur={2} />
        <Grid>
          <Grid.Col span={12}>
            <Stack>
                <Grid>
                    <Grid.Col span={12} sm={4}>
                    <TextInput
                        withAsterisk
                        label="Page Name"
                        placeholder="e.g. Roles Management"
                        {...form.getInputProps('name')}
                    />
                    </Grid.Col>
                    <Grid.Col span={12} sm={4}>
                    <TextInput
                        withAsterisk
                        label="Page Slug"
                        placeholder="e.g. roles-management"
                        {...form.getInputProps('slug')}
                    />
                    </Grid.Col>
                </Grid>
              </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="lg">
            <Button variant="light" color="gray" onClick={onClose}>
                Cancel
            </Button>
            <Button
                type="submit"
                color="teal"
                variant="filled"
                loading={isSubmitting}
            >
                {isEditMode ? 'Save Changes' : 'Add Page'}
            </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default PagesManagementModal;