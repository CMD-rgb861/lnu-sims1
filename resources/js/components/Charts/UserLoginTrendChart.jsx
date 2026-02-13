import { Box, Skeleton, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';

const UserLoginTrendChart = ({ loginTrends, loginTrendsLoading }) => {

  const chartData = Array.isArray(loginTrends) ? loginTrends : [];

  return (
    <Box pr="lg" pb="lg" w="100%">
        {loginTrendsLoading ? (
            <Skeleton height={350} width="100%" radius="md" animate />
        ) : (
            chartData.length > 0 ? (
                <LineChart
                h={350}
                data={chartData}
                dataKey="name" // The X-axis key (e.g., "Mon", "Tue" or "Jan 1")
                strokeWidth={3}
                series={[
                    // Single series for Login Counts
                    { name: 'login_count', color: 'indigo.6', label: 'User Logins' }
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
                <Text c="dimmed" size="sm">No login activity recorded</Text>
                </Box>
            )
        )}
    </Box>
  );
};

export default UserLoginTrendChart;