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
  userDetails,
  dropdownData,
  onSubmit,
  isSubmitting
}) => {
  // Destructure dropdowns
  const { nationalities, regions, provinces, municipalities, barangays } = dropdownData || {};

  // Helper to format dropdown data for Mantine Selects
  const formatSelectData = (data, valueKey, labelKey) => {
    if (!data) return [];
    return data.map((item) => ({
      value: String(item[valueKey]),
      label: item[labelKey],
    }));
  };

  const form = useForm({
    initialValues: {
      id_number: '',
      email_address: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      birthday: '',
      gender: '',
      civil_status: '',
      contact_number: '',
      nationality: '',
      blood_type: '',
      address_region_id: '',
      address_province_id: '',
      address_municipality_id: '',
      address_barangay_id: '',
      address_street: '',
      address_zip_code: '',
    },
    validate: {
      first_name: (value) => (value.trim().length > 0 ? null : 'First name is required'),
      last_name: (value) => (value.trim().length > 0 ? null : 'Last name is required'),
      email_address: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      id_number: (value) => (value.trim().length > 0 ? null : 'Student number is required'),
    },
  });

  useEffect(() => {
    if (userDetails) {
      form.setValues({
        // From studentAccount
        id_number: userDetails.studentAccount?.id_number || '',
        email_address: userDetails.studentAccount?.email_address || '',
        first_name: userDetails.studentAccount?.first_name || '',
        middle_name: userDetails.studentAccount?.middle_name || '',
        last_name: userDetails.studentAccount?.last_name || '',
        
        // From studentProfile
        birthday: userDetails.studentProfile?.birthday || '',
        gender: userDetails.studentProfile?.gender || '',
        civil_status: userDetails.studentProfile?.civil_status || '',
        contact_number: userDetails.studentProfile?.contact_number || '',
        blood_type: userDetails.studentProfile?.blood_type || '',
        
        // Address Details (Casted to String for Mantine Select)
        nationality: userDetails.studentProfile?.nationality ? String(userDetails.studentProfile?.nationality) : '',
        address_region_id: userDetails.studentProfile?.address_region_id ? String(userDetails.studentProfile.address_region_id) : '',
        address_province_id: userDetails.studentProfile?.address_province_id ? String(userDetails.studentProfile.address_province_id) : '',
        address_municipality_id: userDetails.studentProfile?.address_municipality_id ? String(userDetails.studentProfile.address_municipality_id) : '',
        address_barangay_id: userDetails.studentProfile?.address_barangay_id ? String(userDetails.studentProfile.address_barangay_id) : '',
        address_street: userDetails.studentProfile?.address_street || '',
        address_zip_code: userDetails.studentProfile?.address_zip_code || '',
      });
    } else {
      form.reset();
    }
  }, [userDetails]);

  const handleSubmit = (values) => {
    // Merge the values with the student account ID
    const submissionData = { ...values, id: userDetails?.studentAccount?.id };
    onSubmit(submissionData);
  };

  return (
    <>
        <Grid style={{ overflowX: 'hidden' }} mah="70vh">
            <Grid.Col span={12}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
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
                                type="date"
                                label="Birthday"
                                {...form.getInputProps('birthday')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
                                label="Gender"
                                placeholder="Select Gender"
                                data={['Male', 'Female']}
                                {...form.getInputProps('gender')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
                                label="Civil Status"
                                placeholder="Select Civil Status"
                                data={['Single', 'Married', 'Separated', 'Widow/Widower']}
                                {...form.getInputProps('civil_status')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                label="Contact Number"
                                placeholder="e.g. 09123456789"
                                {...form.getInputProps('contact_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
                                label="Nationality"
                                placeholder="Select Nationality"
                                searchable
                                data={formatSelectData(nationalities, 'nationality', 'nationality')}
                                {...form.getInputProps('nationality')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
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
                                    label="Street Address"
                                    placeholder="Street"
                                    {...form.getInputProps('address_street')}
                                    />
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <TextInput
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