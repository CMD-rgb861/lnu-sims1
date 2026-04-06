import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Grid,
    Paper,
    Title,
    Text,
    Center,
    Alert,
    Stack,
    Group,
    Divider,
    Anchor,
    Breadcrumbs,
    Select,
    Table,
    Badge,
    Box,
    Skeleton,
    TextInput,
    useMantineColorScheme
} from '@mantine/core';
import { IconAlertCircle, IconFilter, IconBook2, IconSearch } from '@tabler/icons-react';

import axiosClient from '../../../api/axiosClient'; 

const GradesPage = () => {
    // States
    const [gradeData, setGradeData] = useState([]);
    const [semesterFilter, setSemesterFilter] = useState('all');
    const [semesters, setSemesters] = useState([]);
    const [programFilter, setProgramFilter] = useState('all');
    const [programs, setPrograms] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    // Breadcrumbs
    const items = [
        { title: 'Home', href: '/dashboard' },
        { title: 'Grades', href: '#' }
    ].map((item, index) => (
        <Anchor component={Link} to={item.href} key={index} fz={14} fw={400}>
            {item.title}
        </Anchor>
    ));

    // Initial Fetch (Dropdowns)
    useEffect(() => {
        fetchPrograms();
        fetchSemesters();
    }, []);

    // Dependent Fetch (Grades based on filters)
    useEffect(() => {
        fetchGrades();
    }, [semesterFilter, programFilter]);

    const fetchGrades = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosClient.get(`api/g/fetch/grades`, {
                params: {
                    semester: semesterFilter,
                    program: programFilter,
                }
            });
            setGradeData(res.data);
        } catch (err) {
            setError("Error fetching grades. Please try again later.");
            console.error("Error fetching grades:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSemesters = async () => {
        try {
            const res = await axiosClient.get(`api/g/fetch/semesters`);
            setSemesters(res.data);
        } catch (err) {
            console.error("Error fetching semesters:", err);
        }
    };

    const fetchPrograms = async () => {
        try {
            const res = await axiosClient.get(`api/g/fetch/programs`);
            setPrograms(res.data);
        } catch (err) {
            console.error("Error fetching programs:", err);
        }
    };

    const filteredGradeData = gradeData.map(termBlock => {
        const query = searchQuery.toLowerCase();
        
        const filteredRows = termBlock.rows.filter(row => {
            return (
                row.code?.toLowerCase().includes(query) ||
                row.title?.toLowerCase().includes(query)
            );
        });
        return { ...termBlock, rows: filteredRows };
    }).filter(termBlock => termBlock.rows.length > 0);

    return (
        <Grid>
            <Grid.Col span={12}>
                <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                <Divider mb="lg" />
                
                {/* Page Header */}
                <Title align="left" order={2} mb={4} fw={600} fz={20}>
                    My Grades
                </Title>
                <Text fz="xs" fw={500} mb="lg" c="dimmed">
                    View your academic performance, grades, and term averages.
                </Text>

                {/* Error Alert */}
                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="lg" radius="md">
                        <Text fz="sm" fw={500}>{error}</Text>
                    </Alert>
                )}

                {/* Filters Section */}
                <Grid align="center" mb="xl" >
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <TextInput
                            placeholder="Search course code or title..."
                            size="sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            clearable
                        />
                    </Grid.Col>
                    
                    <Grid.Col span="content">
                        <Text fw={500} fz="sm" c="dimmed"><IconFilter size={14} style={{ verticalAlign: 'middle' }}/> Filter by:</Text>
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Select
                            placeholder="Select Semester"
                            size="sm"
                            data={[
                                { value: 'all', label: 'All Semesters' },
                                ...semesters.map(s => ({ 
                                    value: s.id.toString(), 
                                    label: s.label 
                                }))
                            ]}
                            value={semesterFilter}
                            onChange={(val) => setSemesterFilter(val || 'all')}
                            searchable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Select
                            placeholder="Select Program"
                            size="sm"
                            data={[
                                { value: 'all', label: 'All Programs' },
                                ...programs.map(p => ({ 
                                    value: p.id.toString(), 
                                    label: p.label 
                                }))
                            ]}
                            value={programFilter}
                            onChange={(val) => setProgramFilter(val || 'all')}
                            searchable
                        />
                    </Grid.Col>

                </Grid>

                {/* Main Content Area */}
                <Box pos="relative" style={{ minHeight: '30vh' }}>
                    
                    {/* Skeleton Loader mapped for two-column layout */}
                    {loading && (
                        <Grid>
                            {[1, 2, 3, 4].map((item) => (
                                <Grid.Col span={{ base: 12, lg: 6 }} key={item}>
                                    <Paper withBorder radius="lg" shadow="sm" overflow="hidden" mb="md">
                                        <Group justify="space-between" p="md" bg={isDark ? 'dark.7' : 'gray.0'} style={{ borderBottom: `1px solid ${isDark ? '#373A40' : '#E9ECEF'}` }}>
                                            <Stack gap={6}>
                                                <Skeleton height={20} width={150} />
                                                <Skeleton height={12} width={200} />
                                            </Stack>
                                            <Skeleton height={28} width={100} radius="md" />
                                        </Group>
                                        <Box p="md">
                                            <Skeleton height={24} mb="sm" />
                                            <Skeleton height={24} mb="sm" />
                                            <Skeleton height={24} mb="sm" />
                                            <Skeleton height={24} />
                                        </Box>
                                    </Paper>
                                </Grid.Col>
                            ))}
                        </Grid>
                    )}

                    {/* Empty State */}
                    {!loading && filteredGradeData.length === 0 && !error && (
                        <Center style={{ height: '30vh' }}>
                            <Alert icon={<IconBook2 size={16} />} color="gray" variant="light" radius="lg">
                                <Text fz="sm" fw={500}>
                                    {searchQuery ? "No matching courses found for your search." : "No grades available for the selected filters."}
                                </Text>
                            </Alert>
                        </Center>
                    )}

                    {/* Grades Data Mapping */}
                    {!loading && filteredGradeData.length > 0 && (
                        <Grid>
                            {filteredGradeData.map((termBlock, index) => {
                                const programName = termBlock.rows.find(r => r.program)?.program || 'Program not specified';

                                return (
                                    <Grid.Col span={{ base: 12, lg: 6 }} key={index}>
                                        <Paper withBorder radius="lg" overflow="hidden" mb="md" h="100%">
                                            
                                            {/* Term Header */}
                                            <Group justify="space-between" p="md" bg={isDark ? 'dark.7' : 'gray.0'} style={{ borderBottom: `1px solid ${isDark ? '#373A40' : '#E9ECEF'}` }}>
                                                <Stack gap={0}>
                                                    <Text fw={700} fz="lg">{termBlock.term}</Text>
                                                    <Text fz="xs" fw={500} c="dimmed">{programName}</Text>
                                                </Stack>
                                                <Badge size="lg" radius="md" variant="light" color="blue">
                                                    Sem GWA: {termBlock.semGWA || 'N/A'}
                                                </Badge>
                                            </Group>

                                            {/* Term Grades Table */}
                                            <Box style={{ overflowX: 'auto' }}>
                                                <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md" radius="xl">
                                                    <Table.Thead bg={isDark ? 'dark.6' : 'gray.0'}>
                                                        <Table.Tr>
                                                            <Table.Th><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Course Code</Text></Table.Th>
                                                            <Table.Th><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Descriptive Title</Text></Table.Th>
                                                            <Table.Th ta="center"><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Units</Text></Table.Th>
                                                            <Table.Th ta="center"><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Final Rating</Text></Table.Th>
                                                            <Table.Th ta="center"><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Instructor</Text></Table.Th>
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {termBlock.rows.map((row, i) => (
                                                            <Table.Tr key={i}>
                                                                <Table.Td fw={700} fz="sm">{row.code}</Table.Td>
                                                                <Table.Td>
                                                                    <Text fz="sm" truncate="end" style={{ maxWidth: '200px' }} title={row.title}>
                                                                        {row.title}
                                                                    </Text>
                                                                </Table.Td>
                                                                <Table.Td ta="center" fz="sm">{row.units}</Table.Td>
                                                                <Table.Td ta="center">
                                                                    <Badge color={row.rating > 3.0 ? 'red' : 'green'} variant="light" size="md">
                                                                        {row.rating}
                                                                    </Badge>
                                                                </Table.Td>
                                                                <Table.Td ta="center">
                                                                    <Text fz="sm" c="dimmed" truncate="end" style={{ maxWidth: '120px' }} title={row.instructor}>
                                                                        {row.instructor}
                                                                    </Text>
                                                                </Table.Td>
                                                            </Table.Tr>
                                                        ))}
                                                    </Table.Tbody>
                                                </Table>
                                            </Box>
                                        </Paper>
                                    </Grid.Col>
                                );
                            })}
                        </Grid>
                    )}
                </Box>
            </Grid.Col>
        </Grid>
    );
};

export default GradesPage;