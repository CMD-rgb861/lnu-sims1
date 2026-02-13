import { useEffect } from 'react';
import {
  Paper,
  TextInput,
  Grid,
  Button,
  LoadingOverlay,
  Stack
} from '@mantine/core';
import { useForm } from '@mantine/form';

const UserSettingsAccountsForm = ({
  userDetails,
  onEditUser,
  isSubmitting
}) => {

  const form = useForm({
    initialValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      username: '',
      email: '',
      contact_num: ''
    },
    validate: {
      first_name: (value) => value.trim().length > 0 ? null : 'First name is required',
      last_name: (value) => value.trim().length > 0 ? null : 'Last name is required',
      email: (value) => value.trim().length > 0 ? null : 'Email address is required',
    },
  });

    useEffect(() => {
      if (userDetails) {
        form.setValues({
          first_name: userDetails.first_name || '',
          middle_name: userDetails.middle_name || '',
          last_name: userDetails.last_name || '',
          username: userDetails.username || '',
          email: userDetails.email || '',
          contact_num: userDetails.contact_num || '',
        });
      } else {
        form.reset();
      }
    }, [userDetails]); 

  const handleSubmit = (values) => {
    const submissionData = { ...values, id: userDetails.id } ;
    onEditUser(submissionData)
  };

  return (
    <>
      <Paper withBorder radius="md" p="lg" mx="sm">
        <Grid>
            <Grid.Col span={12}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <LoadingOverlay visible={isSubmitting} overlayBlur={2} />
                    <Grid>
                        <Grid.Col span={12}>
                            <Stack>
                                <Grid>
                                    <Grid.Col span={12} sm={4}>
                                    <TextInput
                                        withAsterisk
                                        label="First Name"
                                        placeholder="e.g. Juan"
                                        {...form.getInputProps('first_name')}
                                    />
                                    </Grid.Col>
                                    <Grid.Col span={12} sm={4}>
                                    <TextInput
                                        label="Middle Name"
                                        placeholder="e.g. Santos"
                                        {...form.getInputProps('middle_name')}
                                    />
                                    </Grid.Col>
                                    <Grid.Col span={12} sm={4}>
                                    <TextInput
                                        withAsterisk
                                        label="Last Name"
                                        placeholder="e.g. Dela Cruz"
                                        {...form.getInputProps('last_name')}
                                    />
                                    </Grid.Col>
                                    <Grid.Col span={12} sm={4}>
                                    <TextInput
                                        withAsterisk
                                        label="Email Address"
                                        placeholder="e.g. juandelacruz@test.com"
                                        {...form.getInputProps('email')}
                                    />
                                    </Grid.Col>
                                    <Grid.Col span={12} sm={4}>
                                    <TextInput
                                        label="Username"
                                        placeholder="e.g. sampleuser"
                                        {...form.getInputProps('username')}
                                    />
                                    </Grid.Col>
                                    <Grid.Col span={12} sm={4}>
                                    <TextInput
                                        label="Contact Number"
                                        placeholder="e.g. 09501234567"
                                        {...form.getInputProps('contact_num')}
                                    />
                                    </Grid.Col>
                                </Grid>
                                <Button
                                    type="submit"
                                    mt="md"
                                    p="xs"
                                    w="30%"
                                    color="teal"
                                    style={{ fontSize: '12px', }}
                                    loading={isSubmitting}
                                >
                                    Save Changes
                                </Button>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </form>
            </Grid.Col>
        </Grid>
      </Paper>
    </>
  );
};

export default UserSettingsAccountsForm;