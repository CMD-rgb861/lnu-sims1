import { Card, Title, Box, Skeleton, Text } from '@mantine/core';
import { AreaChart, LineChart } from '@mantine/charts';

const ConflictTrendChart = ({ data, loading }) => {
  // Defensive check: Ensure data is always an array
  const chartData = Array.isArray(data) ? data : [];

  return (
    <Card withBorder radius="md" h="100%">
      <Title order={5} mb="lg">Conflict Trends (Past 6 Months)</Title>
      <Box h={320} pr="lg" w="100%">
        {loading ? (
           <Skeleton height="100%" width="100%" radius="md" animate />
        ) : (
           chartData.length > 0 ? (
             <LineChart
                h={300}
                data={chartData}
                dataKey="name" 
                type="gradient"
                gradientStops={[
                    { offset: 0, color: 'red.6' },
                    { offset: 20, color: 'orange.6' },
                    { offset: 40, color: 'yellow.5' },
                    { offset: 70, color: 'lime.5' },
                    { offset: 80, color: 'cyan.5' },
                    { offset: 100, color: 'blue.5' },
                ]}
                strokeWidth={5}
                series={[
                  { name: 'incidents', color: 'blue.6', label: 'Incidents' }
                ]}
                curveType="monotone"
                withGradient
                tickLine="none"
                gridAxis="xy"
                withXAxis={true}
                withYAxis={true}
                tooltipAnimationDuration={200}
             />
           ) : (
             <Box h="100%" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text c="dimmed" size="sm">No trend data available</Text>
             </Box>
           )
        )}
      </Box>
    </Card>
  );
};

export default ConflictTrendChart;