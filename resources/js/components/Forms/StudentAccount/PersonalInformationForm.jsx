import { useEffect } from 'react';
import {
  Paper,
  TextInput,
  Select,
  Grid,
  Button,
  LoadingOverlay,
  Stack,
  Title,
  Divider,
  Group
} from '@mantine/core';
import { useForm } from '@mantine/form';

const PersonalInformationForm = ({
  form,
  dropdownData,
  onSubmit,
  isSubmitting
}) => {
    // Destructure dropdowns
    const { nationalities, regions, provinces, municipalities, barangays } = dropdownData || {};

    const formatSelectData = (data, valueKey, labelKey) => {
        if (!data) return [];
            return data.map((item) => ({
            value: String(item[valueKey]),
            label: item[labelKey],
        }));
    };
   
    // const handleSubmit = (values) => {
    //     const submissionData = { ...values, id: userDetails?.studentAccount?.id };
    //     onSubmit(submissionData);
    // };

    return (
    <>
        <Grid style={{ overflowX: 'hidden' }} mah="70vh">
            <Grid.Col span={12}>
                <form onSubmit={form.onSubmit(onSubmit)}>
                    <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
                    <Grid>
                        <Grid.Col span={12}>
                        <Stack>
                            <Title order={5} c="dimmed" fw={400} fz="sm" mt="sm">Basic Student Information</Title>
                            <Grid>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                withAsterisk
                                label="Student Number"
                                placeholder="e.g. 2500000"
                                {...form.getInputProps('id_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 8 }}>
                                <TextInput
                                withAsterisk
                                label="Email Address"
                                placeholder="e.g. student@school.edu"
                                {...form.getInputProps('email_address')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                withAsterisk
                                label="First Name"
                                placeholder="First Name"
                                {...form.getInputProps('first_name')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                label="Middle Name"
                                placeholder="Middle Name"
                                {...form.getInputProps('middle_name')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                withAsterisk
                                label="Last Name"
                                placeholder="Last Name"
                                {...form.getInputProps('last_name')}
                                />
                            </Grid.Col> 
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                label="Extension Name"
                                placeholder="e.g. Jr."
                                {...form.getInputProps('ext_name')}
                                />
                            </Grid.Col>


                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                withAsterisk
                                type="date"
                                label="Birthday"
                                {...form.getInputProps('birthday')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
                                withAsterisk
                                label="Gender"
                                placeholder="Select Gender"
                                data={['Male', 'Female']}
                                {...form.getInputProps('gender')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
                                withAsterisk
                                label="Civil Status"
                                placeholder="Select Civil Status"
                                data={['Single', 'Married', 'Separated', 'Widow/Widower']}
                                {...form.getInputProps('civil_status')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                withAsterisk
                                label="Contact Number"
                                placeholder="e.g. 09123456789"
                                {...form.getInputProps('contact_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
                                withAsterisk
                                label="Nationality"
                                placeholder="Select Nationality"
                                searchable
                                data={formatSelectData(nationalities, 'nationality', 'nationality')}
                                {...form.getInputProps('nationality')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
                                withAsterisk
                                label="Blood Type"
                                placeholder="Select Blood Type"
                                data={['Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                                searchable
                                {...form.getInputProps('blood_type')}
                                />
                            </Grid.Col>
                            </Grid>

                            <Divider my="sm" />
                            
                            <Title order={5} c="dimmed" fw={400} fz="sm">Address Details</Title>
                            <Grid>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Select
                                    withAsterisk
                                    label="Region"
                                    placeholder="Select Region"
                                    searchable
                                    data={formatSelectData(regions, 'id', 'name')}
                                    {...form.getInputProps('address_region_id')}
                                    />
                                </Grid.Col>
                                {/* Empty spacer just like the col-xl-8 in your Bootstrap code */}
                                <Grid.Col span={{ base: 12, sm: 8 }} />

                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Select
                                    withAsterisk
                                    label="Province"
                                    placeholder="Select Province"
                                    searchable
                                    disabled={!provinces || provinces.length === 0}
                                    data={formatSelectData(provinces, 'id', 'name')}
                                    {...form.getInputProps('address_province_id')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Select
                                    withAsterisk
                                    label="City/Municipality"
                                    placeholder="Select Municipality"
                                    searchable
                                    disabled={!municipalities || municipalities.length === 0}
                                    data={formatSelectData(municipalities, 'id', 'name')}
                                    {...form.getInputProps('address_municipality_id')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Select
                                    withAsterisk
                                    label="Barangay"
                                    placeholder="Select Barangay"
                                    searchable
                                    disabled={!barangays || barangays.length === 0}
                                    data={formatSelectData(barangays, 'id', 'name')}
                                    {...form.getInputProps('address_barangay_id')}
                                    />
                                </Grid.Col>

                                <Grid.Col span={12}>
                                    <TextInput
                                    withAsterisk
                                    label="Street Address"
                                    placeholder="Street"
                                    {...form.getInputProps('address_street')}
                                    />
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <TextInput
                                    withAsterisk
                                    label="ZIP Code"
                                    placeholder="ZIP Code"
                                    {...form.getInputProps('address_zip_code')}
                                    />
                                </Grid.Col>
                            </Grid>
                            <Group justify='right'>
                                <Button
                                    type="submit"
                                    mt="md"
                                    mr="md"
                                    p="xs"
                                    color="teal"
                                    fz="xs"
                                    loading={isSubmitting}
                                >
                                Save Changes
                                </Button>
                            </Group>
                        </Stack>
                        </Grid.Col>
                    </Grid>
                </form>
            </Grid.Col>
        </Grid>
    </>
    );
};

export default PersonalInformationForm;