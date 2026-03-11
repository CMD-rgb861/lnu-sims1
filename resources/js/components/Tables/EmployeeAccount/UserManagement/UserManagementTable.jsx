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
  IconPhoneCall
} from '@tabler/icons-react';

import { DataTable } from 'mantine-datatable';
import { getDiceBearAvatar } from '../../plugins/dicebear'; 
import './TableStyling.css';

const UserManagementTable = ({
  data,
  search,
  onSearchChange,
  onAddUser,
  onEditUser,
  onDeleteUser,
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
              style={{ fontSize: '12px' }}
              onClick={onAddUser}
            >
              Create User Account
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
          striped
          minHeight={150}
          highlightOnHover
          withTableBorder
          verticalSpacing="sm"
          records={data}
          columns={[
            {
              accessor: 'full_name',
              title: 'Full Name',
              sortable: true,
              render: (row) => {
                return (
                    <Group>
                        <Avatar
                        src={row.avatar || getDiceBearAvatar(row.full_name, 'initials')}
                        alt={row.full_name || 'User'}
                        radius="xl"
                        size="md"
                        >
                            {row.full_name ? row.full_name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Text fz="sm" fw={500}>
                            {row.full_name}
                        </Text>
                    </Group>
                );
              },
            },
            {
              accessor: 'assigned_role',
              title: 'Role',
              textAlign: 'center',
              sortable: true,
              render: (row) => {
                const color =
                  row.assigned_role.description === 'Superadmin'
                    ? 'orange'
                    : row.assigned_role.description === 'Admin'
                    ? 'yellow'
                    : 'blue';
                return (
                  <Badge color={color} variant="light">
                    {row.assigned_role.description}
                  </Badge>
                );
              },
            },
            {
              accessor: 'assigned_environment',
              title: 'Assigned LGU',
              render: (record) => {
                // 1. Check if the object exists (it might be null for Super Admins)
                if (!record.assigned_environment) {
                    return <Text c="dimmed">No Assignment</Text>;
                }

                // 2. Render a SPECIFIC property (env_name), NOT the whole object
                return (
                    <Text>
                        {record.assigned_environment.env_name} 
                    </Text>
                );
              },
            },
            {
              accessor: 'verification_status',
              title: 'Verified',
              textAlign: 'center',
              sortable: true,
              render: (row) => {
                const color =
                  row.verification_status === 'Verified'
                    ? 'green'
                    : row.verification_status === 'Pending'
                    ? 'blue'
                    : undefined;
                return (
                  <Badge color={color} variant="light">
                    {row.verification_status}
                  </Badge>
                );
              },
            },
            {
              accessor: 'login_status',
              title: 'Status',
              textAlign: 'center',
              sortable: true,
              render: (row) => {
                const color =
                  row.login_status === 'Online'
                    ? 'green'
                    : row.login_status === 'Offline'
                    ? 'red'
                    : undefined;
                return (
                  <Badge color={color} variant="light">
                    {row.login_status}
                  </Badge>
                );
              },
            },
            {
              accessor: 'last_login',
              title: 'Last Active',
              textAlign: 'center',
              sortable: true,
            },
            {
              accessor: 'created_at',
              title: 'Created At',
              sortable: true,
              textAlign: 'center',
              render: (row) => new Date(row.created_at).toLocaleString(),
            },
            {
              accessor: 'updated_at',
              title: 'Updated At',
              sortable: true,
              textAlign: 'center',
              render: (row) => new Date(row.updated_at).toLocaleString(),
            },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'center',
              render: (row) => (
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>User Account Details</Menu.Label>
                    <div>
                    <Group px="sm" pb="sm">
                        <div>
                        <Text fz="md" fw={500} className="name">
                            {row.username ? row.username : 'N/A'}
                        </Text>
                        <Group wrap="nowrap" gap={10} mt={3}>
                            <IconAt stroke={1.5} size={16} className="icon" />
                            <Text fz="xs" c="dimmed">
                            {row.email}
                            </Text>
                        </Group>
                        <Group wrap="nowrap" gap={10} mt={5}>
                            <IconPhoneCall stroke={1.5} size={16} className="icon" />
                            <Text fz="xs" c="dimmed">
                            {row.contact_num}
                            </Text>
                        </Group>
                        </div>
                    </Group>
                    </div>
                    <Menu.Item
                      leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => onEditUser(row)}
                    >
                      Edit User Account
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => onDeleteUser(row)}
                      disabled={row.assigned_role.description === "Superadmin"}
                    >
                      Delete User Account
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
          emptyState={<Text>No user accounts found</Text>}
        />
      </Paper>
    </>
  );
};

export default UserManagementTable;