import { useEffect, useState } from 'react';
import {
  Title,
  Breadcrumbs,
  Anchor,
  Grid,
  Paper,
  Skeleton,
  Text,
  Divider,
  Group,
  SegmentedControl,
  SimpleGrid,
  Card,
  Stack,
  ActionIcon,
  Badge,
  Button,
  Center,
  Box,
  Flex,
  Menu,
  Switch,
  NumberInput,
  Select
} from '@mantine/core';
import { 
  IconLayoutGrid, 
  IconList, 
  IconFileDownload, 
  IconFileDescription,
  IconArrowDown,
  IconChevronDown,
  IconFileOff
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';

import axiosClient from '../../api/axiosClient';

const ReportsPage = () => {

  const userRoleObject = useSelector((state) => state.auth.user?.roles?.[0]);
  const authStatus = useSelector((state) => state.auth.status);

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [reports, setReports] = useState([]);

  const [checkedNames, setCheckedNames] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedTimeframe, setSelectedTimeframe] = useState('');

  const monthOptions = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  const quarterOptions = [
    { value: '1', label: '1st Quarter' },
    { value: '2', label: '2nd Quarter' },
    { value: '3', label: '3rd Quarter' },
    { value: '4', label: '4th Quarter' },
  ];

  const envId = localStorage.getItem('current_env_id');
  const barId = localStorage.getItem('current_bar_id');

  const handleToggleNames = (id, checked) => {
    setCheckedNames((prev) => ({ ...prev, [id]: checked }));
  };

  const items = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Reports', href: '#' },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} fz={14} fw={400}>
      {item.title}
    </Anchor>
  ));

  useEffect(() => {
    const fetchReports = async () => {
      if (authStatus === 'loading') return;
      setLoading(true);
      try {
        const currentRoleId = Number(userRoleObject?.pivot?.ur_id);
        const allReports = [
          { 
            id: 1, 
            title: 'Barangay KP Compliance Report', 
            type: 'PDF',
            subtitle: 'Quarterly reporting of Barangay KP Cases',
            quarterly: true,
            monthly: false,
            includeNames: true,
            allowedRoleIds: [5]
          },
          { 
            id: 2, 
            title: 'LGU KP Compliance Report', 
            type: 'PDF',
            subtitle: 'Quarterly reporting of Barangay KP Cases in LGU level',
            quarterly: true,
            monthly: false,
            includeNames: false,
            allowedRoleIds: [3]
          },
          { 
            id: 3, 
            title: 'PNP Monthly KP Cases Report', 
            type: 'XLSX',
            subtitle: 'Monthly report of Barangay KP Cases in LGU using PNP template',
            quarterly: true,
            monthly: true,
            includeNames: false,
            allowedRoleIds: [4]
          },
        ];

        const filtered = allReports.filter(report => 
          report.allowedRoleIds.includes(currentRoleId)
        );

        // Simulated API delay
        setTimeout(() => {
          setReports(filtered);
          setLoading(false);
        }, 1000);

      } catch (error) {
        setLoading(false);
      }
    };

    fetchReports();
  }, [authStatus, userRoleObject]);

  const handleDownload = async (reportId, quarter = null, month = null) => {
    const namesToggle = !!checkedNames[reportId];
    const report = reports.find(r => r.id === reportId);
    try {
      const response = await axiosClient.get(`api/reports/generate/${reportId}`, {
        params: { 
          quarter: quarter, 
          month: month, 
          year: selectedYear,
          includeNames: namesToggle,
          barId: barId,
          envId: envId
        },
        responseType: 'blob', 
      });
      const isPdf = report?.type === 'PDF';
      const mimeType = isPdf 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      if (isPdf) {
        // PDF: Open in new tab (existing behavior)
        window.open(url, '_blank');
      } else {
        // XLSX: Force download via hidden link
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${report.title}_${selectedYear}.xlsx`); 
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  return (
    <>
      <Grid>
        <Grid.Col span={12}>
          <Breadcrumbs mb="md" fw={400} separator=">">{items}</Breadcrumbs>
          <Divider mb="lg" />
          
          <Group justify="space-between" align="flex-end" mb="xl">
            <Box>
              <Title align="left" order={2} mb={4} fw={600} fz={22}>
                Reports
              </Title>
              <Text fz="sm" fw={500} c="dimmed">
                Manage and generate reports for documentation and institutional compliance.
              </Text>
            </Box>

            {!loading && (
              <SegmentedControl
                value={view}
                onChange={setView}
                data={[
                  {
                    value: 'grid',
                    label: (
                      <Center style={{ gap: 10 }}>
                        <IconLayoutGrid size={16} />
                        <span>Grid</span>
                      </Center>
                    ),
                  },
                  {
                    value: 'list',
                    label: (
                      <Center style={{ gap: 10 }}>
                        <IconList size={16} />
                        <span>List</span>
                      </Center>
                    ),
                  },
                ]}
              />
            )}
          </Group>

          {loading ? (
            /* SKELETON LOADER GRID */
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {Array.from({ length: reports.length > 0 ? reports.length : 6 }).map((_, i) => (
              <Paper key={i} withBorder p="lg" radius="md">
                <Stack justify="space-between" h={220}>
                  <Group justify="space-between">
                    <Skeleton height={42} width={42} radius="md" />
                    <Skeleton height={20} width={60} radius="xl" />
                  </Group>
                  <Stack gap={8}>
                    <Skeleton height={20} width="80%" radius="sm" />
                    <Skeleton height={12} width="40%" radius="sm" />
                  </Stack>
                  <Skeleton height={36} width="100%" radius="md" />
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
          ) : reports.length === 0 ? (
            <Flex align="center" justify="center" direction="column" gap="sm" h="50vh">
              <IconFileOff size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Text fw={600} fz="lg" mt="md">No reports available</Text>
              <Text c="dimmed" fz="sm" ta="center" style={{ maxWidth: 400 }}>
                Your account level does not have access to any generated reports at this time.
              </Text>
            </Flex>
          ) : (
            /* ACTUAL CONTENT */
            view === 'grid' ? (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {reports.map((report) => (
                  <Card key={report.id} withBorder padding="lg" radius="md">
                    <Stack justify="space-between">
                      <Group justify="space-between" align="flex-start">
                        <ActionIcon variant="light" size="xl" color="blue" radius="md">
                          <IconFileDescription size={26} />
                        </ActionIcon>
                        <Badge variant="dot" color={report.type === 'PDF' ? 'red' : 'green'}>
                          {report.type}
                        </Badge>
                      </Group>
                      <div>
                        <Text fw={600} fz="lg" mb={2} truncate>{report.title}</Text>
                        <Text fz="xs" c="dimmed">{report.subtitle}</Text>
                      </div>
                      {report.includeNames && (
                        <Switch
                          size="xs"
                          label="Include subject names"
                          checked={checkedNames[report.id] || false}
                          onChange={(event) => handleToggleNames(report.id, event.currentTarget.checked)}
                        />
                      )}
                      <Stack gap="xs" mt="md">
                        <Group grow preventGrowOverflow={false} wrap="nowrap">
                          <NumberInput
                            label="Year"
                            value={selectedYear}
                            onChange={(val) => setSelectedYear(val)}
                            min={2020}
                            max={2030}
                            size="xs"
                          />
                          
                          {(report.monthly || report.quarterly) && (
                            <Select
                              label={report.monthly ? "Month" : "Quarter"}
                              placeholder="Select..."
                              size="xs"
                              data={report.monthly ? monthOptions : quarterOptions}
                              value={selectedTimeframe}
                              onChange={setSelectedTimeframe}
                            />
                          )}
                        </Group>

                        <Button 
                          mt="xl"
                          fullWidth 
                          leftSection={<IconFileDownload size={16} />}
                          disabled={(report.monthly || report.quarterly) && !selectedTimeframe}
                          onClick={() => {
                            if (report.monthly) {
                              handleDownload(report.id, null, selectedTimeframe);
                            } else {
                              handleDownload(report.id, selectedTimeframe, null);
                            }
                          }}
                        >
                          Generate Report
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            ) : reports.length === 0 ? (
              <Flex align="center" justify="center" direction="column" gap="sm" h="50vh">
                <IconFileOff size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />
                <Text fw={600} fz="lg" mt="md">No reports available</Text>
                <Text c="dimmed" fz="sm" ta="center" style={{ maxWidth: 400 }}>
                  Your account level does not have access to any generated reports at this time.
                </Text>
              </Flex>
            ) : (
              <Paper withBorder radius="md">
                <Stack gap={0}>
                  {reports.map((report, index) => (
                    <Box key={report.id}>
                      <Group justify="space-between" p="md">
                        <Group>
                          <IconFileDescription size={20} color="gray" />
                          <Stack gap={2}>
                            <Text fw={600} fz="md" m={0}>{report.title}</Text>
                            <Text fw={400} fz="xs" m={0} c="dimmed">{report.subtitle}</Text>
                          </Stack>
                        </Group>
                        {report.includeNames && (
                        <Switch
                          size="xs"
                          label="Include subject names"
                          checked={checkedNames[report.id] || false}
                          onChange={(event) => handleToggleNames(report.id, event.currentTarget.checked)}
                        />
                      )}
                      <Group grow preventGrowOverflow={false} wrap="nowrap">
                        <NumberInput
                          label="Year"
                          value={selectedYear}
                          onChange={(val) => setSelectedYear(val)}
                          min={2020}
                          max={2030}
                          size="xs"
                        />
                        
                        {(report.monthly || report.quarterly) && (
                          <Select
                            label={report.monthly ? "Month" : "Quarter"}
                            placeholder="Select..."
                            size="xs"
                            data={report.monthly ? monthOptions : quarterOptions}
                            value={selectedTimeframe}
                            onChange={setSelectedTimeframe}
                          />
                        )}
                      </Group>
                      <Badge variant="dot" color={report.type === 'PDF' ? 'red' : 'green'}>
                        {report.type}
                      </Badge>
                      <Button 
                        variant='subtle'
                        leftSection={<IconFileDownload size={16} />}
                        disabled={(report.monthly || report.quarterly) && !selectedTimeframe}
                        onClick={() => {
                          if (report.monthly) {
                            handleDownload(report.id, null, selectedTimeframe);
                          } else {
                            handleDownload(report.id, selectedTimeframe, null);
                          }
                        }}
                      >
                        Generate Report
                      </Button>
                      </Group>
                      {index !== reports.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )
          )}
        </Grid.Col>
      </Grid>
    </>
  );
};

export default ReportsPage;