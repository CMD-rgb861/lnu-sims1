import { useEffect } from 'react';
import {
  Modal,
  Grid,
  TextInput,
  Button,
  LoadingOverlay,
  Stack,
  Group,
  Select,
  Text,
  Divider,
  ActionIcon,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTrash, IconPlus } from '@tabler/icons-react';

const EmployeeAccountsModal = ({
  opened,
  onClose,
  onSubmit,
  employeeToEdit,
  isSubmitting,
  userTypes = [], 
  userRoles = [],
  colleges = [],
  programs = [] 
}) => {
  const isEditMode = !!employeeToEdit;

  const form = useForm({
    initialValues: {
      id_number: '',
      email_address: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      user_type_id: '',
      roles: [{ role_id: '', college_id: '', program_id: '' }], 
    },
    validate: {
      id_number: (value) => (value.trim().length > 0 ? null : 'ID number is required'),
      email_address: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      first_name: (value) => (value.trim().length > 0 ? null : 'First name is required'),
      last_name: (value) => (value.trim().length > 0 ? null : 'Last name is required'),
      user_type_id: (value) => (isEditMode ? null : (value ? null : 'User type is required')),
    },
  });

  useEffect(() => {
    if (isEditMode && employeeToEdit) {
      form.setValues({
        id_number: employeeToEdit.id_number || '',
        email_address: employeeToEdit.email_address || '',
        first_name: employeeToEdit.first_name || '',
        middle_name: employeeToEdit.middle_name || '',
        last_name: employeeToEdit.last_name || '',
      });
    } else {
      form.reset();
    }
  }, [opened, isEditMode, employeeToEdit]);

  const handleSubmit = (values) => {
    const submissionData = isEditMode ? { ...values, id: employeeToEdit.id } : values;
    onSubmit(submissionData);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? 'Edit Employee Account' : 'New Employee Account'}
      centered
      size="lg" // Increased size to fit the 3-column grid layout cleanly
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
        
        <Stack spacing="md">
          {/* SECTION: Basic Details */}
          <Box>
            <Text fw={600} size="sm" mb="md" c="dimmed">
              Enter Employee Account Details
            </Text>
            <Grid>
              <Grid.Col span={12} md={4}>
                <TextInput
                  withAsterisk
                  label="Employee ID Number"
                  placeholder="e.g. 2023-001"
                  {...form.getInputProps('id_number')}
                />
              </Grid.Col>
              <Grid.Col span={12} md={8}>
                <TextInput
                  withAsterisk
                  label="Email Address"
                  placeholder="e.g. employee@company.com"
                  {...form.getInputProps('email_address')}
                />
              </Grid.Col>
            </Grid>
          </Box>

          {/* SECTION: Name */}
          <Box>
            <Grid>
              <Grid.Col span={12} md={4}>
                <TextInput
                  withAsterisk
                  label="First Name"
                  placeholder="First Name"
                  {...form.getInputProps('first_name')}
                />
              </Grid.Col>
              <Grid.Col span={12} md={4}>
                <TextInput
                  label="Middle Name"
                  placeholder="Middle Name"
                  {...form.getInputProps('middle_name')}
                />
              </Grid.Col>
              <Grid.Col span={12} md={4}>
                <TextInput
                  withAsterisk
                  label="Last Name"
                  placeholder="Last Name"
                  {...form.getInputProps('last_name')}
                />
              </Grid.Col>
            </Grid>
          </Box>

          {/* SECTION: Configuration (Hidden on Edit Mode based on your HTML structure) */}
          {!isEditMode && (
            <Box mt="sm">
              <Divider mb="sm" />
              <Text fw={600} size="sm" mb="md" c="dimmed">
                Employee Account Configuration
              </Text>
              
              <Grid mb="lg">
                <Grid.Col span={12} md={4}>
                  <Select
                    withAsterisk
                    label="User Account Type"
                    placeholder="Select Account Type"
                    data={userTypes}
                    {...form.getInputProps('user_type_id')}
                  />
                </Grid.Col>
              </Grid>

              {/* Dynamic Roles Array */}
              {form.values.roles.map((item, index) => (
                <Box key={index} mb="md" p="sm" style={{ border: '1px solid #eaeaea', borderRadius: '8px' }}>
                  <Group justify="space-between" mb="sm">
                    <Text size="sm" fw={500}>Role {index + 1}</Text>
                    {form.values.roles.length > 1 && (
                      <ActionIcon 
                        color="red" 
                        variant="light" 
                        onClick={() => form.removeListItem('roles', index)}
                      >
                        <IconTrash size="1rem" />
                      </ActionIcon>
                    )}
                  </Group>

                  <Grid>
                    <Grid.Col span={12}>
                      <Select
                        withAsterisk
                        label="User Role"
                        placeholder="Select Role"
                        data={userRoles}
                        {...form.getInputProps(`roles.${index}.role_id`)}
                      />
                    </Grid.Col>
                    
                    {/* You can add conditional rendering here based on the selected role's level, 
                        just like the HTML `d-none` classes did. */}
                    <Grid.Col span={12} md={6}>
                      <Select
                        label="College Affiliation"
                        placeholder="Select College"
                        data={colleges}
                        {...form.getInputProps(`roles.${index}.college_id`)}
                      />
                    </Grid.Col>
                    <Grid.Col span={12} md={6}>
                      <Select
                        label="Program Affiliation"
                        placeholder="Select Program"
                        data={programs}
                        {...form.getInputProps(`roles.${index}.program_id`)}
                      />
                    </Grid.Col>
                  </Grid>
                </Box>
              ))}

              <Button 
                variant="light" 
                color="blue" 
                size="xs" 
                leftSection={<IconPlus size="1rem" />}
                onClick={() => form.insertListItem('roles', { role_id: '', college_id: '', program_id: '' })}
              >
                Add New Role
              </Button>
            </Box>
          )}
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="light" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            color={isEditMode ? "blue" : "green"}
            variant="filled"
            loading={isSubmitting}
          >
            {isEditMode ? 'Save Changes' : 'Create User Account'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default EmployeeAccountsModal;