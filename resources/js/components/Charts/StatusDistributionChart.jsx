import { Card, Title, Text, Group, Stack, Center, Skeleton, Badge, Select } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { IconFilter } from '@tabler/icons-react';

const BlotterStatusChart = ({ settled = 0, unsettled = 0, filter, onFilterChange, loading }) => {
  
  const total = settled + unsettled;

  // Format data for Mantine DonutChart
  const chartData = [
    { name: 'Settled', value: settled, color: 'teal.6' },
    { name: 'Unsettled', value: unsettled, color: 'orange.6' },
  ];

  return (
    <Card withBorder radius="md" p="md" h="100%">
      
      {/* HEADER WITH FILTER */}
      <Group justify="space-between" mb="lg">
        <Title order={5}>Status Distribution</Title>
        <Select 
            placeholder="Date" 
            value={filter}
            onChange={(value) => onFilterChange(value)}
            disabled={loading}
            allowDeselect={false}
            leftSection={<IconFilter size={14} />}
            data={[
              { value: 'today', label: 'Today' },
              { value: 'this_week', label: 'This Week' },
              { value: 'this_month', label: 'This Month' },
              { value: 'this_year', label: 'This Year' },
              { value: 'last_month', label: 'Last Month' },
              { value: 'last_year', label: 'Last Year' },
            ]}
            w={130}
            size="xs"
        />
      </Group>

      {/* CHART CONTENT */}
      {loading ? (
        <Stack align="center" justify="center" h={300}>
          <Skeleton height={180} circle />
          <Skeleton height={40} width="80%" radius="sm" />
        </Stack>
      ) : (
        <>
          {total > 0 ? (
            <Stack align="center" gap="xs" mb="lg">
              <DonutChart 
                data={chartData} 
                size={200} 
                thickness={30} 
                withTooltip
                withLabelsLine 
                labelsType="percent"
                withLabels
                tooltipDataSource="segment"
                chartLabel={
                    <Text fw={700} ta="center" size="xl" style={{ lineHeight: 0.5 }}>
                        {total}
                        <Text size="xs" c="dimmed" fw={500} mt={2}>Total</Text>
                    </Text>
                }
              />
              
              <Group justify="center" gap="lg" mt="sm">
                <Group gap={6}>
                  <Badge color="teal.6" variant="dot" size="lg" />
                  <Text size="sm" c="dimmed">Settled</Text>
                  <Text size="sm" fw={600}>{settled}</Text>
                </Group>
                
                <Group gap={6}>
                  <Badge color="orange.6" variant="dot" size="lg" />
                  <Text size="sm" c="dimmed">Unsettled</Text>
                  <Text size="sm" fw={600}>{unsettled}</Text>
                </Group>
              </Group>
            </Stack>
          ) : (
            <Center h={300}>
                <Stack align="center" gap="xs">
                    <IconFilter size={30} color="gray" style={{ opacity: 0.5 }} />
                    <Text c="dimmed" size="sm">No records found</Text>
                </Stack>
            </Center>
          )}
        </>
      )}
    </Card>
  );
};

export default BlotterStatusChart;