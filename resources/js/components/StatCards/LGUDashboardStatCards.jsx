import { Group, Paper, SimpleGrid, Text, ThemeIcon, Select, Skeleton } from '@mantine/core';
import { 
  IconArrowUpRight, 
  IconArrowDownRight, 
  IconGavel, 
  IconCheck, 
  IconAlertCircle,
  IconClock,
  IconUsers,
  IconMapPinExclamation
} from '@tabler/icons-react';

const icons = {
  unresolved: IconAlertCircle,
  resolved: IconCheck,
  total: IconGavel,
  time: IconClock,
  individuals: IconUsers,
  risk: IconMapPinExclamation,
};

// --- 1. Reusable StatCard Component ---
function StatCard({ title, value, iconName, diff, color, loading }) {
  const Icon = icons[iconName] || IconAlertCircle;
  const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;
  const diffColor = diff > 0 ? 'teal' : 'red';

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <div>
          <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
            {title}
          </Text>
          
          {loading ? (
            <Skeleton height={28} mt={10} width={80} radius="sm" animate />
          ) : (
            <Text fw={700} fz={30}>
              {value}
            </Text>
          )}
        </div>

        {loading ? (
          <Skeleton height={38} width={38} radius="md" animate />
        ) : (
          <ThemeIcon color={color || "gray"} variant="light" size={38} radius="md">
            <Icon size={28} stroke={1.5} />
          </ThemeIcon>
        )}
      </Group>

      <Text c="dimmed" fz="xs" mt="sm" component="div">
        {loading ? (
          <Skeleton height={14} width="60%" radius="xl" animate />
        ) : (
          <>
            <Text component="span" c={diffColor} fw={700} fz="sm">
              {Math.abs(diff)}%
            </Text>{' '}
            {diff > 0 ? 'increase' : 'decrease'} vs last month
          </>
        )}
      </Text>
    </Paper>
  );
}

// --- 2. Main Component ---
export function LGUDashboardStatCards({ data = {}, loading }) {
  
  // Configure the Standard Stats
  const statsConfig = [
    { 
      id: 'unresolved',
      title: 'Unsettled Conflicts', 
      icon: 'unresolved', 
      value: data.unresolved?.value || 0, 
      diff: data.unresolved?.diff || 0,
      color: 'red'
    },
    { 
      id: 'resolved',
      title: 'Settled Conflicts', 
      icon: 'resolved', 
      value: data.resolved?.value || 0, 
      diff: data.resolved?.diff || 0,
      color: 'teal'
    },
    { 
      id: 'total',
      title: 'Total Conflicts', 
      icon: 'total', 
      value: data.total?.value || 0, 
      diff: data.total?.diff || 0,
      color: 'blue'
    },
    { 
      id: 'avg_time',
      title: 'Avg. Resolution Time', 
      icon: 'time', 
      value: `${data.avgTime?.value || 0} Days`, 
      diff: data.avgTime?.diff || 0,
      color: 'orange' 
    },
    { 
      id: 'individuals',
      title: 'Individuals Involved', 
      icon: 'individuals', 
      value: data.individuals?.value || 0, 
      diff: data.individuals?.diff || 0,
      color: 'grape'
    },
  ];

  // Prepare Risky Areas Data
  const riskyAreasTotal = data.riskyAreas?.total || 0;
  
  const rawBreakdown = data.riskyAreas?.breakdown || [
    { value: 'medium', label: 'Medium Risk: 0' },
    { value: 'high', label: 'High Risk: 0' },
    { value: 'full', label: 'Full Alert: 0' },
  ];

  // FIX 2: Sanitize data to remove extra props (like 'dot') that cause DOM errors
  const sanitizedBreakdown = rawBreakdown.map(item => ({
    value: item.value,
    label: item.label
  }));

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 6 }} spacing="md">
      
      {statsConfig.map((stat) => (
        <StatCard 
          key={stat.id}
          title={stat.title}
          value={stat.value}
          iconName={stat.icon}
          diff={stat.diff}
          color={stat.color}
          loading={loading} 
        />
      ))}

      <Paper withBorder p="md" radius="md" key="risky-areas">
        <Group justify="space-between" mb="xs">
          <div>
            <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
              Risky Areas
            </Text>
            
            {loading ? (
               <Skeleton height={28} mt={10} width={60} radius="sm" animate />
            ) : (
              <Text fw={700} fz={30}>
                {riskyAreasTotal}
              </Text>
            )}
          </div>

          {loading ? (
             <Skeleton height={38} width={38} radius="md" animate />
          ) : (
            <ThemeIcon color="orange" variant="light" size={38} radius="md">
              <IconMapPinExclamation size={28} stroke={1.5} />
            </ThemeIcon>
          )}
        </Group>

        {loading ? (
          <Skeleton height={30} width="100%" radius="md" animate mt={6} />
        ) : (
          <Select
            placeholder="View Risk Breakdown"
            size="xs"
            variant="filled"
            radius="md"
            // Use the sanitized data here
            data={sanitizedBreakdown}
            defaultValue={sanitizedBreakdown[0]?.value}
            styles={{
              input: { fontWeight: 500, color: 'var(--mantine-color-dimmed)' }
            }}
          />
        )}
      </Paper>

    </SimpleGrid>
  );
}

export default LGUDashboardStatCards;