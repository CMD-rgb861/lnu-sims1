import { Group, Paper, Text, ThemeIcon, Stack, Box } from '@mantine/core';
import { 
  IconArrowUpRight, 
  IconArrowDownRight, 
  IconGavel, 
  IconCheck, 
  IconAlertCircle,
  IconClock 
} from '@tabler/icons-react';

const icons = {
  unresolved: IconAlertCircle,
  resolved: IconCheck,
  total: IconGavel,
  avg_time: IconClock,
};

// 1. Color Logic (Preserved from your request)
const getStatusGradient = (status) => {
  const s = (status || '').toLowerCase();
  
  if (s.includes('full') || s.includes('critical')) {
    return 'linear-gradient(-60deg, var(--mantine-color-red-4) 0%, var(--mantine-color-red-7) 100%)';
  }
  if (s.includes('high')) {
    return 'linear-gradient(-60deg, var(--mantine-color-orange-4) 0%, var(--mantine-color-orange-7) 100%)';
  }
  if (s.includes('medium')) {
    return 'linear-gradient(-60deg, var(--mantine-color-yellow-4) 0%, var(--mantine-color-yellow-7) 100%)';
  }
  if (s.includes('low')) {
    return 'linear-gradient(-60deg, var(--mantine-color-blue-4) 0%, var(--mantine-color-blue-7) 100%)';
  }
  // Default (Green/Safe)
  return 'linear-gradient(-60deg, var(--mantine-color-green-4) 0%, var(--mantine-color-green-7) 100%)';
};

// 2. Helper for Description Text
const getDescription = (type, diff) => {
  if (diff === 0) {
    return type === 'avg_time' ? 'Consistent with last month' : 'No change vs last month';
  }
  
  const absDiff = Math.abs(diff);
  
  if (type === 'avg_time') {
    return diff > 0 
      ? <><Text span fw={700} c="red">{absDiff}% slower</Text> vs last month</>
      : <><Text span fw={700} c="teal">{absDiff}% faster</Text> vs last month</>;
  }

  const color = diff > 0 ? 'teal' : 'red';
  const word = diff > 0 ? 'increase' : 'decrease';
  
  return <><Text span fw={700} c={color}>{absDiff}% {word}</Text> vs last month</>;
};

export function OverviewBarangayStatCards({ data, details }) {

  // --- OVERVIEW CARD ---
  const OverviewCard = (
    <Paper 
      radius="md" 
      p="md" 
      style={{ 
        backgroundImage: getStatusGradient(details?.conflict_status),
        color: 'white',
        height: '100%',
        minHeight: '130px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center'
      }}
    >
        <div>
            <Text tt="uppercase" fw={700} fz="xs" c="white" opacity={0.9}>
              Barangay Overview
            </Text>
            <Text fw={700} fz={26} lh={1.2} mt={4} style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}>
              {details?.name || 'Loading...'}
            </Text>
            <Group mt="sm" align="center" gap="xs">
                 <Text fz="sm" fw={500} opacity={0.95}>
                    Pop: <b>{new Intl.NumberFormat().format(details?.population || 0)}</b>
                 </Text>
                 <Text fz="sm" fw={500} opacity={0.95}>•</Text>
                 <Text fz="sm" fw={500} opacity={0.95}>
                    Risk Level: <b>{details?.conflict_status || 'Safe'}</b>
                 </Text>
            </Group>
        </div>
    </Paper>
  );

  const statsConfig = [
    { 
      id: 'avg_time',
      title: 'Avg. Resolution Time', 
      icon: 'avg_time', 
      value: data.avg_time?.value || '0 Day/s', 
      diff: data.avg_time?.diff || 0 
    },
    { 
      id: 'unresolved',
      title: 'Unresolved', 
      icon: 'unresolved', 
      value: data.unresolved?.value || 0, 
      diff: data.unresolved?.diff || 0 
    },
    { 
      id: 'resolved',
      title: 'Resolved', 
      icon: 'resolved', 
      value: data.resolved?.value || 0, 
      diff: data.resolved?.diff || 0 
    },
    { 
      id: 'total',
      title: 'Total Cases', 
      icon: 'total', 
      value: data.total?.value || 0, 
      diff: data.total?.diff || 0 
    },
  ];

  return (
    <Box 
      mb="lg"
      style={{
        display: 'flex',
        alignContent: 'space-between',
        gap: 'var(--mantine-spacing-md)',
        width: '100%'
      }}
    >
        <Box style={{ flex: '2 1 300px', minWidth: '250px' }}>
            {OverviewCard}
        </Box>

        {statsConfig.map((stat) => {
            const Icon = icons[stat.icon];
            const showDiff = stat.diff !== 0;
            const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;
            
            let iconColor = 'gray';
            if (showDiff) {
               iconColor = stat.diff > 0 ? 'teal' : 'red';
               if (stat.id === 'avg_time') iconColor = stat.diff > 0 ? 'red' : 'teal';
            }

            return (
              <Box key={stat.title} style={{ flex: '1 1 140px', minWidth: '0px' }}>
                <Paper withBorder p="md" radius="md" style={{ height: '100%' }}>
                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed" tt="uppercase" fw={700} fz="xs" style={{ whiteSpace: 'nowrap' }}>
                      {stat.title}
                    </Text>
                    <ThemeIcon
                        color="gray"
                        variant="light"
                        style={{
                          color: !showDiff ? 'var(--mantine-color-gray-5)' : `var(--mantine-color-${iconColor}-6)`,
                        }}
                        size={26}
                        radius="md"
                    >
                        {showDiff ? <DiffIcon size={16} /> : <Icon size={16} />}
                    </ThemeIcon>
                  </Group>
                  
                  <Stack gap={0}>
                    <Text fw={700} fz={22} lh={1}>
                        {stat.value}
                    </Text>
                    <Text c="dimmed" fz="xs" mt={6} lh={1.3}>
                        {getDescription(stat.id, stat.diff)}
                    </Text>
                  </Stack>
                </Paper>
              </Box>
            );
        })}
    </Box>
  );
}

export default OverviewBarangayStatCards;