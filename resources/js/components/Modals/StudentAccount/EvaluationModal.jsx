import { useEffect, useState } from 'react';
import { Modal, Stack, Text, Textarea, Button, Group, Loader, Alert, SimpleGrid, Box, Divider, Paper, LoadingOverlay, Stepper } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import axiosClient from '../../../api/axiosClient';

// Sections and items modeled after the official paper evaluation form (15 statements)
const sections = [
  {
    title: 'A. Management of Teaching and Learning',
    description:
      'Management of Teaching and Learning refers to the intentional and organized handling of classroom presence, clear communication of academic expectations, efficient use of time, and the purposeful use of student-centered activities that promote critical thinking, independent learning, reflection, decision-making, and continuous academic improvement through constructive feedback.',
    items: [
      'Comes to class on time.',
      'Explains learning outcomes, expectations, grading system, and various requirements of the subject/course.',
      'Maximizes the allocated time/learning hours effectively.',
      'Facilitates students to think critically and creatively by providing appropriate learning activities.',
      'Guides students to learn on their own, reflect on new ideas and experiences, and make decisions in accomplishing given tasks.',
      'Communicates constructive feedback to students for their academic growth.'
    ]
  },
  {
    title: 'B. Content Knowledge, Pedagogy and Technology',
    description:
      'Content Knowledge, Pedagogy and Technology refer to a teacher\'s ability to demonstrate a strong grasp of subject matter, present complex concepts in a clear and accessible way, relate content to real-world contexts and current developments, engage students through appropriate instructional strategies and digital tools, and apply assessment methods aligned with intended learning outcomes.',
    items: [
      'Demonstrates extensive and broad knowledge of the subject/course.',
      'Simplifies complex ideas in the lesson for ease of understanding.',
      'Relates the subject matter to contemporary issues and developments in the discipline and/or daily life activities.',
      'Promotes active learning and student engagement by using appropriate teaching and learning resources including ICT tools and platforms.',
      'Uses appropriate assessments (projects, exams, quizzes, assignments, etc.) aligned with the learning outcomes.'
    ]
  },
  {
    title: 'C. Commitment and Transparency',
    description:
      'Commitment and Transparency refer to the teacher\'s consistent dedication to supporting student learning by acknowledging learner diversity, offering timely academic support and feedback, and upholding fairness and accountability through the use of clear and openly communicated performance criteria.',
    items: [
      'Recognizes and values the unique diversity and individual differences among students.',
      'Assists students with their learning challenges during consultation hours.',
      'Provides immediate feedback on student outputs and performance.',
      'Provides transparent and clear criteria in rating student\'s performance.'
    ]
  }
];

const EvaluationModal = ({ opened, onClose, subject, instructor, term, onSubmitted }) => {
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (opened) {
      setAnswers({});
      setComment('');
      setError(null);
    }
  }, [opened]);

  const setAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const validate = () => {
    // require every question across all sections to be answered
    for (let s = 0; s < sections.length; s++) {
      for (let i = 0; i < sections[s].items.length; i++) {
        const qId = `s${s}_i${i}`;
        if (!answers[qId] && answers[qId] !== 0) return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const totalScore = Object.values(answers).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const maxScore = Object.keys(answers).length * 5;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    const payload = {
      subject_id: subject?.id,
      instructor_id: instructor?.id,
      term_id: term?.id,
      answers,
      comment,
      total_score: totalScore,
      rating_percentage: percentage,
    };

    try {
      // Frontend-only: attempt to post but don't fail hard if backend isn't ready
      await axiosClient.post('/api/student/evaluations', payload);
      if (onSubmitted) onSubmitted(subject?.id);
      onClose();
    } catch (err) {
      // show error but keep modal open so user can retry
      setError(err.response?.data?.message || err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const computeTotal = () => Object.values(answers).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const computePercentage = () => {
    const total = computeTotal();
    const max = Object.keys(answers).length * 5;
    return max > 0 ? Math.round((total / max) * 100) : 0;
  };

  const ratingLabel = (pct) => {
    if (pct >= 91) return 'Outstanding';
    if (pct >= 76) return 'Very Satisfactory';
    if (pct >= 61) return 'Satisfactory';
    if (pct >= 46) return 'Fair';
    return 'Poor';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={subject ? `Evaluate: ${subject.code} — ${subject.title}` : 'Evaluate Subject'}
      size="xl"
      radius="md"
      centered
      closeOnEscape={!submitting}
      closeOnClickOutside={!submitting}
      withCloseButton={!submitting}
    >
      {!subject ? (
        <Stack align="center">
          <Loader />
        </Stack>
      ) : (
        <Paper p="md" radius="md" withBorder style={{ position: 'relative' }}>
          <LoadingOverlay visible={submitting} overlayProps={{ radius: 'md', blur: 2 }} />

          <Stack spacing="sm">
            <Text fw={700} size="lg">{subject.code} — {subject.title}</Text>
            <Text size="sm" c="dimmed">Instructor: {instructor?.name} · Term: {term?.name}</Text>

            {/* Faculty Information (paper form header) */}
            <Paper withBorder radius="sm" p="sm">
              <SimpleGrid cols={2} spacing="xs">
                <Box>
                  <Text fz="xs" c="dimmed">Name of Faculty being Evaluated</Text>
                  <Text fw={600}>{instructor?.name || '—'}</Text>
                </Box>
                <Box>
                  <Text fz="xs" c="dimmed">College/Department</Text>
                  <Text fw={600}>{subject?.department || '—'}</Text>
                </Box>

                <Box>
                  <Text fz="xs" c="dimmed">Course Code/Title</Text>
                  <Text fw={600}>{subject.code} — {subject.title}</Text>
                </Box>
                <Box>
                  <Text fz="xs" c="dimmed">Program Level / Term</Text>
                  <Text fw={600}>{subject?.program || '—'} · {term?.name || '—'}</Text>
                </Box>
              </SimpleGrid>
            </Paper>

            <Alert color="gray" variant="light">
              <Text>Please evaluate your teacher objectively using the following scale:</Text>
              <Text size="sm" mt="xs">5 = Outstanding, 4 = Very Satisfactory, 3 = Satisfactory, 2 = Fair, 1 = Poor.</Text>
            </Alert>

            {error && (
              <Alert color="red">{error}</Alert>
            )}

            {/* Legend */}
            {/* <Group spacing="xs" align="center">
              <Text fw={600}>Scale:</Text>
              {[5,4,3,2,1].map(n => (
                <Text key={n} fw={600} c="dimmed">{n}</Text>
              ))}
            </Group> */}

            <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: 8 }}>
              {/* Top cleaner progress bar + numbered circular steps (like screenshot) */}
              <div style={{ padding: '8px 0 12px 0' }}>
                {/* thin progress bar with fill */}
                <div style={{ position: 'relative', height: 6, background: '#e9ecef', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${((activeStep) / Math.max(1, sections.length - 1)) * 100}%`, background: '#37b24d', transition: 'width 300ms ease' }} />
                </div>

                {/* centered step info */}
                <div style={{ textAlign: 'center', marginTop: 6, marginBottom: 8 }}>
                  <Text fz="xs" c="dimmed">Step {activeStep + 1} of {sections.length}</Text>
                </div>

                {/* numbered circles spaced evenly */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  {sections.map((section, sIdx) => {
                    const isCompleted = sIdx < activeStep;
                    const isActive = sIdx === activeStep;

                    const circleCommon = {
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    };

                    const circleStyle = isCompleted ? { ...circleCommon, background: '#37b24d', color: '#fff' } : isActive ? { ...circleCommon, background: '#37b24d', color: '#fff' } : { ...circleCommon, background: '#fff', color: '#6c757d', border: '1px solid #ced4da' };

                    return (
                      <div key={sIdx} style={{ flex: 1, textAlign: 'center' }}>
                        <div onClick={() => setActiveStep(sIdx)} style={circleStyle}>
                          {isCompleted ? <IconCheck size={16} /> : <span style={{ fontSize: 14 }}>{sIdx + 1}</span>}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <Text fz="xs" c="dimmed">{section.title.replace(/^.{0,30}$/, section.title)}</Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Render only the active section content below the stepper */}
              {(() => {
                const section = sections[activeStep];
                const sIdx = activeStep;
                return (
                  <Box mb="md">
                    <Text fw={700} mt="sm" mb="xs">{section.title}</Text>
                    {section.description && (
                      <Text fz="xs" c="dimmed" mb="xs">{section.description}</Text>
                    )}

                    {/* Header row for rating columns */}
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 36px)', gap: 6, alignItems: 'center' }}>
                      <Box />
                      {[5,4,3,2,1].map(n => (
                        <Box key={n} style={{ textAlign: 'center' }}>
                          <Text fw={600}>{n}</Text>
                        </Box>
                      ))}
                    </Box>

                    {section.items.map((item, iIdx) => {
                      const qId = `s${sIdx}_i${iIdx}`;
                      const val = answers[qId];
                      const previousCount = sections.slice(0, sIdx).reduce((a, b) => a + b.items.length, 0);
                      const displayNumber = previousCount + iIdx + 1;
                      return (
                        <Box key={qId} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 36px)', gap: 6, alignItems: 'center', marginTop: 8 }}>
                          <Box>
                            <Text fz="sm">{`${displayNumber}. ${item}`}</Text>
                          </Box>

                          {[5,4,3,2,1].map((opt) => (
                            <Box key={opt} style={{ textAlign: 'center' }}>
                              <Button
                                size="xs"
                                variant={String(val) === String(opt) ? 'filled' : 'outline'}
                                color={String(val) === String(opt) ? 'blue' : 'gray'}
                                onClick={() => setAnswer(qId, opt)}
                                radius="xs"
                                style={{ minWidth: 30, height: 28, padding: '0 6px' }}
                              >
                                {String(val) === String(opt) ? <IconCheck size={14} /> : String(opt)}
                              </Button>
                            </Box>
                          ))}
                        </Box>
                      );
                    })}

                    <Divider my="sm" />
                  </Box>
                );
              })()}
            </div>

            {/* Totals and rating summary (calculated live) */}
            <Paper withBorder radius="sm" p="sm">
              <Group position="apart">
                <Box>
                  <Text fz="sm" c="dimmed">Total Score</Text>
                  <Text fw={700}>{computeTotal()}</Text>
                </Box>

                <Box>
                  <Text fz="sm" c="dimmed">Max Score</Text>
                  <Text fw={700}>{Object.keys(answers).length * 5 || 0}</Text>
                </Box>

                <Box>
                  <Text fz="sm" c="dimmed">Rating</Text>
                  <Text fw={700}>{computePercentage()}% — {ratingLabel(computePercentage())}</Text>
                </Box>
              </Group>
            </Paper>

            <Text>Comments:</Text>
            <Textarea
              placeholder="Optional comment for the instructor"
              minRows={3}
              value={comment}
              onChange={(e) => setComment(e.currentTarget.value)}
            />

            <Group position="apart">
              <Group>
                <Button variant="light" color="gray" onClick={() => { if (activeStep > 0) setActiveStep(activeStep - 1); else onClose(); }} disabled={submitting} fz="xs">{activeStep > 0 ? 'Back' : 'Cancel'}</Button>
                {activeStep < sections.length - 1 ? (
                  <Button onClick={() => setActiveStep(Math.min(activeStep + 1, sections.length - 1))} disabled={submitting} fz="xs">Next</Button>
                ) : (
                  <Button onClick={handleSubmit} loading={submitting} color="blue" fz="xs">Submit Evaluation</Button>
                )}
              </Group>

              <Button variant="subtle" color="gray" fz="xs">Step {activeStep + 1} of {sections.reduce((a,b) => a + b.items.length, 0)}</Button>
            </Group>
          </Stack>
        </Paper>
      )}
    </Modal>
  );
};

export default EvaluationModal;
