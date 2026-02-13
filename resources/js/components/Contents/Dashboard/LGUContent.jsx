import { useEffect, useState } from 'react';
import {
  Grid,
  Text,
  Group,
  Button,
  Title,
  Card,
  Select,
  Box,
  Flex,
} from '@mantine/core';
import {
  IconDownload,
  IconFilter
} from '@tabler/icons-react';

// Import your existing map
import axiosClient from '../../../api/axiosClient';
import LGUDashboardStatCards from '../../StatCards/LGUDashboardStatCards';
import DashboardConflictStatusMap from '../../Maps/DashboardConflictStatusMap';
import HighRiskBarangaysChart from '../../Charts/HighRiskBarangaysChart';
import ConflictTrendChart from '../../Charts/ConflictTrendChart';
import StatusDistributionChart from '../../Charts/StatusDistributionChart';
import StatusOutcomeChart from '../../Charts/StatusOutcomeChart';

const LGUContent = () => {

  const [envId, setEnvId] = useState(localStorage.getItem('current_env_id'));

  const [statCardData, setStatCardData] = useState([]);
  const [liveMapData, setLiveMapData] = useState([]);
  const [highRiskData, setHighRiskData] = useState([]);
  const [conflictTrendData, setConflictTrendData] = useState([]);
  const [conflictStatusData, setConflictStatusData] = useState([]);
  const [conflictOutcomeData, setConflictOutcomeData] = useState([]);

  const [riskFilter, setRiskFilter] = useState('this_month');
  const [statusFilter, setStatusFilter] = useState('this_month');
  const [outcomeFilter, setOutcomeFilter] = useState('this_month');

  const [loading, setLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [outcomeLoading, setOutcomeLoading] = useState(true);
  
  // Fetch env ID state
  useEffect(() => {
      const checkId = () => {
          const id = localStorage.getItem('current_env_id');
          if (id !== envId) setEnvId(id);
      };

      // Check immediately and set up an interval or listener
      const interval = setInterval(checkId, 500); 
      return () => clearInterval(interval);
  }, [envId]);

  // Fetch LGU Personnel dashboard adata
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch roles and pages in parallel
        const [statCardResponse, liveMapResponse, conflictTrendResponse, statusDistResponse] = await Promise.all([
          axiosClient.get(`api/dashboard/lgu/${envId}/stat-cards/data`),
          axiosClient.get(`api/dashboard/lgu/${envId}/live-map/data`),
          axiosClient.get(`api/dashboard/lgu/${envId}/conflict-trends/data`),
        ]);
        setStatCardData(statCardResponse.data);
        setLiveMapData(liveMapResponse.data);
        setConflictTrendData(conflictTrendResponse.data);
      } catch (error) {
        //
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. FETCH DYNAMIC CHART DATA (Runs when filter changes)
  useEffect(() => {
    const fetchChartData = async () => {
      setRiskLoading(true); // Triggers the skeleton on the chart ONLY
      try {
        const response = await axiosClient.get(`api/dashboard/lgu/${envId}/high-risk-chart/data`, {
          params: { filter: riskFilter } 
        });
        setHighRiskData(response.data);
      } catch (error) {
        console.error("Error loading chart data", error);
      } finally {
        setRiskLoading(false);
      }
    };

    if (envId) fetchChartData();
  }, [riskFilter]);

  useEffect(() => {
    const fetchStatusData = async () => {
      setStatusLoading(true); // Triggers the skeleton on the chart ONLY
      try {
        const response = await axiosClient.get(`api/dashboard/lgu/${envId}/status-distribution/data`, {
          params: { filter: statusFilter } 
        });
        setConflictStatusData(response.data);
      } catch (error) {
        console.error("Error loading chart data", error);
      } finally {
        setStatusLoading(false);
      }
    };

    if (envId) fetchStatusData();
  }, [statusFilter]);

  useEffect(() => {
    const fetchOutcomeData = async () => {
      setOutcomeLoading(true); // Triggers the skeleton on the chart ONLY
      try {
        const response = await axiosClient.get(`api/dashboard/lgu/${envId}/outcome-distribution/data`, {
          params: { filter: outcomeFilter } 
        });
        setConflictOutcomeData(response.data);
      } catch (error) {
        console.error("Error loading chart data", error);
      } finally {
        setOutcomeLoading(false);
      }
    };

    if (envId) fetchOutcomeData();
  }, [outcomeFilter]);

  return (
    <Grid gutter="md">
      {/* --- HEADER --- */}
      {/* <Grid.Col span={12}>
        <Flex justify="space-between" align="center" mb="sm">
          <Group>
            <Text fz="sm" c="dimmed">Filter by:</Text>
            <Select 
              placeholder="Filter Date" 
              defaultValue="this_month"
              icon={<IconFilter size={16} />}
              data={[
                { value: 'this_week', label: 'This Week' },
                { value: 'this_month', label: 'This Month' },
                { value: 'this_quarter', label: 'This Quarter' },
              ]}
              w={150}
            />
            <Button variant="outline" leftSection={<IconDownload size={16} />}>Export Report</Button>
          </Group>
        </Flex>
      </Grid.Col> */}

      {/* --- STAT CARDS --- */}
      <Grid.Col span={12}>
        <LGUDashboardStatCards 
          data={statCardData}
          loading={loading}
        />
      </Grid.Col>

      {/* --- ROW 1: MAP & TRENDS --- */}
      <Grid.Col span={8}>
        <Card withBorder radius="md" p="md" h="100%" style={{ minHeight: '450px' }}>
          <Group mb="md" gap={8} align="center">
            <div className="live-indicator" />
            <Title order={5}>Live Geo-Spatial Risk Map</Title>
          </Group>
          <Box h={400} w="100%">
            <DashboardConflictStatusMap
              data={liveMapData}
            />
          </Box>
        </Card>
      </Grid.Col>
      <Grid.Col span={4}>
        <HighRiskBarangaysChart 
          data={highRiskData}
          loading={loading}
          filter={riskFilter} 
          onFilterChange={setRiskFilter}
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <ConflictTrendChart 
          data={conflictTrendData}
          loading={loading}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <StatusDistributionChart 
          settled={conflictStatusData.settled}
          unsettled={conflictStatusData.unsettled}
          filter={statusFilter} 
          onFilterChange={setStatusFilter}    
          loading={loading}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <StatusOutcomeChart 
          data={conflictOutcomeData}
          filter={outcomeFilter} 
          onFilterChange={setOutcomeFilter}    
          loading={loading}
        />
      </Grid.Col>
    </Grid>
  );
};

export default LGUContent;