import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// UI components
import { Grid, Breadcrumbs, Divider, Title, Text } from '@mantine/core';

import axiosClient from '../../../api/axiosClient'; 
import { Card, Group, Badge, Avatar, Button, Stack, Loader, Center, SimpleGrid, Paper, Skeleton, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EvaluationModal from '../../../components/Modals/StudentAccount/EvaluationModal';

const EvaluationPage = () => {
    // Breadcrumb items (simple, to avoid undefined variable and runtime crash)
    const items = [
        <Link to="/" key="home">Home</Link>,
        <Link to="/student" key="student">Student</Link>,
        <Text key="current">My Evaluation</Text>,
    ];

    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [submittedIds, setSubmittedIds] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState('all');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');

    // Sample data to use as a graceful fallback while backend isn't wired
    const sampleSubjects = [
        {
            id: 1,
            code: 'CS101',
            title: 'Introduction to Computer Science',
            instructor: { id: 101, name: 'Prof. Alice Mendoza' },
            term: { id: '2025-1', name: '2025-2026 — 1st Semester' },
            is_available: true,
        },
        {
            id: 2,
            code: 'MATH201',
            title: 'Calculus II',
            instructor: { id: 102, name: 'Dr. Juan Dela Cruz' },
            term: { id: '2025-1', name: '2025-2026 — 1st Semester' },
            is_available: false,
        },
    ];

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        // Fetch enrollments for the logged-in student. This endpoint returns rows from
        // the enrollment_courses table (via StudentEvaluationController) and includes
        // the id_no column used by the evaluation page.
        axiosClient.get('/api/g/fetch/enrollments')
            .then(res => {
                if (!mounted) return;
                const data = res?.data;
                if (Array.isArray(data) && data.length) {
                    // Map backend enrollment rows to the frontend 'subject' shape expected by this page
                    const mapped = data.map(e => {
                        const code = e.course_code || (e.course && (e.course.course_code || e.course.code)) || '';
                        const title = e.course_description || (e.course && (e.course.course_description || e.course.title)) || '';
                        const instructorName = e.instructor?.display_name || ((e.instructor && (e.instructor.first_name || e.instructor.last_name)) ? `${e.instructor.first_name || ''} ${e.instructor.last_name || ''}`.trim() : (e.instructor?.name || e.instructor || 'Unknown'));

                        return {
                            id: e.id, // enrollment row id
                            id_no: e.id_no, // the id_no column (used as foreign id)
                            code,
                            title,
                            instructor: { id: e.id_no, name: instructorName },
                            term: { id: e.school_year_id, name: e.school_year?.display_name || String(e.school_year_id) },
                            is_available: true,
                        };
                    });

                    setSubjects(mapped);
                } else {
                    setSubjects(sampleSubjects);
                }
            })
            .catch(err => {
                console.warn('Failed to fetch evaluation subjects, using sample data', err);
                if (mounted) {
                    setError(err);
                    setSubjects(sampleSubjects);
                }
            })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, []);

    function openEvaluation(subject) {
        setSelectedSubject(subject);
        openModal();
    }

    const handleSubmitted = (subjectId) => {
        setSubmittedIds(prev => {
            if (prev.includes(subjectId)) return prev;
            return [...prev, subjectId];
        });
    };

    return (
        <Grid>
            <Grid.Col span={12}>
                <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                <Divider mb="lg" />

                {/* Page Header */}
                <Title align="left" order={2} mb={4} fw={600} fz={20}>
                    My Evaluation
                </Title>
                <Text fz="xs" fw={500} mb="lg" c="dimmed">
                    Evaluate your instructors by subject for the current term. Click a subject to begin.
                </Text>

                {loading ? (
                    <Paper withBorder radius="lg" p="xl" mb="lg">
                        <Skeleton height={30} width="40%" mb="md" radius="md" />
                        <Skeleton height={20} width="60%" mb="sm" radius="md" />
                        <Skeleton height={20} width="50%" mb="xl" radius="md" />
                        <Divider my="md" />

                        <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <Paper key={idx} withBorder radius="md" p="md">
                                    <Skeleton height={18} width="60%" mb="8px" />
                                    <Skeleton height={12} width="40%" mb="8px" />
                                    <Skeleton height={12} width="80%" mt="sm" />
                                </Paper>
                            ))}
                        </SimpleGrid>
                    </Paper>
                ) : (
                    <Stack spacing="md">
                        {error && (
                            <Text c="red" fz="sm">Could not load live data; showing sample subjects.</Text>
                        )}

                        {/* Term selector and availability filter */}
                        <Group mb="md" align="center" spacing="sm">
                            <Select
                                placeholder="Filter by term/semester"
                                data={[{ value: 'all', label: 'All Terms' }, ...Array.from(new Map(subjects.map(s => [s.term?.id, s.term])).values()).map(t => ({ value: String(t.id), label: t.name }))]}
                                value={selectedTerm}
                                onChange={(v) => setSelectedTerm(v || 'all')}
                                sx={{ minWidth: 220 }}
                                searchable
                                clearable
                            />

                            <Select
                                placeholder="Filter by availability"
                                data={[
                                    { value: 'all', label: 'All' },
                                    { value: 'available', label: 'Available' },
                                    { value: 'unavailable', label: 'Unavailable' },
                                ]}
                                value={availabilityFilter}
                                onChange={(v) => setAvailabilityFilter(v || 'all')}
                                sx={{ width: 160 }}
                            />

                            <Select
                                placeholder="Select a subject to evaluate"
                                data={subjects
                                    .filter(s => (selectedTerm === 'all' || String(s.term?.id) === String(selectedTerm)))
                                    .map(s => ({ value: String(s.id), label: `${s.code} — ${s.title}`, disabled: !(s.is_available === undefined ? true : s.is_available) }))}
                                searchable
                                clearable
                                nothingfound="No subjects"
                                onChange={(val) => {
                                    if (!val) return;
                                    const subj = subjects.find(x => String(x.id) === String(val));
                                    if (!subj) return;
                                    const isAvailable = subj.is_available === undefined ? true : subj.is_available;
                                    if (!isAvailable) return; // do nothing on disabled
                                    openEvaluation(subj);
                                }}
                                sx={{ flex: 1 }}
                            />
                        </Group>

                        <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}> 
                            {subjects
                                .filter(s => (selectedTerm === 'all' || String(s.term?.id) === String(selectedTerm)))
                                .filter(s => {
                                    if (availabilityFilter === 'all') return true;
                                    const isAvailable = s.is_available === undefined ? true : s.is_available;
                                    return availabilityFilter === 'available' ? isAvailable : !isAvailable;
                                })
                                .map((s) => {
                                const isAvailable = s.is_available === undefined ? true : s.is_available;
                                return (
                                    <Card key={s.id} shadow="sm" padding="md" radius="md" withBorder style={{ opacity: isAvailable ? 1 : 0.6 }}>
                                        <Group position="apart">
                                            <Group>
                                                <Avatar color="blue" radius="xl">{String(s.instructor.name).split(' ').map(n=>n[0]).join('').slice(0,2)}</Avatar>
                                                <div>
                                                    <Text fw={700}>{s.code} — {s.title}</Text>
                                                    <Text fz="xs" c="dimmed">Instructor: {s.instructor.name}</Text>
                                                    <Text fz="xs" c="dimmed">Term: {s.term.name}</Text>
                                                </div>
                                            </Group>
                                            <Badge color={submittedIds.includes(s.id) ? 'teal' : (isAvailable ? 'gray' : 'red')} variant="light">{submittedIds.includes(s.id) ? 'Submitted' : (isAvailable ? 'Evaluate' : 'Not available')}</Badge>
                                        </Group>

                                        <Group position="right" mt="md">
                                            <Button size="xs" onClick={() => openEvaluation(s)} disabled={!isAvailable}>{!isAvailable ? 'Unavailable' : 'Start Evaluation'}</Button>
                                        </Group>
                                    </Card>
                                );
                            })}
                        </SimpleGrid>
                    </Stack>
                )}
                {/* Evaluation modal */}
                <EvaluationModal
                    opened={modalOpened}
                    onClose={() => { closeModal(); setSelectedSubject(null); }}
                    subject={selectedSubject}
                    instructor={selectedSubject?.instructor}
                    term={selectedSubject?.term}
                    onSubmitted={handleSubmitted}
                />
            </Grid.Col>
        </Grid>
    );
};

export default EvaluationPage;