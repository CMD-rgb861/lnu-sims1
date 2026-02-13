import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconCalendarFilled, IconCalendarWeekFilled, IconCalendarMonthFilled, IconCalendarCheck } from '@tabler/icons-react';

const icons = {
  today: IconCalendarFilled,
  thisWeek: IconCalendarWeekFilled,
  thisMonth: IconCalendarMonthFilled,
  total: IconCalendarCheck,
};

export function UserLogsStatCards({ data }) {
  // Map the API data to the UI structure
  const statsConfig = [
    { 
      title: 'Today', 
      icon: 'today', 
      value: data.today || 0, 
    },
    { 
      title: 'This Week', 
      icon: 'thisWeek', 
      value: data.week || 0, 
    },
    { 
      title: 'This Month', 
      icon: 'thisMonth', 
      value: data.month || 0, 
    },
    { 
      title: 'Total', 
      icon: 'total', 
      value: data.total || 0, 
    },
  ];

  const stats = statsConfig.map((stat) => {
    const Icon = icons[stat.icon];

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group justify="space-between">
          <div>
            <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
              {stat.title}
            </Text>
            <Text fw={700} fz={30}>
              {stat.value}
              <Text fz="sm" c="dimmed">Activities recorded</Text>
            </Text>
          </div>
          <Icon color="gray"></Icon>
        </Group>
      </Paper>
    );
  });

  return (
    <SimpleGrid cols={{ base: 1, sm: 4 }}>
        {stats}
    </SimpleGrid>
  );
}

export default UserLogsStatCards;