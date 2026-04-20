import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// UI components
import { Grid, Breadcrumbs, Divider, Title, Text } from '@mantine/core';

import axiosClient from '../../../api/axiosClient'; 
import { Card, Group, Badge, Avatar, Button, Stack, SimpleGrid, Paper, Skeleton, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EvaluationModal from '../../../components/Modals/StudentAccount/EvaluationModal';
import StudentEvaluationViewModal from '../../../components/Modals/StudentAccount/StudentEvaluationViewModal';

const EvaluationPage = () => {
    // Breadcrumb items (simple, to avoid undefined variable and runtime crash)
    const items = [
        <Link to="/" key="home">Home</Link>,
        <Link to="/student" key="student">Student</Link>,
        <Text key="current">My Evaluation</Text>,
    ];

    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedViewSubject, setSelectedViewSubject] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [terms, setTerms] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [availabilityFilter, setAvailabilityFilter] = useState('all');

    // Do not use sample fallback data in production - show empty list if backend has none

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        // Fetch enrollments for the logged-in student. Server will apply term and availability filters.
    axiosClient.get('/api/eval/fetch/enrollments', {
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
                            is_open: typeof t.is_open !== 'undefined' ? !!t.is_open : false,
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
                            is_submitted: typeof e.is_submitted !== 'undefined' ? e.is_submitted : false,
                            submission_id: e.submission_id ?? null,
                            submitted_at: e.submitted_at ?? null,
                        };
                    });

                    setSubjects(mapped);
                } else {
                    // No enrollments returned for the selected term/filters
                    setSubjects([]);
                }
            })
            .catch(err => {
                console.warn('Failed to fetch evaluation subjects', err);
                if (mounted) {
                    setError(err);
                    // clear subjects so UI shows no real data instead of sample placeholders
                    setSubjects([]);
                }
            })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, [selectedTerm, availabilityFilter]);

    function openEvaluation(subject) {
        setSelectedSubject(subject);
        openModal();
    }

    function openViewEvaluation(subject) {
        setSelectedViewSubject(subject);
        openViewModal();
    }

    const handleSubmitted = (subjectId, submissionId = null) => {
        // mark subject as submitted in the subjects list so UI updates immediately and persist on refresh
        setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, is_submitted: true, is_available: false, submission_id: submissionId ?? s.submission_id, submitted_at: submissionId ? new Date().toISOString() : s.submitted_at } : s));
        // Do not automatically open the view modal after submission; user can click "View Evaluation" when ready.
    };

    // compute selected term open/closed once so badges follow the term selector status
    const selectedTermObj = selectedTerm ? terms.find(t => String(t.id) === String(selectedTerm)) : null;
    const selectedTermIsOpen = selectedTermObj ? !!selectedTermObj.is_open : true;

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
                                placeholder="Filter by status"
                                data={[
                                    { value: 'all', label: 'All' },
                                    { value: 'for_evaluation', label: 'For Evaluation' },
                                    { value: 'evaluated', label: 'Evaluated' },
                                ]}
                                value={availabilityFilter}
                                onChange={(v) => setAvailabilityFilter(v || 'all')}
                                sx={{ width: 160 }}
                            />

                            <Select
                                placeholder="Select a subject to evaluate"
                                data={subjects.map(s => ({ value: String(s.id), label: `${s.code} — ${s.title}`, disabled: (!(s.is_available === undefined ? true : s.is_available) || s.is_submitted) }))}
                                searchable
                                clearable
                                nothingfound="No subjects"
                                onChange={(val) => {
                                    if (!val) return;
                                    const subj = subjects.find(x => String(x.id) === String(val));
                                    if (!subj) return;
                                    const isAvailable = subj.is_available === undefined ? true : subj.is_available;
                                    if (!isAvailable || subj.is_submitted) return; // do nothing on disabled or already submitted
                                    openEvaluation(subj);
                                }}
                                sx={{ flex: 1 }}
                            />

                            {/* Right-aligned evaluation status for the selected term */}
                            <div style={{ marginLeft: 'auto' }}>
                                { /* Compute status based on whether any subject for the selected term is available and not yet submitted */ }
                                {(() => {
                                    const termId = selectedTerm ? String(selectedTerm) : null;
                                    const termObj = termId ? terms.find(t => String(t.id) === String(termId)) : null;
                                    const hasTerm = !!termObj;
                                    const isOpen = hasTerm ? !!termObj.is_open : false;
                                    const label = !hasTerm ? 'No term selected' : (isOpen ? 'Open for Evaluation' : 'Closed for Evaluation');
                                    const color = !hasTerm ? 'gray' : (isOpen ? 'green' : 'red');
                                    return (
                                        <Badge color={color} variant="light">{label}</Badge>
                                    );
                                })()}
                            </div>
                        </Group>

                        {/* Fallback message when there are no subjects to display */}
                        {(!loading && Array.isArray(subjects) && subjects.length === 0) && (
                            <Paper withBorder radius="md" p="md" mb="md">
                                <Text fw={600}>No subjects found</Text>
                                <Text fz="sm" c="dimmed">There are no available subjects for the selected term or filters.</Text>
                                {error && <Text fz="sm" c="red" mt="sm">Error loading data: {String(error?.message || error)}</Text>}
                            </Paper>
                        )}

                        <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}> 
                            {subjects.map((s) => {
                                const isAvailable = s.is_available === undefined ? true : s.is_available;
                                return (
                                    <Card key={s.id} shadow="sm" padding="md" radius="md" withBorder>
                                        {/* Dim only the content area when not available, keep action button full-bright */}
                                        <div style={{ opacity: isAvailable ? 1 : 0.6 }}>
                                            <Group position="apart">
                                                <Group>
                                                    <Avatar color="blue" radius="xl">{String(s.instructor.name).split(' ').map(n=>n[0]).join('').slice(0,2)}</Avatar>
                                                    <div>
                                                        <Text fw={700}>{s.code} — {s.title}</Text>
                                                        <Text fz="xs" c="dimmed">Instructor: {s.instructor.name}</Text>
                                                        <Text fz="xs" c="dimmed">Term: {s.term.name}</Text>
                                                    </div>
                                                </Group>
                                                {/* Render multiple badges: Evaluated (teal) can appear together with Closed (red) */}
                                                {(() => {
                                                    const badges = [];

                                                    // Evaluated badge when student already submitted
                                                    if (s.is_submitted) {
                                                        badges.push(
                                                            <Badge key="evaluated" color="teal" variant="light" style={{ marginRight: 8 }}>Evaluated</Badge>
                                                        );
                                                    }

                                                    // For Evaluation (active) when the selected term is open, subject available, and not yet submitted
                                                    if (selectedTermIsOpen && isAvailable && !s.is_submitted) {
                                                        badges.push(
                                                            <Badge key="for" color="red" variant="light">For Evaluation</Badge>
                                                        );
                                                    }

                                                    // Closed for Evaluation when the selected term is closed (can coexist with Evaluated)
                                                    if (!selectedTermIsOpen) {
                                                        badges.push(
                                                            <Badge key="closed" color="red" variant="light" style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: 12 }}>
                                                                Closed for Evaluation
                                                            </Badge>
                                                        );
                                                    }

                                                    return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{badges}</div>;
                                                })()}
                                            </Group>
                                        </div>

                                        <Group position="right" mt="md">
                                            {/* Ensure clickable buttons keep the same visible color even when the card content is faded for completed items */}
                                            <Button
                                                size="xs"
                                                color={(s.is_submitted || isAvailable) ? 'blue' : undefined}
                                                onClick={() => s.is_submitted ? openViewEvaluation(s) : openEvaluation(s)}
                                                disabled={!isAvailable && !s.is_submitted}
                                                style={{ opacity: 1 }}
                                            >
                                                {s.is_submitted ? 'View Evaluation' : (!isAvailable ? 'Closed for Evaluation' : 'Start Evaluation')}
                                            </Button>
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
                {/* View-only modal for submitted evaluations */}
                <StudentEvaluationViewModal
                    opened={viewModalOpened}
                    onClose={() => { closeViewModal(); setSelectedViewSubject(null); }}
                    subject={selectedViewSubject}
                />
            </Grid.Col>
        </Grid>
    );
};

export default EvaluationPage;