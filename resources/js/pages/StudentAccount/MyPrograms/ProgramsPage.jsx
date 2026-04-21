import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// UI components
import {
  Grid,
  Breadcrumbs,
  Divider,
  Title,
  Text,
  Card,
  Group,
  Badge,
  Button,
  SimpleGrid,
  Table,
  ScrollArea,
  Paper,
  Skeleton,
  Select,
  TextInput,
  Box,
  Stack,
  useMantineColorScheme,
} from '@mantine/core';

import axiosClient from '../../../api/axiosClient';
import { useAuth } from '../../../hooks/useAuth';

const ProgramsPage = () => {
  const items = [
    <Link to="/" key="home">Home</Link>,
    <Link to="/student" key="student">Student</Link>,
    <Text key="current">My Programs</Text>,
  ];

  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groupedCoursesMap, setGroupedCoursesMap] = useState({});
  const [studentPrograms, setStudentPrograms] = useState([]);
  const [selectedStudentProgramId, setSelectedStudentProgramId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [search, setSearch] = useState('');

  const { user } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    if (!user || !user.id) {
      setError(new Error('User not available'));
      setLoading(false);
      return () => { mounted = false; };
    }

    // Fetch student programs and grouped courses in one request (backend does grouping)
    axiosClient.get(`/api/mp/fetch/student-programs-with-courses/${user.id}`)
      .then((res) => {
        if (!mounted) return;
        const payload = res?.data || {};
        const programsList = Array.isArray(payload.student_programs) ? payload.student_programs : (Array.isArray(payload.data) ? payload.data : []);
        setStudentPrograms(programsList);
        setGroupedCoursesMap(payload.courses_by_student_program || {});
        const first = programsList[0];
        if (first) {
          setSelectedStudentProgramId(first.id);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch student programs with courses', err);
        if (mounted) setError(err);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [user]);

  // When a specific student_program is selected, load its courses from the grouped map
  useEffect(() => {
    if (!selectedStudentProgramId) return;
    setLoading(true);
    try {
      const entry = groupedCoursesMap[selectedStudentProgramId];
      // entry may contain { student_program, grouped }
      const grouped = entry?.grouped || entry || {};
      // flatten grouped into courses array for searching/filtering
      const flattened = [];
      Object.keys(grouped).forEach((yl) => {
        const sems = grouped[yl] || {};
        Object.keys(sems).forEach((sem) => {
          const rows = sems[sem] || [];
          rows.forEach(r => {
            // attach year_level/semester for use in rendering
            const item = { ...r, year_level: yl, semester: Number(sem) };
            flattened.push(item);
          });
        });
      });
      setCourses(flattened);
    } catch (e) {
      console.warn('Error loading grouped courses for selected program', e);
      setCourses([]);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentProgramId, groupedCoursesMap]);

  // Keep legacy filters (not used for courses) but keep search for course title/code
  const filtered = programs.filter((p) => {
    if (selectedCollege && selectedCollege !== (p.college_name || (p.department && p.department.college && p.department.college.college_name))) return false;
    if (search) {
      const q = search.toLowerCase();
      return (p.program_name || '').toLowerCase().includes(q) || (p.program_code || '').toLowerCase().includes(q);
    }
    return true;
  });

  const filteredCourses = courses.filter((cc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const courseObj = cc.course || {};
    const name = (courseObj.course_name || cc.course_name || '').toLowerCase();
    const code = (courseObj.course_code || cc.course_code || '').toLowerCase();
    return name.includes(q) || code.includes(q);
  });

  // Group courses by year_level then semester
  const grouped = filteredCourses.reduce((acc, cur) => {
    const yl = cur.year_level ?? 'Unknown';
    const sem = cur.semester ?? 0;
    acc[yl] = acc[yl] || {};
    acc[yl][sem] = acc[yl][sem] || [];
    acc[yl][sem].push(cur);
    return acc;
  }, {});

  const selectedStudentProgram = studentPrograms.find(sp => sp.id === selectedStudentProgramId) || null;

  return (
    <Grid>
      <Grid.Col span={12}>
        <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
        <Divider mb="lg" />

        <Title align="left" order={2} mb={4} fw={600} fz={20}>My Programs</Title>
        <Text fz="sm" c="dimmed" mb="lg">Browse the programs associated with your account. Use filters to narrow the list.</Text>

        {loading ? (
          <Paper withBorder radius="lg" p="xl" mb="lg">
            <Skeleton height={30} width="40%" mb="md" radius="md" />
            <Skeleton height={16} width="60%" mb="sm" radius="md" />
            <Divider my="md" />

            <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}> 
              {Array.from({ length: 6 }).map((_, idx) => (
                <Paper key={idx} withBorder radius="md" p="md">
                  <Skeleton height={18} width="60%" mb="8px" />
                  <Skeleton height={12} width="40%" mb="8px" />
                  <Skeleton height={12} width="80%" mt="sm" />
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>
        ) : (
          <>
            {error && <Text c="red" fz="sm" mb="md">Error loading programs: {String(error?.message || error)}</Text>}

            <Group mb="md" align="center">
              <Select
                placeholder="Select program"
                data={studentPrograms.map(sp => ({ value: String(sp.id), label: (sp.program?.program_name || sp.program_name || 'Program') + (sp.curriculum ? ` — ${sp.curriculum.curriculum_name}` : '') }))}
                value={selectedStudentProgramId ? String(selectedStudentProgramId) : null}
                onChange={(v) => setSelectedStudentProgramId(v ? Number(v) : null)}
                sx={{ minWidth: 360 }}
                searchable
                clearable
              />

              <TextInput
                placeholder="Search by course name or code"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                sx={{ flex: 1, minWidth: 240 }}
              />
            </Group>

            {(!filteredCourses || filteredCourses.length === 0) ? (
              <Paper withBorder radius="md" p="md" mb="md">
                <Text fw={600}>No courses found for your program</Text>
                <Text fz="sm" c="dimmed">If you believe this is incorrect, make sure your program is set in your profile.</Text>
              </Paper>
            ) : (
              Object.keys(grouped).sort().map((year) => (
                <div key={`year-${year}`}>
                  <Title order={4} mb={8} mt={12}>Year {year}</Title>
                  <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'lg', cols: 1 }]}>
                    {Object.keys(grouped[year]).sort((a,b)=>a-b).map((sem) => {
                      const rows = grouped[year][sem];
                    // compute sem GWA if final ratings are available
                    const ratings = rows.map(r => {
                      const v = r.final_rating ?? r.finalRating ?? r.grade ?? r.final;
                      return typeof v === 'string' ? Number(v) : v;
                    }).filter(n => n !== undefined && n !== null && !Number.isNaN(n));
                    const semGwa = ratings.length ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(2) : null;
                    const semName = (sem === 2) ? 'Second Semester' : (sem === 1) ? 'First Semester' : `Semester ${sem}`;
                    // try to get school year
                    const sy = (selectedStudentProgram && (selectedStudentProgram.school_year || (selectedStudentProgram.curriculum && selectedStudentProgram.curriculum.school_year))) || rows[0]?.school_year || '';
                    const programTitle = selectedStudentProgram ? (selectedStudentProgram.program?.program_name || selectedStudentProgram.program_name || '') : '';

                      return (
                      <div key={`sem-${year}-${sem}`}>
                        <Paper withBorder radius="lg" overflow="hidden" mb="md" h="100%">
                          {/* Term Header (match GradesPage) */}
                          <Group justify="space-between" p="md" bg={isDark ? 'dark.7' : 'gray.0'} style={{ borderBottom: `1px solid ${isDark ? '#373A40' : '#E9ECEF'}` }}>
                            <Stack gap={0}>
                              <Text fw={700} fz="lg">{`${semName}${sy ? ` S.Y. ${sy}` : ''}`}</Text>
                              {programTitle && <Text fz="xs" fw={500} c="dimmed">{programTitle}</Text>}
                            </Stack>
                            <Badge size="lg" radius="md" variant="light" color="blue">
                              Sem GWA: {semGwa || 'N/A'}
                            </Badge>
                          </Group>

                          {/* Term Table (match GradesPage) */}
                          <Box style={{ overflowX: 'auto' }}>
                            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md" radius="xl">
                              <Table.Thead bg={isDark ? 'dark.6' : 'gray.0'}>
                                <Table.Tr>
                                  <Table.Th><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Course Code</Text></Table.Th>
                                  <Table.Th><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Descriptive Title</Text></Table.Th>
                                  <Table.Th ta="center"><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Units</Text></Table.Th>
                                  <Table.Th ta="center"><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Final Rating</Text></Table.Th>
                                  <Table.Th ta="center"><Text fz="xs" fw={600} tt="uppercase" c="dimmed">Status</Text></Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {rows.map((cc) => {
                                  const courseObj = cc.course || { course_code: cc.course_code, course_name: cc.course_name, units: cc.units };
                                  const keyId = courseObj.id || cc.course_id || cc.id;
                                  const final = cc.final_grade ?? cc.finalGrade ?? cc.final_rating ?? cc.finalRating ?? cc.grade ?? cc.final;
                                  const statusCourse = cc.status_course || cc.statusCourse || null;
                                  const statusColor = statusCourse === 'Passed'
                                    ? 'green'
                                    : statusCourse === 'Fail'
                                      ? 'red'
                                      : statusCourse === 'INC'
                                        ? 'yellow'
                                        : statusCourse === 'Ongoing'
                                          ? 'blue'
                                          : 'gray';
                                  return (
                                    <Table.Tr key={`cc-${keyId}`}>
                                      <Table.Td fw={700} fz="sm">{(courseObj.course_code || '—').toUpperCase()}</Table.Td>
                                      <Table.Td>
                                        <Text fz="sm" truncate="end" style={{ maxWidth: '200px' }} title={courseObj.course_name || 'Untitled'}>
                                          {courseObj.course_name || 'Untitled'}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td ta="center" fz="sm">{courseObj.units ?? '—'}</Table.Td>
                                      <Table.Td ta="center">
                                        {final !== undefined && final !== null ? (
                                          <Badge color={Number(final) > 3.0 ? 'red' : 'green'} variant="light" size="md">
                                            {String(final)}
                                          </Badge>
                                        ) : '—'}
                                      </Table.Td>
                                      <Table.Td ta="center">
                                        {statusCourse ? (
                                          <Badge color={statusColor} variant="light" size="md">
                                            {statusCourse}
                                          </Badge>
                                        ) : '—'}
                                      </Table.Td>
                                    </Table.Tr>
                                  );
                                })}
                              </Table.Tbody>
                            </Table>
                          </Box>
                        </Paper>
                      </div>
                    );
                  })}
                  </SimpleGrid>
                </div>
              ))
            )}
          </>
        )}
      </Grid.Col>
    </Grid>
  );
};

export default ProgramsPage;