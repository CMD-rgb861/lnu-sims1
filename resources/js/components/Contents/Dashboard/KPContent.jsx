import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  ActionIcon
} from '@mantine/core';
import {
  IconArrowRight
} from '@tabler/icons-react';

// Import your existing map
import axiosClient from '../../../api/axiosClient';
import OverviewBarangayStatCards from '../../StatCards/OverviewBarangayStatCards';
import DashboardBarangayConflictMap from '../../Maps/DashboardBarangayConflictMap';
import DashboardRecentBlotter from '../../Cards/DashboardRecentBlotter';
import BarangayConflictTrendChart from '../../Charts/BarangayConflictTrendChart';
import KPStageDistributionChart from '../../Charts/KPStageDistributionChart';
import DashboardAlerts from './DashboardAlerts';

const LGUContent = () => {

  const [envId, setEnvId] = useState(localStorage.getItem('current_env_id'));
  const [barPsgc, setBarPsgc] = useState(localStorage.getItem('current_bar_psgc'));
  const [barId, setBarId] = useState(localStorage.getItem('current_bar_id'));

  const [statCardData, setStatCardData] = useState([]);

  const [barangayDetails, setBarangayDetails] = useState([]);

  const [mapData, setMapData] = useState(null); 
  const [incidents, setIncidents] = useState([]); 
  const [blotters, setBlotters] = useState([]);
  const [trends, setTrends] = useState([]);
  const [KPData, setKPData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [blotterLoading, setBlotterLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [KPLoading, setKPLoading] = useState(true);

  useEffect(() => {
      if (barId) {
          Promise.all([
              axiosClient.get(`/api/${barId}/maps/fetch-barangay-map`),
              axiosClient.get(`/api/dashboard/kp/${barId}/conflict-map/data`),
              axiosClient.get(`/api/dashboard/kp/${barId}/recent-blotters/data`),
              axiosClient.get(`/api/dashboard/kp/${barId}/conflict-trends/data`),
              axiosClient.get(`/api/dashboard/kp/${barId}/kp-distribution/data`),
              axiosClient.get(`/api/da/fetch`),
          ])
          .then(([mapRes, incidentRes, blotters, trends, kp, alerts]) => {
              setMapData(mapRes.data);
              setIncidents(incidentRes.data);
              setBlotters(blotters.data);
              setTrends(trends.data);
              setKPData(kp.data);
              setAlerts(alerts.data);
          })
          .catch(error => console.error("Map Data Error:", error))
          .finally(() => {
              setMapLoading(false),
              setBlotterLoading(false),
              setTrendLoading(false),
              setKPLoading(false)
          });
      }
  }, [barId]);

  // Fetch env ID state
  useEffect(() => {
      const checkId = () => {
          const id = localStorage.getItem('current_env_id');
          const barPsgc = localStorage.getItem('current_bar_psgc');
          const barId = localStorage.getItem('current_bar_id');
          if (id !== envId) setEnvId(id);
          if (barPsgc !== barPsgc) setBarPsgc(barPsgc);
          if (barId !== barId) setBarId(barId);
      };

      // Check immediately and set up an interval or listener
      const interval = setInterval(checkId, 500); 
      return () => clearInterval(interval);
  }, [envId, barPsgc, barId]);

  // Fetch LGU Personnel dashboard adata
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch requests in parallel
        const [statCardResponse] = await Promise.all([
          axiosClient.get(`api/a/overview/${envId}/barangay/${barPsgc}/details`), 
        ]);
        setBarangayDetails(statCardResponse.data.data);
        setStatCardData(statCardResponse.data.stats);
      } catch (error) {
        //
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

      <Grid.Col span={12}>
        <DashboardAlerts 
          alerts={alerts}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <OverviewBarangayStatCards 
          data={statCardData}
          details={barangayDetails} 
        />
      </Grid.Col>

      <Grid.Col span={8}>
        <Card withBorder radius="md" p="md" h="100%" style={{ minHeight: '450px' }}>
          <Group mb="md" gap={8} align="center">
            <Title order={5}>Barangay Conflict Map</Title>
          </Group>
          <Box h={400} w="100%">
            <DashboardBarangayConflictMap
              mapData={mapData}
              incidents={incidents}
              mapLoading={mapLoading}
            />
          </Box>
        </Card>
      </Grid.Col>
      <Grid.Col span={4}>
        <Card withBorder radius="md" p="md" h="100%">
          <Group justify="space-between" mb="md">
            <Title order={5}>Recently Filed Blotters</Title>
            <ActionIcon component={Link} variant="subtle" color="blue" size="sm" to="/cr/blotters">
                <IconArrowRight size={16} />
            </ActionIcon>
          </Group>
          <DashboardRecentBlotter 
            blotters={blotters}
            blotterLoading={blotterLoading}
          />
        </Card>
      </Grid.Col>

      <Grid.Col span={6}>
        <Card withBorder radius="md" p="md" h="100%">
          <Group justify="space-between" mb="md">
            <Title order={5}>Conflict Status Trend</Title>
          </Group>
          <BarangayConflictTrendChart 
            data={trends}
            loading={trendLoading}
          />
        </Card>
      </Grid.Col>
      <Grid.Col span={6}>
        <Card withBorder radius="md" p="md" h="100%">
          <Group justify="space-between" mb="md">
            <Title order={5}>Katarungang Pambarangay Stage Distribution</Title>
          </Group>
          <KPStageDistributionChart 
            data={KPData}
            loading={KPLoading}
          />
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default LGUContent;