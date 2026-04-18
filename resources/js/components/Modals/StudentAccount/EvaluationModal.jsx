import { useEffect, useState } from 'react';
import { Modal, Stack, Text, Textarea, Button, Group, Loader, Alert, SimpleGrid, Box, Paper, LoadingOverlay, Progress } from '@mantine/core';
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

  const totalSteps = sections.length + 1;
  const reviewStepIndex = sections.length;
  const progressValue = totalSteps > 1 ? (activeStep / (totalSteps - 1)) * 100 : 100;
  const activeSection = activeStep < sections.length ? sections[activeStep] : null;
  const isReviewStep = activeStep === reviewStepIndex;
  const affiliationLabel = subject?.department_name && subject?.program_name
    ? `${subject.department_name} - ${subject.program_name}`
    : (subject?.department_name || subject?.program_name || subject?.college_name || instructor?.college || '—');
  const programLevelLabel = subject?.year_level ? `Year ${subject.year_level}` : (subject?.program_name || '—');
  const shortStepLabels = ['Management', 'Content & Pedagogy', 'Commitment', 'Review'];
  const answeredInActiveSection = activeStep < sections.length
    ? sections[activeStep].items.filter((_, iIdx) => {
      const v = answers[`s${activeStep}_i${iIdx}`];
      return v || v === 0;
    }).length
    : 0;
  const totalInActiveSection = activeStep < sections.length ? sections[activeStep].items.length : 0;
  const canProceedToNext = isReviewStep || answeredInActiveSection === totalInActiveSection;

  const ratingLabel = (pct) => {
    if (pct >= 91) return 'Outstanding';
    if (pct >= 76) return 'Very Satisfactory';
    if (pct >= 61) return 'Satisfactory';
    if (pct >= 46) return 'Fair';
    return 'Poor';
  };

  const infoValueStyle = {
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    lineHeight: 1.35,
  };

  const infoLabelStyle = {
    minHeight: 18,
    lineHeight: 1.2,
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={subject ? (
        <Stack spacing={3} style={{ minWidth: 0 }}>
          <Group position="apart" align="center" spacing="xs" noWrap>
            <Text fw={700} size="sm">Evaluation progress</Text>
            <Group spacing={8} noWrap>
              <Text size="xs" c="dimmed">Step {activeStep + 1} of {totalSteps}</Text>
              {activeStep < sections.length && (
                <Text size="xs" fw={600} c={canProceedToNext ? 'teal' : 'dimmed'}>
                  Answered {answeredInActiveSection}/{totalInActiveSection}
                </Text>
              )}
            </Group>
          </Group>

          <Progress value={progressValue} size="xs" radius="xl" color="green" />

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 8,
              alignItems: 'center',
            }}
          >
            {sections.map((section, sIdx) => {
              const isCompleted = sIdx < activeStep;
              const isActive = sIdx === activeStep;

              return (
                <Box key={section.title} style={{ textAlign: 'center', minWidth: 0 }}>
                  <Text size="xs" fw={isActive ? 700 : 500} c={isCompleted || isActive ? 'dark' : 'dimmed'} lineClamp={1}>
                    {shortStepLabels[sIdx] || section.title.replace(/^\w\.\s*/, '')}
                  </Text>
                </Box>
              );
            })}

            <Box style={{ textAlign: 'center', minWidth: 0 }}>
              <Text size="xs" fw={activeStep === reviewStepIndex ? 700 : 500} c={activeStep === reviewStepIndex ? 'dark' : 'dimmed'} lineClamp={1}>
                Review & Submit
              </Text>
            </Box>
          </Box>
        </Stack>
      ) : 'Faculty Evaluation'}
      size="xl"
      radius="md"
      centered
      closeOnEscape={!submitting}
      closeOnClickOutside={!submitting}
      // Keep only the footer Cancel button as the close control.
      withCloseButton={false}
      styles={{
        header: { alignItems: 'flex-start', paddingBottom: 8 },
        title: { width: '100%', marginRight: 8 },
        body: { paddingTop: 8 },
      }}
    >
      {!subject ? (
        <Stack align="center">
          <Loader />
        </Stack>
      ) : (
        <Paper p="md" radius="md" withBorder style={{ position: 'relative' }}>
          <LoadingOverlay visible={submitting} overlayProps={{ radius: 'md', blur: 2 }} />

          <Stack spacing="md" style={{ maxHeight: '72vh' }}>
            <Box style={{ overflowY: 'auto', paddingRight: 4 }}>
              <Stack spacing="md">
            <Paper withBorder radius="md" p="md">
              <Stack spacing="xs">
                <Text fw={700} size="sm">A. Faculty Information</Text>

                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 12,
                  }}
                >
                  <Box style={{ minWidth: 0 }}>
                    <Text fz="xs" c="dimmed" style={infoLabelStyle}>Name of Faculty being Evaluated</Text>
                    <Text fw={600} style={infoValueStyle}>{instructor?.name || '—'}</Text>
                  </Box>

                  <Box style={{ minWidth: 0 }}>
                    <Text fz="xs" c="dimmed" style={infoLabelStyle}>College/Department</Text>
                    <Text fw={600} style={infoValueStyle}>{affiliationLabel}</Text>
                  </Box>

                  <Box style={{ minWidth: 0 }}>
                    <Text fz="xs" c="dimmed" style={infoLabelStyle}>Course Code/Title</Text>
                    <Text fw={600} style={infoValueStyle}>{`${subject?.code || '—'} — ${subject?.title || '—'}`}</Text>
                  </Box>

                  <Box style={{ minWidth: 0 }}>
                    <Text fz="xs" c="dimmed" style={infoLabelStyle}>Program Level</Text>
                    <Text fw={600} style={infoValueStyle}>{programLevelLabel}</Text>
                  </Box>

                  <Box style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                    <Text fz="xs" c="dimmed" style={infoLabelStyle}>Semester or Term/Academic Year</Text>
                    <Text fw={600} style={infoValueStyle}>{term?.name || '—'}</Text>
                  </Box>
                </Box>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="sm">
              <Stack spacing="xs">
                <Text fw={700} size="sm">B. Rating Scale</Text>
                <Box style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12, textAlign: 'center' }}>Scale</th>
                        <th style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12, textAlign: 'left' }}>Qualitative Description</th>
                        <th style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12, textAlign: 'left' }}>Operational Definition</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12, textAlign: 'center' }}>5</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Always manifested</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Evident in nearly all relevant situations (91-100% of instances).</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12, textAlign: 'center' }}>4</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Often manifested</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Evident most of the time, with occasional lapses (61-90%).</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12, textAlign: 'center' }}>3</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Sometimes manifested</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Evident about half the time (31-60%).</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12, textAlign: 'center' }}>2</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Seldom manifested</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Infrequently demonstrated; rarely evident in relevant situations (11-30%).</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12, textAlign: 'center' }}>1</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Never/Rarely manifested</td>
                        <td style={{ border: '1px solid #ced4da', padding: '6px', fontSize: 12 }}>Seldom demonstrated; almost never evident, with only isolated cases (0-10%).</td>
                      </tr>
                    </tbody>
                  </table>
                </Box>
              </Stack>
            </Paper>

            {error && (
              <Alert color="red">{error}</Alert>
            )}

            {activeStep < sections.length ? (
              <Paper withBorder radius="md" p="md">
                <Stack spacing="sm">
                  <Box>
                    <Text fw={700} size="sm" mb={4}>C. Instruction:</Text>
                    <Text size="sm">
                      Read the benchmark statements carefully. Please rate the faculty on each of the following
                      statements below using the above-listed rating scale.
                    </Text>
                  </Box>

                  <div style={{ maxHeight: '45vh', overflowY: 'auto', paddingRight: 8, borderTop: '1px solid #e9ecef', paddingTop: 10 }}>
                    {(() => {
                      const section = activeSection;
                      const sIdx = activeStep;
                      return (
                        <Box>
                          <Text fw={700} mb="xs">{section.title}</Text>
                          {section.description && (
                            <Text fz="xs" c="dimmed" mb="xs">{section.description}</Text>
                          )}

                          <Box
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr repeat(5, 36px)',
                              gap: 6,
                              alignItems: 'center',
                              position: 'sticky',
                              top: 0,
                              zIndex: 2,
                              background: 'var(--mantine-color-body)',
                              padding: '6px 0',
                              borderBottom: '1px solid #e9ecef',
                            }}
                          >
                            <Box>
                              <Text size="xs" fw={600} c="dimmed">Statements</Text>
                            </Box>
                            {[5,4,3,2,1].map(n => (
                              <Box key={n} style={{ textAlign: 'center' }}>
                                <Text fw={700}>{n}</Text>
                              </Box>
                            ))}
                          </Box>

                          {section.items.map((item, iIdx) => {
                            const qId = `s${sIdx}_i${iIdx}`;
                            const val = answers[qId];
                            const previousCount = sections.slice(0, sIdx).reduce((a, b) => a + b.items.length, 0);
                            const displayNumber = previousCount + iIdx + 1;

                            const isAnswered = val || val === 0;

                            return (
                              <Box
                                key={qId}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr repeat(5, 36px)',
                                  gap: 6,
                                  alignItems: 'center',
                                  marginTop: 8,
                                  padding: '4px 0',
                                  borderRadius: 6,
                                  background: isAnswered ? '#f1f8ff' : 'transparent',
                                }}
                              >
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
                        </Box>
                      );
                    })()}
                  </div>
                </Stack>
              </Paper>
            ) : (
              <Paper withBorder radius="md" p="md">
                <Stack spacing="sm">
                  <Box>
                    <Text fw={700} size="sm">Review & Submit</Text>
                    <Text size="xs" c="dimmed">This final section shows your score summary and optional comment before submission.</Text>
                  </Box>

                  <Group position="apart" align="flex-start">
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

                  <Textarea
                    label="Comments"
                    placeholder="Optional comment for the instructor"
                    minRows={3}
                    value={comment}
                    onChange={(e) => setComment(e.currentTarget.value)}
                  />
                </Stack>
              </Paper>
            )}

            {!canProceedToNext && activeStep < sections.length && (
              <Alert color="yellow" variant="light">
                <Text size="sm">Please answer all items in this section before proceeding.</Text>
              </Alert>
            )}

              </Stack>
            </Box>

            <Group position="apart">
              <Group>
                <Button variant="light" color="gray" onClick={() => { if (activeStep > 0) setActiveStep(activeStep - 1); else onClose(); }} disabled={submitting} fz="xs">{activeStep > 0 ? 'Back' : 'Cancel'}</Button>
                {activeStep < reviewStepIndex ? (
                  <Button onClick={() => setActiveStep(Math.min(activeStep + 1, reviewStepIndex))} disabled={submitting || !canProceedToNext} fz="xs">Next</Button>
                ) : (
                  <Button onClick={handleSubmit} loading={submitting} color="blue" fz="xs">Submit Evaluation</Button>
                )}
              </Group>
            </Group>
          </Stack>
        </Paper>
      )}
    </Modal>
  );
};

export default EvaluationModal;
