import { useEffect } from 'react';
import {
  Text,
  Paper,
  rem,
  TextInput,
  NumberInput,
  Grid,
  Button,
  ActionIcon,
  Menu,
  Badge,
  Group,
  Avatar,
  LoadingOverlay,
  Stack
} from '@mantine/core';
import { useForm } from '@mantine/form';

const BarangayDetailsForm = ({
  currentBarangay,
  onEditBarangay,
  isSubmitting
}) => {

  const form = useForm({
    initialValues: {
      name: '',
      population: ''
    },
    validate: {
      name: (value) => value.trim().length > 0 ? null : 'Barangay name is required',
    },
  });

    useEffect(() => {
      if (currentBarangay) {
        form.setValues({
          name: currentBarangay.barangay_name || '',
          population: currentBarangay.population || '',
        });
      } else {
        form.reset();
      }
    }, [currentBarangay]); 

  const handleSubmit = (values) => {
    const submissionData = { ...values, id: currentBarangay.id } ;
    onEditBarangay(submissionData)
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
                                        label="Barangay Name"
                                        placeholder="e.g. Poblacion"
                                        {...form.getInputProps('name')}
                                    />
                                    </Grid.Col>
                                    <Grid.Col span={12} sm={4}>
                                    <NumberInput
                                        label="Population"
                                        placeholder="Enter population value"
                                        {...form.getInputProps('population')}
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

export default BarangayDetailsForm;