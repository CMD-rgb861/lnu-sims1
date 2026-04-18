import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// UI components
import { Grid, Breadcrumbs, Divider, Title, Text } from '@mantine/core';

import axiosClient from '../../../api/axiosClient'; 
import { Card, Group, Badge, Avatar, Button, Stack, SimpleGrid, Paper, Skeleton, Select } from '@mantine/core';
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
    const [terms, setTerms] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);
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

        // Fetch enrollments for the logged-in student. Server will apply term and availability filters.
        axiosClient.get('/api/g/fetch/enrollments', {
            params: {
                term: selectedTerm || 'current',
                availability: availabilityFilter || 'all'
            }
        })
            .then(res => {
                if (!mounted) return;
                const payload = res?.data || {};
                const data = Array.isArray(payload.enrollments) ? payload.enrollments : payload;
                // if terms provided, set them and default selectedTerm
                if (payload.terms) {
                    setTerms(
                        payload.terms.map(t => ({
                            id: String(t.id),
                            name: `S.Y. ${t.school_year_from}–${t.school_year_to} - ${t.semester}`,
                        }))
                    );
                    if (payload.active_term_id && !selectedTerm) {
                        setSelectedTerm(String(payload.active_term_id));
                    }
                }

                if (Array.isArray(data) && data.length) {
                    // Map backend enrollment rows to the frontend 'subject' shape expected by this page
                    const mapped = data.map(e => {
                        const code = e.course_code || (e.course && (e.course.course_code || e.course.code)) || '';
                        const title = e.course_description || (e.course && (e.course.course_description || e.course.title)) || '';

                        // Prefer relation name, then raw instructor_text, then generic fallbacks
                        const instructorName = e.instructor?.display_name
                            || ((e.instructor && (e.instructor.first_name || e.instructor.last_name)) ? `${e.instructor.first_name || ''} ${e.instructor.last_name || ''}`.trim() : null)
                            || e.instructor?.name
                            || e.instructor_text
                            || (typeof e.instructor === 'string' ? e.instructor : null)
                            || 'Unknown';

                        // try to extract instructor's assigned programs and college (from user_account_role relations)
                        const roles = (e.instructor && e.instructor.user_account_role) ? e.instructor.user_account_role : [];
                        const programSet = new Set();
                        roles.forEach(r => {
                            const p1 = r?.role_program_coordinator?.program_name || r?.role_enrolling_teacher?.program_name;
                            if (p1) programSet.add(p1);
                        });
                        // fallback: if no programs from roles, use enrollment's program relation
                        if (programSet.size === 0 && e.program && e.program.program_name) {
                            programSet.add(e.program.program_name);
                        }
                        const programs = Array.from(programSet);
                        // college fallback: from role_dean or from enrollment's program->department->college
                        let collegeName = roles.map(r => r?.role_dean?.college_name).filter(Boolean)[0] || '';
                        if (!collegeName && e.program && e.program.department && e.program.department.college) {
                            collegeName = e.program.department.college.college_name || '';
                        }

                        // program/department from enrollment's flattened fields (preferred)
                        const programId = e.program_id ?? e.program?.id ?? null;
                        const programName = e.program_name ?? e.program?.program_name ?? null;
                        const departmentName = e.department_name ?? e.program?.department?.dept_name ?? null;
                        const collegeNameFromProgram = e.college_name ?? e.program?.department?.college?.college_name ?? '';

                        // Build a nicer term label fallback: prefer schoolYear.display_name, then year_level as 'Year X', then raw id
                        let termName = '—';
                        if (e.school_year && e.school_year.display_name) {
                            termName = e.school_year.display_name;
                        } else if (e.year_level) {
                            termName = `Year ${e.year_level}`;
                        } else if (e.school_year_id) {
                            termName = String(e.school_year_id);
                        }

                        return {
                            id: e.id, // enrollment row id
                            id_no: e.id_no, // the id_no column (used as foreign id)
                            code,
                            title,
                            year_level: e.year_level || null,
                            program_id: programId,
                            program_name: programName,
                            department_name: departmentName,
                            college_name: collegeNameFromProgram || collegeName,
                            instructor: { id: e.id_no, name: instructorName, programs, college: collegeName },
                            term: { id: e.school_year_id, name: termName },
                            is_available: typeof e.is_available !== 'undefined' ? e.is_available : true,
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
    }, [selectedTerm, availabilityFilter]);

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
                                placeholder="Select term/semester"
                                data={terms.map(t => ({ value: String(t.id), label: t.name }))}
                                value={selectedTerm ? String(selectedTerm) : null}
                                onChange={(v) => setSelectedTerm(v || null)}
                                sx={{ minWidth: 320 }}
                                searchable
                                clearable={false}
                            />

                            <Select
                                placeholder="Filter by availability"
                                data={[
                                    { value: 'all', label: 'All' },
                                    { value: 'available', label: 'OPEN FOR RESPONSES' },
                                    { value: 'unavailable', label: 'CLOSED FOR RESPONSES' },
                                ]}
                                value={availabilityFilter}
                                onChange={(v) => setAvailabilityFilter(v || 'all')}
                                sx={{ width: 160 }}
                            />

                            <Select
                                placeholder="Select a subject to evaluate"
                                data={subjects.map(s => ({ value: String(s.id), label: `${s.code} — ${s.title}`, disabled: !(s.is_available === undefined ? true : s.is_available) }))}
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
                            {subjects.map((s) => {
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
                                            <Button size="xs" onClick={() => openEvaluation(s)} disabled={!isAvailable}>{!isAvailable ? 'CLOSED FOR RESPONSES' : 'Start Evaluation'}</Button>
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