import { useEffect, useState } from 'react';
import { Modal, Stack, Text, Paper, Box, Group, Loader, LoadingOverlay, Progress, Badge } from '@mantine/core';
import axiosClient from '../../../api/axiosClient';

// reuse the sections definition from the interactive modal; keep same order/keys
const sections = [
  {
    title: 'A. Management of Teaching and Learning',
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
    items: [
      'Recognizes and values the unique diversity and individual differences among students.',
      'Assists students with their learning challenges during consultation hours.',
      'Provides immediate feedback on student outputs and performance.',
      'Provides transparent and clear criteria in rating student\'s performance.'
    ]
  }
];

const StudentEvaluationViewModal = ({ opened, onClose, subject }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState('');
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!opened) return;
    setError(null);
    setAnswers({});
    setComment('');
    setMeta(null);

    if (!subject?.submission_id) {
      setError('No submission id available');
      return;
    }

    setLoading(true);
    axiosClient.get(`/api/eval/evaluations/${subject.submission_id}`)
      .then(res => {
        const sub = res?.data?.submission;
        if (!sub) {
          setError('Submission not found');
          return;
        }
        setAnswers(sub.answers || {});
        setComment(sub.comment || '');
        setMeta({ total: sub.total_score, max: sub.max_score, pct: sub.rating_percentage, submitted_at: sub.submitted_at });
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || 'Failed to load submission');
      })
      .finally(() => setLoading(false));
  }, [opened, subject]);

  const computeTotal = () => Object.values(answers).reduce((s, v) => s + (Number(v) || 0), 0);
  const computePercentage = () => {
    const total = computeTotal();
    const max = Object.keys(answers).length * 5;
    return max > 0 ? Math.round((total / max) * 100) : 0;
  };

  const badgeColorForScore = (score) => {
    // Use a single consistent color for rating badges to match modal theme.
    // Keep the function signature in case we want to reintroduce score-based colors later.
    return 'teal';
  };

  const ratingLabel = (pct) => {
    if (pct >= 91) return 'Outstanding';
    if (pct >= 76) return 'Very Satisfactory';
    if (pct >= 61) return 'Satisfactory';
    if (pct >= 46) return 'Fair';
    return 'Poor';
  };

  return (
    <Modal opened={opened} onClose={onClose} title={subject ? `View Evaluation` : 'View Evaluation'} size="xl" centered>
      {!subject ? (
        <Stack align="center"><Loader /></Stack>
      ) : (
        <Paper p="md" radius="md" withBorder style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} overlayProps={{ radius: 'md', blur: 2 }} />
          <Stack spacing="md">
            {/* Use a responsive two-column grid for header: title on the left, summary on the right.
                Allow the title to wrap to up to two lines instead of truncating to keep the layout pleasant when
                the modal is resized. */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
              <div style={{ minWidth: 0 }}>
                <Text fw={700} lineClamp={2} style={{ paddingTop: 6, overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${subject.code} — ${subject.title}`}>
                  {subject.code} — {subject.title}
                </Text>
                <Text fz="xs" c="dimmed">Instructor: {subject.instructor?.name || '—'}</Text>
                <Text fz="xs" c="dimmed">Term: {subject.term?.name || '—'}</Text>
              </div>

              <div style={{ minWidth: 120, maxWidth: 160 }}>
                {meta ? (
                  <Paper withBorder radius="sm" p="xs" style={{ textAlign: 'center' }}>
                    <Text fw={700} size="lg">{meta.pct}%</Text>
                    <Text fz="xs" c="dimmed">{ratingLabel(meta.pct)}</Text>
                  </Paper>
                ) : (
                  <Badge>{error ? 'Error' : 'No summary'}</Badge>
                )}
              </div>
            </div>

            {error && <Text c="red">{String(error)}</Text>}

            {/* Header: add horizontal padding to align with section paper inner content (p="md") */}
            <div style={{ paddingLeft: 16, paddingRight: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <Text fw={700} size="sm">Benchmark Statements for Faculty Teaching Effectiveness</Text>
                {/* moved Ratings label into each section header to align with the rating column */}
              </div>
            </div>
            {sections.map((section, sIdx) => (
              <Paper key={sIdx} withBorder radius="md" p="md">
                {/* Put header inside the horizontal scroll container so it scrolls with the table */}
                <Box style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: 640, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8 }}>
                    <Text fw={700} mb="0">{section.title}</Text>
                    <div style={{ width: 120, textAlign: 'center', paddingRight: 8 }}>
                      <Text fw={700} size="sm" c="dimmed" align="center">Ratings</Text>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                    <tbody>
                      {section.items.map((it, iIdx) => {
                        const qId = `s${sIdx}_i${iIdx}`;
                        const val = answers[qId];
                        return (
                          <tr key={qId} style={{ borderTop: '1px solid #f1f3f5' }}>
                            <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}><Text fz="sm">{it}</Text></td>
                            <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', width: 120 }}>
                              <Badge
                                color={badgeColorForScore(val)}
                                variant="light"
                                style={{ minWidth: 44, paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12, fontSize: 15, fontWeight: 600 }}
                              >
                                {val ?? '—'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            ))}

            <Paper withBorder radius="md" p="md">
              <Text fw={700} mb="xs">Comments</Text>
              <Text fz="sm">{comment || '—'}</Text>
            </Paper>

            <Group position="right" spacing="sm" align="center">
              {meta && (
                <>
                  <Badge color={badgeColorForScore(Math.round(meta.pct / 20) || 0)} variant="filled" style={{ fontSize: 13, paddingTop: 6, paddingBottom: 6, paddingLeft: 10, paddingRight: 10, fontWeight: 700 }}>{meta.pct}%</Badge>
                  <Text fz="xs" c="dimmed">{ratingLabel(meta.pct)}</Text>
                </>
              )}
              <Text fz="xs" c="dimmed">Submitted: {meta?.submitted_at ? new Date(meta.submitted_at).toLocaleString() : '—'}</Text>
            </Group>
          </Stack>
        </Paper>
      )}
    </Modal>
  );
};

export default StudentEvaluationViewModal;
