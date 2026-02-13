import {
  Text,
  Paper,
  TextInput,
  Grid,
  Badge,
  Select
} from '@mantine/core';
import {
  IconFilter,
  IconSearch
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { formatDistanceToNow } from 'date-fns';
import './TableStyling.css';

// Duplicate Map for Display purposes
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

const UserLogsTable = ({
  data,
  search,
  onSearchChange,
  selectedEvent,
  onEventChange,
  selectedUser,
  onUserChange,
  userOptions, 
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

  // Generate Event Options for Dropdown
  const eventOptions = Object.entries(EVENT_MAP).map(([id, label]) => ({
    value: id,   
    label: label,   
  }));

  return (
    <>
      <Paper withBorder radius="md" py="xl" px="xl" mb="lg">
        <Grid mb="md">
          <IconFilter size={22} color="gray" style={{marginRight: "5px"}}/>
          <Text mb="sm" fz="lg" fw={600}>Filters</Text> 
        </Grid>
        <Grid>
          <Grid.Col span={6} p={0} mr="md">
            <Text mb="sm" fz="sm" fw={600}>Search</Text> 
            <TextInput
              leftSection={<IconSearch size={16}/>}
              placeholder="Type a description or event..."
              value={search}
              onChange={(e) => onSearchChange(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={2} p={0} mr="md">
            <Text mb="sm" fz="sm" fw={600}>Event</Text> 
            <Select
              placeholder="All Events"
              data={eventOptions}
              value={selectedEvent}
              onChange={onEventChange}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={2} p={0} mr="md">
            <Text mb="sm" fz="sm" fw={600}>User</Text> 
            <Select
              placeholder="All Users"
              data={userOptions}
              value={selectedUser}
              onChange={onUserChange}
              clearable
              searchable
            />
          </Grid.Col>
        </Grid>
      </Paper>
      <Paper withBorder radius="md" p="lg">
        <Text mb="sm" fz="xl" fw={600}>Activities</Text> 
        <DataTable
          striped
          minHeight={150}
          highlightOnHover
          verticalSpacing="sm"
          records={data}
          columns={[
            {
              accessor: 'timestamp',
              title: 'Timestamp',
              textAlign: 'center',
              sortable: true,
              render: (row) => (
                <>
                    <Text fz="sm" fw={600} tt="capitalize">
                        {formatDistanceToNow(new Date(row.updated_at), { addSuffix: true })}
                    </Text>
                    <Text fz="sm" c="dimmed"> 
                        {new Date(row.created_at).toLocaleString()}
                    </Text>
                </>
              ),
            },
            {
              accessor: 'event_description',
              title: 'Event',
              textAlign: 'center',
              sortable: true,
              render: (row) => {
                // Map ID (1) -> Label ("Auth")
                const label = EVENT_MAP[row.event_description] || row.event_description;
                const color = EVENT_COLORS[label] || 'gray';
                
                return (
                  <Badge color={color} variant="filled">
                      {label}
                  </Badge>
                );
              },
            },
            {
              accessor: 'log_description',
              title: 'Description',
              textAlign: 'left',
            },
            {
              accessor: 'scope',
              title: 'Scope',
              textAlign: 'center',
              width: "25%",
              render: (row) => (
                    <Badge color={row.scope ? 'gray' : 'dark'} variant="light">
                        {row.scope?.trim() || 'NO SCOPE'}
                    </Badge>
                )
            },
            {
              accessor: 'user_account.full_name',
              title: 'Actor',
              textAlign: 'left',
            },
          ]}
          sortStatus={sortStatus}
          onSortStatusChange={(status) => onSort(status.columnAccessor)}
          totalRecords={totalRecords}
          recordsPerPage={rowsPerPage}
          page={activePage}
          onPageChange={onPageChange}
          emptyState={<Text>No activity logs found</Text>}
        />
      </Paper>
    </>
  );
};

export default UserLogsTable;