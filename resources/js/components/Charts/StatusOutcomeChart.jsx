import { Card, Title, Text, Group, Stack, Center, Skeleton, Badge, Select, SimpleGrid } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { IconFilter } from '@tabler/icons-react';

const StatusOutcomeChart = ({ data = [], filter, onFilterChange, loading }) => {
  
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card withBorder radius="md" p="md" h="100%">
      <Group justify="space-between" mb="lg">
        <Title order={5}>Outcome Distribution</Title>
        <Select 
            value={filter}
            onChange={(val) => onFilterChange(val)}
            disabled={loading}
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

      {loading ? (
        <Stack align="center" justify="center" h={300}>
          <Skeleton height={180} circle />
          <Skeleton height={40} width="80%" radius="sm" />
        </Stack>
      ) : (
        <>
          {total > 0 ? (
            <Stack align="center" gap="xl">
              <DonutChart 
                data={data} 
                size={200} 
                thickness={25} 
                withTooltip
                withLabelsLine 
                labelsType="percent"
                withLabels
                tooltipDataSource="segment"
                chartLabel={
                    <Stack gap={0} align="center">
                        <Text fw={700} size="xl">{total}</Text>
                        <Text size="xs" c="dimmed">Cases</Text>
                    </Stack>
                }
              />
              
              <SimpleGrid cols={2} spacing="xs" w="100%">
                {data.map((item, index) => (
                  <Group key={index} gap={6} wrap="nowrap" style={{ opacity: item.value > 0 ? 1 : 0.4 }}>
                    <Badge color={item.color} variant="dot" size="sm" />
                    <Text size="xs" truncate title={item.name}>
                      {item.name}: <b>{item.value}</b>
                    </Text>
                  </Group>
                ))}
              </SimpleGrid>
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

export default StatusOutcomeChart;