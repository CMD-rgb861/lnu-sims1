import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Paper, Title, Grid, SimpleGrid, Text, Center, Badge, Divider, Alert, Stack, Group, Box, Button, Anchor, Breadcrumbs, Skeleton, LoadingOverlay, Select, Card, useMantineColorScheme } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconCalendar, IconClock, IconArrowUpRight, IconSchool, IconUser, IconFilter } from '@tabler/icons-react';

import axiosClient from '../../../api/axiosClient';
import { useAuth } from '../../../hooks/useAuth';
import PreviousPreEnrollmentCards from '../../../components/Cards/StudentAccount/PreviousPreEnrollmentCards';

// --- Helper Functions ---
const getSemester = (val) => {
    if (val === 1 || val === "1") return 'First Semester';
    if (val === 2 || val === "2") return 'Second Semester';
    if (val === 3 || val === "3") return 'Summer';
    return 'Semester not specified';
};

const getYearLevel = (val) => {
    if (val === 1 || val === "1") return '1st Year';
    if (val === 2 || val === "2") return '2nd Year';
    if (val === 3 || val === "3") return '3rd Year';
    if (val === 4 || val === "4") return '4th Year';
    return 'Year level not specified';
};

const getEnrollmentType = (val) => {
    if (val === 1 || val === "1") return 'New Student';
    if (val === 2 || val === "2") return 'Continuing Student';
    if (val === 3 || val === "3") return 'Shiftee/Returnee';
    if (val === 4 || val === "4") return 'Transferree';
    return 'Enrollment type not specified';
};

const getAcadStanding = (val) => {
    if (val === 1 || val === "1") return { label: 'Regular Student', color: 'green' };
    if (val === 2 || val === "2") return { label: 'Irregular Student', color: 'yellow' };
    return { label: 'Pending Advisement', color: 'gray' };
};

const PreEnrollmentRecordsPage = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Breadcrumbs items
    const items = [
        { title: 'Home', href: '/dashboard' },
        { title: 'Pre-Enrollment', href: '#' },
        { title: 'Pre-Enrollment Records', href: '#' }
    ].map((item, index) => (
        <Anchor component={Link} to={item.href} key={index} fz={14} fw={400}>
            {item.title}
        </Anchor>
    ));

    // States
    const [loading, setLoading] = useState(true);
    const [currentEnrollment, setCurrentEnrollment] = useState(null);
    const [previousEnrollments, setPreviousEnrollments] = useState([]);
    const [rescheduled, setRescheduled] = useState(false);
    const [enrollmentSchedule, setEnrollmentSchedule] = useState('TBA');
    const [enrollmentScheduleTime, setEnrollmentScheduleTime] = useState('TBA');

    // Filter States
    const [yearFilter, setYearFilter] = useState('');
    const [standingFilter, setStandingFilter] = useState('');

    const { colorScheme } = useMantineColorScheme();

    useEffect(() => {
        const fetchPreEnrollmentData = async () => {
            try {
                const targetId = user.id;
                const response = await axiosClient.get(`/api/pe/s/fetch/records/${targetId}`);
                
                const data = response.data;
                setCurrentEnrollment(data.currentEnrollment || null);

                const rawPrevRecords = data.previousEnrollments;
                let extractedRecords = [];

                if (rawPrevRecords) {
                    if (Array.isArray(rawPrevRecords)) {
                        extractedRecords = rawPrevRecords;
                    } else if (rawPrevRecords.id) {
                        extractedRecords = [rawPrevRecords];
                    } else if (rawPrevRecords.data && Array.isArray(rawPrevRecords.data)) {
                        extractedRecords = rawPrevRecords.data;
                    } else {
                        extractedRecords = Object.values(rawPrevRecords);
                    }
                }

                setPreviousEnrollments(extractedRecords);

                setRescheduled(data.rescheduled || false);
                setEnrollmentSchedule(data.enrollmentSchedule);
                setEnrollmentScheduleTime(data.enrollmentScheduleTime);
            } catch (error) {
                console.error("Error fetching pre-enrollment data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user.id) {
            fetchPreEnrollmentData();
        }
    }, [user.id]);

    const getStatusStyles = () => {
        return {
            bg: colorScheme === 'dark' ? 'dark.7' : 'gray.0',
            status: currentEnrollment?.enrollment_status === true ? 1 : 0
        };
    };

    const styles = getStatusStyles();
    const acadStanding = getAcadStanding(currentEnrollment?.acad_standing);

    // Filter Logic
    const filteredPreviousEnrollments = previousEnrollments.filter(pe => {
        if (!pe) return false;
        const matchYear = !yearFilter || yearFilter === 'all' || pe.school_year?.id?.toString() === yearFilter;
        const matchStanding = !standingFilter || standingFilter === 'all' || pe.acad_standing?.toString() === standingFilter;
        return matchYear && matchStanding;
    });

    if (loading) {
        return (
            <Grid>
                <Grid.Col span={12}>
                    <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">
                        {items}
                    </Breadcrumbs>
                    <Divider mb="lg" />
                    <Title align="left" order={2} mb={4} fw={600} fz={20}>
                        Pre-Enrollment Records
                    </Title>
                    <Text fz="xs" fw={500} mb="lg" c="dimmed">
                        View and manage your pre-enrollment details and records.
                    </Text>
                    
                    <Grid>
                        <Grid.Col span={12}>
                            <Paper withBorder radius="lg" p="lg" mb="lg">
                                <Skeleton height={30} width="40%" mb="md" radius="md" />
                                <Skeleton height={20} width="60%" mb="sm" radius="md" />
                                <Skeleton height={20} width="50%" mb="xl" radius="md" />
                                <Divider my="md" />
                                <Skeleton height={40} width="100%" radius="md" />
                            </Paper>
                        </Grid.Col>
                    </Grid>

                    <Title align="left" order={4} mb="md" fw={600} fz="md">
                        Previous Pre-Enrollment Records
                    </Title>

                    {/* Filters Skeleton */}
                    <Grid align="center" mb="xl">
                        <Grid.Col span="content">
                            <Skeleton height={20} width={80} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 3 }}>
                            <Skeleton height={36} radius="md" />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 3 }}>
                            <Skeleton height={36} radius="md" />
                        </Grid.Col>
                    </Grid>

                    <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                        <Card withBorder radius="lg" p="md">
                            <Card.Section 
                                h={100} 
                                style={{ 
                                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, rgb(225, 225, 225)100%)' 
                                }} 
                            >
                                <Group p="lg">
                                    <Skeleton height={60} width="40%" mb="md" radius="md" opacity={0.3}/>
                                </Group>
                            </Card.Section>
                
                            <Group mt="md" wrap="nowrap">
                                <IconSchool size={20} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                                <Skeleton height={20} width="40%" mb="md" radius="md" />
                            </Group>

                            <Skeleton height={20} width="40%" mb="md" radius="md" />
                
                            <Card.Section inheritPadding mt="sm" pb="md">
                                <Divider my="sm" />
                                <SimpleGrid cols={3}>
                                    <Box>
                                        <Text fz="xs" c="dimmed" fw={400} mb={2}>Year Level</Text>
                                        <Skeleton height={10} width="40%" mb="md" radius="md" />
                                    </Box>
                                    <Box>
                                        <Text fz="xs" c="dimmed" fw={400} mb={2}>Type</Text>
                                        <Skeleton height={10} width="40%" mb="md" radius="md" />
                                    </Box>
                                    <Box>
                                        <Text fz="xs" c="dimmed" fw={400} mb={2}>Acad. Standing</Text>
                                        <Skeleton height={10} width="40%" mb="md" radius="md" />
                                    </Box>
                                </SimpleGrid>
                            </Card.Section>
                        </Card>
                    </SimpleGrid>
                </Grid.Col>
            </Grid>
        );
    }

    return (
        <Grid>
            <Grid.Col span={12}>
                <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                <Divider mb="lg" />
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                
                <Title align="left" order={2} mb={4} fw={600} fz={20}>
                    Pre-Enrollment Records
                </Title>
                <Text fz="xs" fw={500} mb="lg" c="dimmed">
                    View and manage your pre-enrollment details and records.
                </Text>

                {/* Current Enrollment Details Card */}
                {currentEnrollment && (
                    <Paper p="xl" radius="lg" bg={styles.bg} withBorder mb="xl">
                        {/* Header Section: Title and Academic Standing */}
                        <Group justify="space-between" align="flex-start" mb="lg">
                            <Title order={4} fw={500} fz="sm">Current Pre-Enrollment Details</Title>
                            { currentEnrollment.program.college_id === 4 ? (
                                <Badge color="indigo" size="lg" radius="sm" variant="light">
                                    Graduate School
                                </Badge>
                            ) : (
                                <Badge color={acadStanding.color} size="lg" radius="sm" variant="light">
                                    {acadStanding.label}
                                </Badge>
                            )}
                        </Group>

                        {/* Body Section: Academic Information */}
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                            <Stack gap={4}>
                                <Text fz="xs" tt="uppercase" fw={600} c="dimmed">School Year & Term</Text>
                                <Text fw={700} fz={25} lts={-1.5}>S.Y. {currentEnrollment.school_year?.school_year_from} - {currentEnrollment.school_year?.school_year_to}</Text>
                                <Text fz="md" fw={500}>{getSemester(currentEnrollment.school_year?.semester)}</Text>
                            </Stack>

                            <Stack gap={4}>
                                <Text fz="xs" tt="uppercase" fw={600} c="dimmed">Year Level & Enrollee Type</Text>
                                <Group gap="xs" wrap="nowrap">
                                    <IconUser size={20} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                                    <Text fw={700} fz="sm">{getYearLevel(currentEnrollment.year_level)}</Text>
                                    <Text fz="sm" fw={400} c="dimmed">({getEnrollmentType(currentEnrollment.enrollment_type)})</Text>
                                </Group>
                            </Stack>

                            <Stack gap={4}>
                                <Text fz="xs" tt="uppercase" fw={600} c="dimmed">Program</Text>
                                <Group gap="xs" wrap="nowrap">
                                    <IconSchool size={20} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                                    <Text fw={700} fz="sm" style={{ lineHeight: 1.2 }}>
                                        {currentEnrollment?.program?.program_name}
                                    </Text>
                                </Group>
                            </Stack>
                        </SimpleGrid>

                        <Divider my="lg" />

                        {/* Footer Section: Alerts, Schedule, and Actions */}
                        {rescheduled && (
                            <Alert icon={<IconAlertCircle size={16} />} color="yellow" mb="md" fw={600} radius="lg" variant="light" >
                                <Text fz="sm" fw={500}>You have been re-scheduled due to non-appearance. Strictly follow your new schedule below to avoid delays:</Text>
                            </Alert>
                        )}

                        <Group justify="space-between" align="flex-end">
                            <Box>
                                {styles.status !== 1 ? (
                                    <Stack gap={6}>
                                        <Text fw={600} size="xs" tt="uppercase" c="dimmed">
                                            {rescheduled ? 'New Enrollment Schedule' : 'Enrollment Schedule'}
                                        </Text>
                                        <Group gap="xs">
                                            <Badge size="lg" radius="lg" color="blue" variant="light" leftSection={<IconCalendar size={14}/>}>
                                                {enrollmentSchedule}
                                            </Badge> 
                                            <Badge size="lg" radius="lg" color="blue" variant="light" leftSection={<IconClock size={14}/>}>
                                                {enrollmentScheduleTime}
                                            </Badge>
                                        </Group>
                                    </Stack>
                                ) : (
                                    <Alert 
                                        size="xs" 
                                        icon={<IconCheck size={14} />} 
                                        color="green"
                                        radius="xl" 
                                        py={5}
                                        px="sm" 
                                        variant="light" 
                                        styles={{
                                            icon: { marginRight: '1px' } 
                                        }}>
                                        <Text fw={600} fz="sm">Officially Enrolled</Text>
                                    </Alert>
                                )}
                            </Box>

                            <Button 
                                variant="subtle" 
                                color="blue"
                                radius="md"
                                fz="xs"
                                rightSection={<IconArrowUpRight size={16} />}
                                disabled={Number(currentEnrollment?.acad_standing) === 1}
                                // onClick={() => openEditModal()} 
                            >
                                Update Pre-Enrollment Details
                            </Button>
                        </Group>
                    </Paper>
                )}

                <Title align="left" order={4} mb="md" fw={600} fz="md">
                    Previous Pre-Enrollment Records
                </Title>

                {/* Filters */}
                <Grid align="center" mb="xl">
                    <Grid.Col span="content">
                        <Text fw={500} fz="sm" c="dimmed"><IconFilter size={14}/>  Filter by:</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Select
                            placeholder="By School Year/Semester"
                            size="sm"
                            data={[
                                { value: 'all', label: 'Show All' },
                                ...previousEnrollments
                                    .filter(pe => pe && pe.school_year && pe.school_year.id) 
                                    .map(pe => ({
                                        value: pe.school_year.id.toString(),
                                        label: `S.Y. ${pe.school_year.school_year_from}-${pe.school_year.school_year_to} - ${getSemester(pe.school_year.semester)}`
                                    }))
                            ]}
                            value={yearFilter}
                            onChange={setYearFilter}
                            clearable
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Select
                            placeholder="By Academic Standing"
                            size="sm"
                            data={[
                                { value: 'all', label: 'Show All' },
                                { value: '1', label: 'Regular Student' },
                                { value: '2', label: 'Irregular Student' },
                            ]}
                            value={standingFilter}
                            onChange={setStandingFilter}
                            clearable
                        />
                    </Grid.Col>
                </Grid>

                {/* Previous Records Content */}
                {filteredPreviousEnrollments.length === 0 ? (
                    <Center style={{ height: '30vh' }}>
                        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="lg">
                            <Text fz="sm" fw={500}>No Previous Records Found</Text>
                        </Alert>
                    </Center>
                ) : (
                    <PreviousPreEnrollmentCards records={filteredPreviousEnrollments} />
                )}
            </Grid.Col>
        </Grid>
    );
};

export default PreEnrollmentRecordsPage;