import { BarChart } from '@mantine/charts';
import { Card, Title, Box, Text, Skeleton } from '@mantine/core';

const KPStageDistributionChart = ({ data, loading }) => {
  return (
    <Box  pr="lg" pb="lg" h="100%">
        {loading ? (
            <Skeleton height="100%" radius="md" />
        ) : data.length > 0 ? (
            <BarChart
            h={350}
            data={data}
            dataKey="stage"
            type="stacked"
            withLegend
            series={[
                { name: 'resolved', color: 'teal.6', label: 'Resolved' },
                { name: 'unresolved', color: 'red.6', label: 'Unresolved' },
            ]}
            gridAxis="y"
            tickLine="none"
            tooltipAnimationDuration={200}
            />
        ) : (
            <Box h="100%" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text c="dimmed">No case data found</Text>
            </Box>
        )}
    </Box>
  );
};

export default KPStageDistributionChart;