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

const DashboardRecentBlotter = ({
    blotters,
    blotterLoading
}) => {

    const getBadgeColor = (type) => {
        if (type == 1) return 'blue';
        if (type == 2) return 'red';
        return 'gray';
    };

    if (blotterLoading) {
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
            {blotters.length === 0 ? (
                <Box py="xl" ta="center">
                    <Text c="dimmed" size="sm">No recent blotters found.</Text>
                </Box>
            ) : (
                <ScrollArea h={300} offsetScrollbars>
                    <Table verticalSpacing="sm" striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Blotter Code</Table.Th>
                                <Table.Th>Category</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Date</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {blotters.map((row) => (
                                <Table.Tr key={row.id}>
                                    <Table.Td>
                                        <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>
                                            {row.blotter_code}
                                        </Text>
                                        <Box w={150}>
                                            <Text size="sm" truncate>
                                                {row.description}
                                            </Text>
                                        </Box>
                                    </Table.Td>

                                    <Table.Td>
                                        <Badge 
                                            size="xs" 
                                            color={getBadgeColor(row.category.type)} 
                                            variant="light" 
                                            mt={4}
                                        >
                                            {row.category.desc || 'Uncategorized'}
                                        </Badge>
                                    </Table.Td>

                                    <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <Text size="xs" c="dimmed">
                                            {row.created_at 
                                                ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true }) 
                                                : 'N/A'}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            )}
        </>
    );
};

export default DashboardRecentBlotter;