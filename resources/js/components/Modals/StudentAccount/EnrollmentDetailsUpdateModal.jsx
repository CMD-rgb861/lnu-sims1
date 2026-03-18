import { 
    Modal, 
    Button, 
    Text, 
    Alert, 
    Select, 
    Stack, 
    Group, 
    Divider, 
    Box 
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle, IconX } from '@tabler/icons-react';

const getSemesterLabel = (semester) => {
    if (semester === 1 || semester === "1") return "1st Semester";
    if (semester === 2 || semester === "2") return "2nd Semester";
    return "Summer";
};

const getYearLevelLabel = (level) => {
    if (level === 1 || level === "1") return "1st Year";
    if (level === 2 || level === "2") return "2nd Year";
    if (level === 3 || level === "3") return "3rd Year";
    return "4th Year";
};

const getEnrollmentType = (type) => {
    if (type === 1 || type === "1") return "New/Freshmen Student";
    if (type === 2 || type === "2") return "Continuing Student";
    if (type === 3 || type === "3") return "Shiftee/Returnee";
    return "Transferee";
};

const EnrollmentDetailsUpdateModal = ({ 
    opened, 
    onSubmit, 
    isSubmitting, 
    activeSchoolYear, 
    previousEnrollment, 
    programs,
    onLogout
}) => {
    
    const form = useForm({
        initialValues: {
            program_id: '',
            year_level: '',
            enrollment_type: '',
        },
        validate: {
            program_id: (value) => (!value ? 'Please select a program' : null),
            year_level: (value) => (!value ? 'Please select a year level' : null),
            enrollment_type: (value) => (!value ? 'Please select an enrollment type' : null),
        },
    });

    const handleSubmit = (values) => {
        onSubmit(values);
    };

    return (
        <Modal
            opened={opened}
            onClose={() => {}} // Disabled intentionally
            title={<Text fw={700} size="lg">Update Enrollment Details</Text>}
            size="md"
            radius="md"
            closeOnClickOutside={false}
            withCloseButton={false}
            closeOnEscape={false}
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    
                    {/* Active School Year Section */}
                    <Box>
                        {activeSchoolYear ? (
                            <>
                                <Text size="xl" fw={800} style={{ letterSpacing: '-1px' }}>
                                    S.Y. {activeSchoolYear.school_year_from} - {activeSchoolYear.school_year_to}
                                </Text>
                                <Text size="lg" fw={500} style={{ letterSpacing: '-1px' }}>
                                    {getSemesterLabel(activeSchoolYear.semester)}
                                </Text>
                            </>
                        ) : (
                            <Text c="yellow.7" size="lg" fw={700}>
                                No Active School Year
                            </Text>
                        )}
                    </Box>

                    {/* Instructions Alert */}
                    <Alert variant="light" color="gray" icon={<IconInfoCircle />} title="Instructions:">
                        <Text size="sm">
                            Please update your enrollment details for this semester. Ensure that the selected program and year level is correct.
                        </Text>
                    </Alert>

                    {/* Previous Enrollment Details */}
                    {previousEnrollment ? (
                        <Alert variant="light" color="blue" icon={<IconInfoCircle />} title="Previous Enrollment Details:">
                            <Divider my="sm" color="blue.2" />
                            <Text size="sm" fw={600}>
                                Program: <Text component="span" fw={400}>{previousEnrollment.program?.program_name}</Text>
                            </Text>
                            <Text size="sm" fw={600}>
                                Year Level: <Text component="span" fw={400}>{getYearLevelLabel(previousEnrollment.year_level)}</Text>
                            </Text>
                        </Alert>
                    ) : (
                        <Group gap="xs" px="sm">
                            <IconX size={16} color="gray" />
                            <Text size="sm" c="dimmed">No previous enrollment records found.</Text>
                        </Group>
                    )}

                    {/* Form Fields */}
                    <Select
                        withAsterisk
                        label="Program"
                        placeholder="Select Program"
                        data={programs?.map(p => ({
                            value: p.id.toString(),
                            label: p.program_name
                        })) || []}
                        searchable
                        {...form.getInputProps('program_id')}
                    />

                    <Select
                        withAsterisk
                        label="Year Level"
                        placeholder="Select Year Level"
                        data={[
                            { value: '1', label: '1st Year' },
                            { value: '2', label: '2nd Year' },
                            { value: '3', label: '3rd Year' },
                            { value: '4', label: '4th Year' },
                        ]}
                        {...form.getInputProps('year_level')}
                    />

                    <Select
                        withAsterisk
                        label="Enrollment Type"
                        placeholder="Select Enrollment Type"
                        data={[
                            { value: '1', label: 'New Student' },
                            { value: '2', label: 'Continuing Student' },
                            { value: '3', label: 'Shiftee/Returnee' },
                            { value: '4', label: 'Transferee' },
                        ]}
                        {...form.getInputProps('enrollment_type')}
                    />

                    {/* Submit Button */}
                    <Group justify="flex-end" mt="md">
                        <Button fz="xs" variant="subtle" color="gray" onClick={onLogout}>Logout</Button>
                        <Button 
                            fz="xs"
                            variant="light"
                            type="submit" 
                            color="green" 
                            loading={isSubmitting}
                        >
                            Save Changes
                        </Button>
                    </Group>

                </Stack>
            </form>
        </Modal>
    );
};

export default EnrollmentDetailsUpdateModal;