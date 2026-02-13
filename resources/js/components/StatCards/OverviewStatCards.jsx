import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight, IconGavel, IconCheck, IconAlertCircle } from '@tabler/icons-react';

const icons = {
  unresolved: IconAlertCircle,
  resolved: IconCheck,
  total: IconGavel,
};

export function OverviewStatCards({ data }) {
  // Map the API data to the UI structure
  const statsConfig = [
    { 
      title: 'Unresolved Conflicts', 
      icon: 'unresolved', 
      value: data.unresolved?.value || 0, 
      diff: data.unresolved?.diff || 0 
    },
    { 
      title: 'Resolved Conflicts', 
      icon: 'resolved', 
      value: data.resolved?.value || 0, 
      diff: data.resolved?.diff || 0 
    },
    { 
      title: 'Total Conflicts', 
      icon: 'total', 
      value: data.total?.value || 0, 
      diff: data.total?.diff || 0 
    },
  ];

  const stats = statsConfig.map((stat) => {
    const Icon = icons[stat.icon];
    const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group justify="space-between">
          <div>
            <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
              {stat.title}
            </Text>
            <Text fw={700} fz={30}>
              {stat.value}
            </Text>
          </div>
          <ThemeIcon
            color="gray"
            variant="light"
            style={{
              color: stat.diff > 0 ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-red-6)',
            }}
            size={38}
            radius="md"
          >
            <DiffIcon size={28} stroke={1.5} />
          </ThemeIcon>
        </Group>

        <Text c="dimmed" fz="sm" mt="xs">
          <Text component="span" c={stat.diff > 0 ? 'teal' : 'red'} fw={700}>
            {stat.diff}%
          </Text>{' '}
          {stat.diff > 0 ? 'increase' : 'decrease'} compared to last month
        </Text>
      </Paper>
    );
  });

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }}>
        {stats}
    </SimpleGrid>
  );
}

export default OverviewStatCards;