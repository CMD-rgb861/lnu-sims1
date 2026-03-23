import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
    Title,
    Breadcrumbs,
    Anchor,
    Grid,
    Paper,
    Text,
    Divider,
    SimpleGrid,
    Table,
    Center,
    Alert,
    LoadingOverlay,
    Skeleton,
    Stack,
    Group,
    Box
} from '@mantine/core';
import { 
    IconAlertCircle, 
    IconUserCircle, 
    IconCalendarEvent, 
    IconBook2 
} from '@tabler/icons-react';

import { useAuth } from '../../../hooks/useAuth';
import axiosClient from '../../../api/axiosClient';

const AdvisedSubjectsPage = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Breadcrumbs items
    const items = [
        { title: 'Home', href: '/dashboard' },
        { title: 'Pre-Enrollment', href: '#' },
        { title: 'Advised Subjects', href: '#' }
    ].map((item, index) => (
        <Anchor component={Link} to={item.href} key={index} fz={14} fw={400}>
            {item.title}
        </Anchor>
    ));

    const [loading, setLoading] = useState(true);
    const [advisedData, setAdvisedData] = useState(null);

    useEffect(() => {
        const fetchAdvisedSubjects = async () => {
            try {
                // Adjust this to match your actual Laravel API endpoint
                const response = await axiosClient.get(`/api/pe/s/fetch/advised-subjects/${user.id}`);
                setAdvisedData(response.data.advisedSubjects || null);
            } catch (error) {
                console.error("Failed to fetch advised subjects", error);
            } finally {
                setLoading(false);
            }
        };

        if (user.id) {
            fetchAdvisedSubjects();
        }
    }, [user.id]);

    if (loading) {
        return (
            <Grid>
                <Grid.Col span={12}>
                    <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                    <Divider mb="lg" />
                    <Title order={2} mb={4} fw={600} fz={20}>Advised Subjects</Title>
                    <Text fz="xs" fw={500} mb="lg" c="dimmed">View advised subjects for the current semester.</Text>
                    
                    {/* Top Cards Skeleton */}
                    <SimpleGrid cols={{ base: 1, md: 3 }} mb="lg">
                        <Skeleton height={80} radius="md" />
                        <Skeleton height={80} radius="md" />
                        <Skeleton height={80} radius="md" />
                    </SimpleGrid>

                    {/* Table Skeleton */}
                    <Paper withBorder radius="lg" p="xl">
                        <Skeleton height={20} width="30%" mb="xs" radius="md" />
                        <Skeleton height={15} width="40%" mb="xl" radius="md" />
                        <Skeleton height={30} width="100%" radius="md" mb="lg" />
                        <Skeleton height={30} width="100%" radius="md" mb="lg" />
                        <Skeleton height={30} width="100%" radius="md" mb="lg" />
                        <Skeleton height={30} width="100%" radius="md" mb="lg" />
                        <Skeleton height={30} width="100%" radius="md" mb="lg" />
                        <Skeleton height={30} width="100%" radius="md" mb="lg" />
                        <Skeleton height={30} width="100%" radius="md" mb="lg" />
                        <Skeleton height={30} width="100%" radius="md" mb="lg" />
                    </Paper>
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
                    Advised Subjects
                </Title>
                <Text fz="xs" fw={500} mb="lg" c="dimmed">
                    View your officially advised subjects for the current semester.
                </Text>

                {!advisedData ? (
                    // Empty State (Matches the old blade warning)
                    <Center style={{ height: '50vh' }}>
                        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md" p="lg">
                            <Text fw={600}>No Advised Subjects Yet</Text>
                        </Alert>
                    </Center>
                ) : (
                    <>
                        {/* Top Summary Info Grid */}
                        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="lg">
                            <Paper withBorder p="md" radius="md">
                                <Group wrap="nowrap">
                                    <IconBook2 size={32} stroke={1.5} color="var(--mantine-color-blue-6)" />
                                    <Box>
                                        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>School Year</Text>
                                        <Text fw={700} c="blue.7">
                                            {advisedData.school_year?.display_name || 'N/A'}
                                        </Text>
                                    </Box>
                                </Group>
                            </Paper>

                            <Paper withBorder p="md" radius="md">
                                <Group wrap="nowrap">
                                    <IconUserCircle size={32} stroke={1.5} color="var(--mantine-color-gray-6)" />
                                    <Box>
                                        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>Advising Teacher</Text>
                                        <Text fw={700}>
                                            {advisedData.enrolling_teacher?.display_name || 'Not Assigned'}
                                        </Text>
                                    </Box>
                                </Group>
                            </Paper>

                            <Paper withBorder p="md" radius="md">
                                <Group wrap="nowrap">
                                    <IconCalendarEvent size={32} stroke={1.5} color="var(--mantine-color-gray-6)" />
                                    <Box>
                                        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>Advisement Date</Text>
                                        <Text fw={700}>
                                            {advisedData.advisement_date || 'N/A'}
                                        </Text>
                                    </Box>
                                </Group>
                            </Paper>
                        </SimpleGrid>

                        {/* Advised Subjects Table Card */}
                        <Paper withBorder radius="lg" p="xl">
                            <Title order={4} fw={700} mb={4}>List of Advised Subjects</Title>
                            <Text fz="sm" c="dimmed" mb="xl">
                                <Text component="span" fw={600}>Curriculum: </Text>
                                {advisedData.curriculum?.curriculum_name || 'N/A'} ({advisedData.program?.program_name || 'N/A'})
                            </Text>

                            <Table.ScrollContainer minWidth={600}>
                                <Table striped highlightOnHover verticalSpacing="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th w="20%">Course Code</Table.Th>
                                            <Table.Th w="65%">Descriptive Title</Table.Th>
                                            <Table.Th w="15%" style={{ textAlign: 'center' }}>Units</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {advisedData.curriculum?.courses?.length > 0 ? (
                                            advisedData.curriculum.courses.map((course) => (
                                                <Table.Tr key={course.id || course.course_code}>
                                                    <Table.Td fw={600}>{course.course_code}</Table.Td>
                                                    <Table.Td>{course.course_name}</Table.Td>
                                                    <Table.Td style={{ textAlign: 'center' }}>{course.units}</Table.Td>
                                                </Table.Tr>
                                            ))
                                        ) : (
                                            <Table.Tr>
                                                <Table.Td colSpan={3}>
                                                    <Center py="xl">
                                                        <Text c="dimmed">No subjects found for this curriculum.</Text>
                                                    </Center>
                                                </Table.Td>
                                            </Table.Tr>
                                        )}
                                    </Table.Tbody>
                                    <Table.Tfoot>
                                        <Table.Tr>
                                            <Table.Th colSpan={2} style={{ textAlign: 'right' }}>Total Units:</Table.Th>
                                            <Table.Th style={{ textAlign: 'center', fontSize: '16px' }}>
                                                {advisedData.total_units || advisedData.curriculum?.courses?.reduce((sum, course) => sum + Number(course.units), 0) || 0}
                                            </Table.Th>
                                        </Table.Tr>
                                    </Table.Tfoot>
                                </Table>
                            </Table.ScrollContainer>
                        </Paper>
                    </>
                )}
            </Grid.Col>
        </Grid>
    );
};

export default AdvisedSubjectsPage;