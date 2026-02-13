import { 
    Card, 
    Table, 
    Badge, 
    Text, 
    Group, 
    Skeleton, 
    Box,
    ScrollArea 
} from '@mantine/core';
import { formatDistanceToNow } from 'date-fns';
import {
  IconActivity
} from '@tabler/icons-react';

const EVENT_MAP = {
  1: 'Auth',
  2: 'Create',
  3: 'Update',
  4: 'Delete',
  5: 'Import',
  6: 'Export',
  7: 'Process',
};

const EVENT_COLORS = {
  'Auth': 'indigo',
  'Create': 'green',
  'Update': 'yellow',
  'Delete': 'red',
  'Import': 'cyan',
  'Export': 'teal',
  'Process': 'dark',
};

const DashboardRecentActivities = ({
    recentAct,
    recentActLoading
}) => {

    if (recentActLoading) {
        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Group justify="space-between" mb="md">
                    <Skeleton height={20} width="40%" />
                    <Skeleton height={20} width="15%" />
                </Group>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} height={40} mb="sm" radius="sm" />
                ))}
            </Card>
        );
    }

    return (
        <>
            {recentAct.length === 0 ? (
                <Box py="xl" ta="center">
                    <Text c="dimmed" size="sm">No recent activities found.</Text>
                </Box>
            ) : (
                <ScrollArea h={300} offsetScrollbars>
                    <Table verticalSpacing="sm" striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th></Table.Th>
                                <Table.Th>Description</Table.Th>
                                <Table.Th>Event</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {recentAct.map((row) => {
                                const label = EVENT_MAP[row.event_description] || row.event_description;
                                const color = EVENT_COLORS[label] || 'gray';

                                return (
                                    <Table.Tr key={row.id}>
                                        <Table.Td>
                                            <IconActivity color="gray" />
                                        </Table.Td>
                                        
                                        <Table.Td>
                                            <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>
                                                {row.user_account.full_name}
                                            </Text>
                                            <Box w={250}>
                                                <Text size="xs" truncate>
                                                    {row.log_description}
                                                </Text>
                                            </Box>
                                            <Text size="xs" c="dimmed">
                                                {row.created_at 
                                                    ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true }) 
                                                    : 'N/A'}
                                            </Text>
                                        </Table.Td>

                                        <Table.Td>
                                            <Badge color={color} variant="filled">
                                                {label}
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            )}
        </>
    );
};

export default DashboardRecentActivities;