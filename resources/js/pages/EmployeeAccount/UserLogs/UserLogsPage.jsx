import { useEffect, useState, useMemo } from 'react';
import {
  Title,
  Breadcrumbs,
  Anchor,
  Grid,
  Paper,
  Skeleton,
  Text,
  Divider,
  SimpleGrid,
  Group
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import axiosClient from '../../api/axiosClient';
import UserLogsStatCards from '../../components/StatCards/UserLogsStatCards';
import UserLogsTable from '../../components/Tables/UserLogsTable';

const ROWS_PER_PAGE = 10;

// 1. Map IDs to Strings
const EVENT_MAP = {
  1: 'Auth',
  2: 'Create',
  3: 'Update',
  4: 'Delete',
  5: 'Import',
  6: 'Export',
  7: 'Process',
};

const UserLogsPage = () => {
  const items = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Analytics', href: '#' },
    { title: 'LGU Overview', href: 'a/overview' }
  ].map((item, index) => (
    <Anchor href={item.href} key={index} fz={14} fw={400}>
      {item.title}
    </Anchor>
  ));

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // 2. Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [selectedEvent, setSelectedEvent] = useState(null); // Stores ID like "1"
  const [selectedUser, setSelectedUser] = useState(null);   // Stores Name like "John"

  const [sortKey, setSortKey] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [activePage, setActivePage] = useState(1);

  const envId = localStorage.getItem('current_env_id');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`api/al/data`);
      setLogs(response.data.logs || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
  }, [envId]);

  // Reset page when filters change
  useEffect(() => {
    setActivePage(1);
  }, [debouncedSearch, selectedEvent, selectedUser]);

  // 3. User Dropdown Options
  const userOptions = useMemo(() => {
    if (!logs) return [];
    const uniqueUsers = Array.from(new Set(logs.map(log => log.user_account?.full_name))).filter(Boolean);
    return uniqueUsers.map(user => ({ value: user, label: user }));
  }, [logs]);

  // 4. Bulletproof Filter Logic
  const filteredData = useMemo(() => {
    return logs.filter((item) => {
      const query = debouncedSearch.toLowerCase().trim();
      const rawEvent = item.event_description; 
      
      // -- Search Logic --
      // Resolve ID to Label (e.g. 1 -> "Auth") for text searching
      const eventLabel = EVENT_MAP[rawEvent] || String(rawEvent);
      
      const matchesSearch = 
        (item.log_description && item.log_description.toLowerCase().includes(query)) ||
        (eventLabel.toLowerCase().includes(query));

      // -- Event Dropdown Logic (Fail-Safe) --
      let matchesEvent = true;
      if (selectedEvent) {
        // selectedEvent is the ID as a string (e.g. "1")
        // rawEvent might be 1 (number) or "1" (string) or even "Auth" (text)
        
        // Check 1: Does ID match ID? (Use loose equality '==' to match 1 with "1")
        const idMatch = rawEvent == selectedEvent;
        
        // Check 2: Does the text label match? (e.g. does "Auth" == "Auth")
        // We look up what "1" means (Label) and compare that to the raw data
        const targetLabel = EVENT_MAP[selectedEvent]; // Get "Auth" from "1"
        const labelMatch = String(rawEvent) === targetLabel;

        matchesEvent = idMatch || labelMatch;
      }

      // -- User Dropdown Logic --
      const matchesUser = selectedUser 
        ? item.user_account?.full_name === selectedUser 
        : true;

      return matchesSearch && matchesEvent && matchesUser;
    });
  }, [logs, debouncedSearch, selectedEvent, selectedUser]);

  // 5. Sorting Logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    
    // Helper to safely access nested properties like "user_account.full_name"
    const getVal = (obj, path) => path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
    
    const valA = getVal(a, sortKey);
    const valB = getVal(b, sortKey);

    if (typeof valA === 'number' && typeof valB === 'number') {
        return reverseSortDirection ? valA - valB : valB - valA;
    }
    const strA = String(valA || '').toLowerCase();
    const strB = String(valB || '').toLowerCase();

    return reverseSortDirection
      ? strB.localeCompare(strA)
      : strA.localeCompare(strB);
  });

  const totalRecords = sortedData.length;
  const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
  const start = (activePage - 1) * ROWS_PER_PAGE;
  const paginatedData = sortedData.slice(start, start + ROWS_PER_PAGE);

  const setSorting = (key) => {
    const reversed = key === sortKey ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortKey(key);
  };

  if (loading) {
    return (
      <Grid>
        <Grid.Col span={12}>
          <Breadcrumbs mb="md" fw={400}>{items}</Breadcrumbs>
          <Divider mb="lg" />
          <Title align="left" order={2} mb={4} fw={600} fz={22}>
            Activity Logs
          </Title>
          <Text fz="sm" fw={500} mb="lg" c="dimmed">Monitor system-wide activity logs and audit trail.</Text>

          <SimpleGrid cols={{ base: 1, sm: 4 }} mb="md">
            {Array(4).fill(0).map((_, index) => (
              <Paper withBorder p="md" radius="md" key={index}>
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Skeleton height={10} width={50} radius="xl" mb={8} />
                    <Skeleton height={26} width={60} radius="sm" mb={6} />
                    <Skeleton height={12} width={100} radius="xl" />
                  </div>
                  <Skeleton height={24} width={24} circle />
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
            
          <Paper withBorder radius="md" py="xl" px="xl" mb="lg">
            <Skeleton height={25} width={80} mb="md" radius="sm" /> 
            <Grid>
              <Grid.Col span={6} mr="md">
                 <Skeleton height={20} width={60} mb="xs" radius="sm"/> 
                 <Skeleton height={36} radius="sm" /> 
              </Grid.Col>
              
              <Grid.Col span={2} mr="md">
                 <Skeleton height={20} width={60} mb="xs" radius="sm"/>
                 <Skeleton height={36} radius="sm" />
              </Grid.Col>
              
              <Grid.Col span={2} mr="md">
                 <Skeleton height={20} width={60} mb="xs" radius="sm"/>
                 <Skeleton height={36} radius="sm" />
              </Grid.Col>
            </Grid>
          </Paper>

          <Paper withBorder radius="md" p="lg">
             <Skeleton height={30} width={120} mb="lg" radius="sm" /> 
             
             <Grid mb="sm" columns={12}>
                <Grid.Col span={2}><Skeleton height={20} radius="sm" /></Grid.Col> 
                <Grid.Col span={2}><Skeleton height={20} radius="sm" /></Grid.Col>
                <Grid.Col span={3}><Skeleton height={20} radius="sm" /></Grid.Col>
                <Grid.Col span={2}><Skeleton height={20} radius="sm" /></Grid.Col>
                <Grid.Col span={3}><Skeleton height={20} radius="sm" /></Grid.Col> 
             </Grid>
             <Divider mb="sm" />

             {/* Table Rows Simulation */}
             {Array.from({ length: 8 }).map((_, index) => (
               <Skeleton key={index} height={40} mb="sm" radius="sm" />
             ))}
          </Paper>

        </Grid.Col>
      </Grid>
    );
  }

  return (
    <Grid>
      <Grid.Col span={12}>
        <Breadcrumbs mb="md" fw={400}>{items}</Breadcrumbs>
        <Divider mb="lg" />
        <Title align="left" order={2} mb={4} fw={600} fz={22}>
          Activity Logs
        </Title>
        <Text fz="sm" fw={500} mb="lg" c="dimmed">Monitor system-wide activity logs and audit trail.</Text>

        <div style={{ marginBottom: '20px' }}>
          <UserLogsStatCards data={stats} />
        </div>

        <UserLogsTable
          data={paginatedData}
          search={search}
          onSearchChange={(val) => setSearch(val)} // Receives string value directly
          selectedEvent={selectedEvent}
          onEventChange={setSelectedEvent}
          selectedUser={selectedUser}
          onUserChange={setSelectedUser}
          userOptions={userOptions}
          sortKey={sortKey}
          reverseSortDirection={reverseSortDirection}
          onSort={setSorting}
          activePage={activePage}
          totalPages={totalPages}
          onPageChange={setActivePage}
          totalRecords={totalRecords}
          rowsPerPage={ROWS_PER_PAGE}  
        />
      </Grid.Col>
    </Grid>
  );
};

export default UserLogsPage;