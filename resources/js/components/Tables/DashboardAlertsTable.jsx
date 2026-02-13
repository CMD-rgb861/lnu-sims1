import {
  Text,
  Paper,
  rem,
  TextInput,
  Grid,
  Button,
  ActionIcon,
  Menu,
  Badge,
  Group,
  Tooltip,
} from '@mantine/core';
import {
  IconSearch,
  IconPencil,
  IconDotsVertical,
  IconTrash,
  IconInfoCircle,
  IconCalendarClock,
  IconLock,
  IconLockOpen,
  IconPlus
} from '@tabler/icons-react';

import { DataTable } from 'mantine-datatable';
import './TableStyling.css';

const DashboardAlertsTable = ({
  data,
  search,
  onSearchChange,
  onAddAlert,
  onEditAlert,
  onDeleteAlert,
  sortKey,
  reverseSortDirection,
  onSort,
  activePage,
  totalRecords,
  onPageChange,
  rowsPerPage
}) => {
  const sortStatus = {
    columnAccessor: sortKey,
    direction: reverseSortDirection ? 'desc' : 'asc',
  };

  const handleSortStatusChange = (status) => {
    onSort(status.columnAccessor);
  };

  // Helper to render Category Badges
  const renderCategory = (category) => {
    const map = {
      1: { label: 'Info', color: 'blue' },
      2: { label: 'Success', color: 'teal' },
      3: { label: 'Warning', color: 'orange' },
      4: { label: 'Urgent', color: 'red' },
    };
    const details = map[category] || { label: 'General', color: 'gray' };
    return <Badge color={details.color} variant="light">{details.label}</Badge>;
  };

  return (
    <>
      <Paper withBorder radius="md" p="lg">
        <Grid align="center" mb="md">
          <Grid.Col span={4}>
            <Button
              variant="filled"
              color="teal"
              onClick={onAddAlert}
              size="xs"
            >
              Add Dashboard Alert
            </Button>
          </Grid.Col>
          <Grid.Col span={4} offset={4}>
            <TextInput
              placeholder="Search alerts..."
              leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
              value={search}
              onChange={onSearchChange}
            />
          </Grid.Col>
        </Grid>

        <DataTable
          striped
          minHeight={150}
          highlightOnHover
          withTableBorder
          verticalSpacing="sm"
          records={data}
          columns={[
            {
              accessor: 'title',
              title: 'Title',
              sortable: true,
              render: ({ title }) => (
                <Text size="sm" fw={500} truncate="end" style={{ maxWidth: 200 }}>
                  {title}
                </Text>
              ),
            },
            {
              accessor: 'category',
              title: 'Nature',
              textAlign: 'center',
              sortable: true,
              render: (row) => renderCategory(row.category),
            },
            {
              accessor: 'is_dismissible',
              title: 'Type',
              textAlign: 'center',
              render: (row) => (
                <Group justify="center" gap="xs">
                  {row.is_dismissible ? (
                    <Tooltip label="User can dismiss">
                      <IconLockOpen size={16} color="var(--mantine-color-gray-5)" />
                    </Tooltip>
                  ) : (
                    <Tooltip label="Mandatory (Sticky)">
                      <IconLock size={16} color="var(--mantine-color-red-6)" />
                    </Tooltip>
                  )}
                  <Text size="xs">{row.is_dismissible ? 'Dismissible' : 'Mandatory'}</Text>
                </Group>
              ),
            },
            {
              accessor: 'show_until',
              title: 'Expires On',
              sortable: true,
              textAlign: 'center',
              render: (row) => row.show_until ? (
                <Group justify="center" gap={4}>
                  <Text size="sm">{new Date(row.show_until).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
                </Group>
              ) : (
                <Text size="sm" c="dimmed">No Expiry</Text>
              ),
            },
            {
              accessor: 'created_at',
              title: 'Posted',
              textAlign: 'center',
              render: (row) => (
                <Text size="sm" suppressHydrationWarning>
                {new Date(row.created_at).toLocaleDateString()}
                </Text>
              ),
            },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'center',
              render: (row) => (
                <Menu shadow="md" width={200} position="bottom-end" withArrow>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Management</Menu.Label>
                    <Menu.Item
                      leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => onEditAlert(row)}
                    >
                      Edit Details
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => onDeleteAlert(row)}
                    >
                      Remove Alert
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ),
            },
          ]}
          sortStatus={sortStatus}
          onSortStatusChange={handleSortStatusChange}
          totalRecords={totalRecords}
          recordsPerPage={rowsPerPage}
          page={activePage}
          onPageChange={onPageChange}
          emptyState={
            <Group justify="center" gap="xs" c="dimmed">
              <IconInfoCircle size={18} />
              <Text>No alerts found</Text>
            </Group>
          }
        />
      </Paper>
    </>
  );
};

export default DashboardAlertsTable;