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
  Avatar,
} from '@mantine/core';
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconPencil,
  IconDotsVertical,
  IconTrash,
  IconPlus,
  IconAt,
  IconPhoneCall,
  IconUsers
} from '@tabler/icons-react';

import { DataTable } from 'mantine-datatable';
import { getDiceBearAvatar } from '../../../../plugins/dicebear'; 
import { formatDistanceToNow } from 'date-fns';
import '../../TableStyling.css';

const EmployeeAccountsTable = ({
  data,
  search,
  onSearchChange,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  sortKey,
  reverseSortDirection,
  onSort,
  activePage,
  totalPages,
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

  return (
    <>
      <Paper withBorder radius="md" p="lg">
        <Grid>
          <Grid.Col span={4}>
            <Button
              variant="filled"
              p="xs"
              color="teal"
              fz={10}
              onClick={onAddEmployee}
            >
              Add Employee Account
            </Button>
          </Grid.Col>
          <Grid.Col span={3} offset={5}>
            <TextInput
              placeholder="Type any keyword..."
              leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
              value={search}
              onChange={onSearchChange}
              mb="md"
            />
          </Grid.Col>
        </Grid>
        <DataTable
          minHeight={150}
          highlightOnHover
          verticalSpacing="sm"
          fz="xs"
          records={data}
          columns={[
            {
              accessor: 'id_number',
              title: 'ID Number',
              textAlign: 'center',
              sortable: true,
            },
            {
              accessor: 'display_name',
              title: 'Employee Name',
              textAlign: 'left',
              sortable: true,
              render: (row) => {
                return (
                    <Group>
                        <Avatar
                        src={row.avatar || getDiceBearAvatar(row.display_name, 'initials')}
                        alt={row.display_name || 'User'}
                        radius="xl"
                        size="md"
                        >
                            {row.display_name ? row.display_name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Text fz="sm" fw={500}>
                            {row.display_name}
                        </Text>
                    </Group>
                );
              },
            },
            {
                accessor: 'user_type',
                title: 'User Type',
                textAlign: 'center',
                sortable: true,
                render: (row) => {
                    const color =
                    row.user_type === 'Administrator'
                        ? 'yellow'
                        : 'blue';
                    return (
                        <Badge color={color} variant="light" fz={10}>
                            {row.user_type}
                        </Badge>
                    );
                },    
            },
            {
                accessor: 'is_verified',
                title: 'Verified',
                textAlign: 'center',
                sortable: true,
                render: (row) => {
                    const color =
                    row.is_verified === 'Verified'
                        ? 'green'
                        : 'red';
                    return (
                        <Badge color={color} variant="light" fz={10}>
                            {row.is_verified}
                        </Badge>
                    );
                },    
            },
            {
              accessor: 'last_login',
              title: 'Last Login',
              sortable: false,
              textAlign: 'center',
                render: (row) => (
                    row.last_login ? (
                    <>
                        <Text fw={600} tt="capitalize" fz="xs">
                            {formatDistanceToNow(new Date(row.last_login), { addSuffix: true })}
                        </Text>
                        <Text fz="xs" c="dimmed"> 
                            {new Date(row.last_login).toLocaleString()}
                        </Text>
                    </>
                    ) : (
                    <>
                        <Text fz="xs" fw={600}>
                            Never
                        </Text>
                        <Text fz="xs" c="dimmed"> 
                            --
                        </Text>
                    </>
                    )
                ),
            },
            {
              accessor: 'created_at',
              title: 'Created At',
              sortable: true,
              textAlign: 'center',
              render: (row) => (
                <>
                    <Text fw={600} tt="capitalize" fz="xs">
                        {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                    </Text>
                    <Text fz="xs" c="dimmed"> 
                        {new Date(row.created_at).toLocaleString()}
                    </Text>
                </>
              ),
            },
            {
              accessor: 'updated_at',
              title: 'Updated At',
              sortable: true,
              textAlign: 'center',
              render: (row) => (
                <>
                    <Text fw={600} tt="capitalize" fz="xs">
                        {formatDistanceToNow(new Date(row.updated_at), { addSuffix: true })}
                    </Text>
                    <Text fz="xs" c="dimmed"> 
                        {new Date(row.updated_at).toLocaleString()}
                    </Text>
                </>
              ),
            },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'center',
              sortable: false,
              render: (row) => (
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconUsers style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => onEditEmployee(row)}
                    >
                      Manage User Roles
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => onEditEmployee(row)}
                    >
                      Edit Account
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => onDeleteEmployee(row)}
                    >
                      Delete Account
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
          emptyState={<Text fz="sm">No employee accounts found</Text>}
        />
      </Paper>
    </>
  );
};

export default EmployeeAccountsTable;