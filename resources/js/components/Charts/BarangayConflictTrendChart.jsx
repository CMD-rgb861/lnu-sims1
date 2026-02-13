import { Card, Title, Box, Skeleton, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';

const BarangayConflictTrendChart = ({ data, loading }) => {
  // Defensive check: Ensure data is always an array
  const chartData = Array.isArray(data) ? data : [];

  return (
    <Box pr="lg" pb="lg" w="100%">
        {loading ? (
            <Skeleton height="100%" width="100%" radius="md" animate />
        ) : (
            chartData.length > 0 ? (
                <LineChart
                h={350}
                data={chartData}
                dataKey="name" 
                strokeWidth={3}
                series={[
                    { name: 'resolved', color: 'teal.6', label: 'Resolved' },
                    { name: 'unresolved', color: 'red.6', label: 'Unresolved' }
                ]}
                curveType="monotone"
                withLegend 
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
  );
};

export default BarangayConflictTrendChart;