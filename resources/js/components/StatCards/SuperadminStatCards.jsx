import React from 'react';
import { Group, Paper, SimpleGrid, Text, ThemeIcon, Select, Skeleton, Box } from '@mantine/core';
import { 
  IconUsers, 
  IconDatabase, 
  IconBuildingCommunity,
  IconServer,
  IconChecks,
  IconLoader,
  IconArrowUpRight,
  IconArrowDownRight,
  IconUserCheck
} from '@tabler/icons-react';

const icons = {
  users: IconUsers,
  environments: IconDatabase,
  barangays: IconBuildingCommunity,
  active_sessions: IconUserCheck,
  resolved: IconChecks,
  unresolved: IconLoader,
};

// --- Sub-component for individual cards with Skeleton Logic ---
const StatCard = ({ title, value, iconName, diff, color, loading }) => {
  const Icon = icons[iconName] || IconServer;
  const diffColor = diff > 0 ? 'teal' : 'red';
  const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <Box>
          <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
            {title}
          </Text>
          
          {loading ? (
            <Skeleton height={28} mt={10} width={80} radius="sm" animate />
          ) : (
            <Text fw={700} fz={26}>
              {value}
            </Text>
          )}
        </Box>

        {loading ? (
          <Skeleton height={38} width={38} radius="md" animate />
        ) : (
          <ThemeIcon color={color || "gray"} variant="light" size={38} radius="md">
            <Icon size={28} stroke={1.5} />
          </ThemeIcon>
        )}
      </Group>

      <Box mt="sm">
        {loading ? (
          <Skeleton height={14} width="60%" radius="xl" animate />
        ) : (
          <Group gap={5}>
            <Text component="span" c={diffColor} fw={700} fz="sm" style={{ display: 'flex', alignItems: 'center' }}>
              <DiffIcon size={16} stroke={2} /> {Math.abs(diff)}%
            </Text>
            <Text c="dimmed" fz="xs">
              vs last month
            </Text>
          </Group>
        )}
      </Box>
    </Paper>
  );
};

// --- Main Stat Grid Component ---
const SuperadminStatCards = ({ data = {}, loading }) => {
  const statsConfig = [
    { 
      id: 'users',
      title: 'Total Users', 
      icon: 'users', 
      value: data.users?.total || 0, 
      diff: data.users?.diff || 0,
      color: 'blue'
    },
    { 
      id: 'envs',
      title: 'Environments', 
      icon: 'environments', 
      value: data.envs?.total || 0, 
      diff: data.envs?.diff || 0,
      color: 'teal'
    },
    { 
      id: 'brgy',
      title: 'Active Brgys', 
      icon: 'barangays', 
      value: data.brgy?.total || 0, 
      diff: data.brgy?.diff || 0,
      color: 'orange'
    },
    { 
      id: 'sessions',
      title: 'Active Now', 
      icon: 'active_sessions', 
      value: data.sessions?.total || 0, 
      diff: data.sessions?.diff || 0,
      color: 'green' 
    },
     { 
      id: 'unresolved',
      title: 'Unresolved Conflicts', 
      icon: 'unresolved', 
      value: `${data.unresolved?.total || 0}`, 
      diff: data.unresolved?.diff || 0,
      color: 'red'
    },
    { 
      id: 'resolved',
      title: 'Resolved Conflicts', 
      icon: 'resolved', 
      value: `${data.resolved?.total || 0}`, 
      diff: data.resolved?.diff || 0,
      color: 'green'
    },
  ];


  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing="md">
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
    </SimpleGrid>
  );
};

export default SuperadminStatCards;