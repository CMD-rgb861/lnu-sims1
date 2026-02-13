import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Text, Box, Card, Group, Title, ActionIcon } from '@mantine/core';
import {
  IconArrowRight
} from '@tabler/icons-react';

import SuperadminStatCards from '../../StatCards/SuperadminStatCards';

import axiosClient from '../../../api/axiosClient';
import DashboardRecentActivities from '../../Cards/DashboardRecentActivities';
import UserLoginTrendChart from '../../Charts/UserLoginTrendChart';

const SuperadminContent = () => {
  // Replace with real data from your backend API
  const [loading, setLoading] = useState(false);
  const [recentActLoading, setRecentActLoading] = useState(true);
  const [loginTrendsLoading, setLoginTrendsLoading] = useState(true);
  
  const [statCardData, setStatCardData] = useState([]);
  const [recentAct, setRecentAct] = useState([]);
  const [loginTrends, setLoginTrends] = useState([]);

  // Fetch LGU Personnel dashboard adata
  useEffect(() => {
    Promise.all([
      axiosClient.get(`api/dashboard/sa/stat-cards/data`),
      axiosClient.get(`/api/dashboard/sa/recent-activities/data`),
      axiosClient.get(`/api/dashboard/sa/login-trends/data`),
    ])
    .then(([statCardRes, recentActivitiesRes, loginTrendsRes]) => {
        setStatCardData(statCardRes.data);
        setRecentAct(recentActivitiesRes.data);
        setLoginTrends(loginTrendsRes.data)
    })
    .catch(error => console.error("Map Data Error:", error))
    .finally(() => {
        setLoading(false);
        setRecentActLoading(false);
        setLoginTrendsLoading(false);
    });
  }, []);

  return (
    <Box py="xl">
      <Grid>
        <Grid.Col span={12}>
          <SuperadminStatCards data={statCardData} loading={loading} />
        </Grid.Col>

        <Grid.Col span={8}>
          <Card withBorder radius="md" p="md" h="100%" style={{ minHeight: '450px' }}>
            <Group mb="md" gap={8} align="center">
              <Title order={5}>User Login Trends</Title>
            </Group>
            <UserLoginTrendChart 
              loginTrends={loginTrends}
              loginTrendsLoading={loginTrendsLoading}
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Card withBorder radius="md" p="md" h="100%">
            <Group justify="space-between">
              <Title order={5}>Recent Activities</Title>
              <ActionIcon component={Link} variant="subtle" color="blue" size="sm" to="/al">
                  <IconArrowRight size={16} />
              </ActionIcon>
            </Group>
            <Text fz="xs" c="dimmed" mb="md">Showing 5 recent system activities</Text>
            <DashboardRecentActivities 
              recentAct={recentAct}
              recentActLoading={recentActLoading}
            />
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default SuperadminContent;