import { Card, Group, Title, Text, Select, Box, Skeleton, Stack, Flex, Paper, ColorSwatch } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { IconFilter } from '@tabler/icons-react';

// 1. Define the Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  // payload[0].payload contains your specific backend data (name, value, color)
  const data = payload[0].payload; 

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      {/* Show Barangay Name */}
      <Text fw={600} size="sm" mb={4}>{data.name}</Text>
      
      <Group gap="xs">
        {/* Show Specific Color Dot */}
        <ColorSwatch color={data.color} size={12} />
        
        {/* Show Value */}
        <Text size="sm" c="dimmed">
          Unsettled Cases: <Text span fw={500} c="bright">{data.value}</Text>
        </Text>
      </Group>
    </Paper>
  );
};

const HighRiskBarangaysChart = ({ data, filter, onFilterChange, loading }) => {

  const chartData = Array.isArray(data) ? data : [];

  return (
    <Card withBorder radius="md" h={470}>
      <Group justify="space-between" mb="md">
        <Title order={5}>Top High-Risk Barangays</Title>
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

      <Box h={380} w="100%">
        {loading ? (
          <Stack justify="center" h="100%" gap="xl" px="sm">
            {[...Array(7)].map((_, i) => (
              <Flex key={i} align="center" gap="md" w="100%">
                <Skeleton height={12} width={80} radius="xl" />
                <Skeleton height={20} width={`${90 - (i * 12)}%`} radius="sm" animate />
              </Flex>
            ))}
          </Stack>
        ) : (
          chartData.length > 0 ? (
            <BarChart
              h={380}
              data={chartData}
              dataKey="name"
              orientation="vertical"
              barProps={{ radius: 30, barSize: 25,}}
              yAxisProps={{ width: 90, tick: { fontSize: 12, fontWeight: 600 } }} 
              xAxisProps={{ hide: false }}
              series={[
                { name: 'value', color: 'blue.6' }
              ]}
              getBarColor={(value, entry) => entry.color} 
              tooltipProps={{
                content: CustomTooltip,
                cursor: false,
                shared: false
              }}
            />
          ) : (
            <Box h="100%" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <IconFilter size={40} color="gray" style={{ marginBottom: 10 }} />
              <Text c="dimmed" fz="sm">No high-risk data found</Text>
            </Box>
          )
        )}
      </Box>
    </Card>
  );
};

export default HighRiskBarangaysChart;