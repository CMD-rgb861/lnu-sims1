import { useEffect } from 'react';
import {
  Modal,
  Grid,
  TextInput,
  Textarea,
  Select,
  Switch,
  Button,
  LoadingOverlay,
  Stack,
  Group,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';

const DashboardAlertsModal = ({
  opened,
  onClose,
  onSubmit,
  alertToEdit,
  isSubmitting
}) => {
  const isEditMode = !!alertToEdit;

  const today = new Date();

  const form = useForm({
    initialValues: {
      title: '',
      message: '',
      category: '1', // Stored as string in Select, converted to int on submit
      is_dismissible: true,
      show_until: null,
    },
    validate: {
      title: (value) => value.trim().length > 0 ? null : 'Title is required',
      message: (value) => value.trim().length > 0 ? null : 'Message is required',
      category: (value) => value ? null : 'Category is required',
      // If NOT dismissible, show_until becomes required
      show_until: (value, values) => 
        (!values.is_dismissible && !value) ? 'Expiry date is required for non-dismissible alerts' : null,
    },
  });

  // Sync data when editing
  useEffect(() => {
    if (isEditMode && alertToEdit) {
      form.setValues({
        title: alertToEdit.title || '',
        message: alertToEdit.message || '',
        category: alertToEdit.category?.toString() || '1',
        is_dismissible: alertToEdit.is_dismissible ?? true,
        show_until: alertToEdit.show_until ? new Date(alertToEdit.show_until) : null,
      });
    } else {
      form.reset();
    }
  }, [opened, isEditMode, alertToEdit]);

  const handleSubmit = (values) => {
    // Convert category back to integer for the backend
    const submissionData = {
      ...values,
      category: parseInt(values.category),
      id: isEditMode ? alertToEdit.id : undefined,
    };
    onSubmit(submissionData);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? `Edit Alert` : 'Post New Alert'}
      centered
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={isSubmitting} overlayBlur={2} />
        
        <Stack>
          <Grid>
            {/* Title */}
            <Grid.Col span={12}>
              <TextInput
                withAsterisk
                label="Alert Title"
                placeholder="e.g. Scheduled Water Interruption"
                {...form.getInputProps('title')}
              />
            </Grid.Col>

            {/* Category Selection */}
            <Grid.Col span={12} sm={6}>
              <Select
                label="Nature of Announcement"
                placeholder="Pick one"
                data={[
                  { value: '1', label: 'Information (Blue)' },
                  { value: '2', label: 'Success/Update (Teal)' },
                  { value: '3', label: 'Warning (Orange)' },
                  { value: '4', label: 'Urgent/Danger (Red)' },
                ]}
                {...form.getInputProps('category')}
              />
            </Grid.Col>

            {/* Expiry Date */}
            <Grid.Col span={12} sm={6}>
              <DateTimePicker
                clearable
                label="Show Until"
                description="When should this alert disappear?"
                placeholder="Pick date and time"
                minDate={today}
                {...form.getInputProps('show_until')}
              />
            </Grid.Col>

            {/* Message Body */}
            <Grid.Col span={12}>
              <Textarea
                withAsterisk
                label="Message Content"
                placeholder="Provide the full details of the announcement..."
                minRows={4}
                {...form.getInputProps('message')}
              />
            </Grid.Col>

            {/* Dismissible Toggle */}
            <Grid.Col span={12}>
                <Switch
                    label="Allow users to dismiss this alert"
                    description="If turned off, the alert will stay until the 'Show Until' date passes."
                    {...form.getInputProps('is_dismissible', { type: 'checkbox' })}
                />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl">
            <Button variant="light" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="teal"
              loading={isSubmitting}
            >
              {isEditMode ? 'Update Alert' : 'Post Alert'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default DashboardAlertsModal;