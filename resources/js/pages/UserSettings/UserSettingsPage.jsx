import { useEffect, useState } from 'react';
import {
  Title,
  Breadcrumbs,
  Anchor,
  Grid,
  Paper,
  Skeleton,
  Text,
  Tabs,
  Divider
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';

import axiosClient from '../../api/axiosClient';
import UserSettingsAccountsForm from '../../components/Forms/UserSettingsAccountsForm';
import UserSettingSecurityForm from '../../components/Forms/UserSettingsSecurityForm';

const ROWS_PER_PAGE = 10;

const UserSettingsPage = () => {
  // Breadcrumbs items
  const items = [
    { title: 'Home', href: '/dashboard' },
    { title: 'User Settings', href: '#' }
  ].map((item, index) => (
    <Anchor href={item.href} key={index} fz={14} fw={400}>
      {item.title}
    </Anchor>
  ));

  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refetchData = async () => {
    try {
        const [userDetailsReponse] = await Promise.all([
          axiosClient.get(`api/user-settings/account/data`),
        ]);
        setUserDetails(userDetailsReponse.data);
    } catch (error) {
      toast.error("Failed to refetch data");
    }
  };

  // Fetch barangay data from the backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userDetailsReponse] = await Promise.all([
          axiosClient.get(`api/user-settings/account/data`),
        ]);
        setUserDetails(userDetailsReponse.data);
      } catch (error) {
        //
      }finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  // Handle "Edit Barangay" API call
  const handleEditUser = async (values) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      const payload = { 
          ...values
      };
      await axiosClient.put(`api/user-settings/account/update`, payload);
      await refetchData();
    } catch (error) {
      //
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleEditSecurity = async (values) => {
    setIsSubmitting(true);
    try {
      // Ensure this endpoint matches your Laravel route
      await axiosClient.put(`api/user-settings/security/update`, values);
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Grid>
        <Grid.Col span={12}>
          <Breadcrumbs separator=">" mb="md" fw={400}>
            {[
              { title: 'Home', href: '/dashboard' },
              { title: 'User Settings', href: '#' }
            ].map((item, index) => (
              <Anchor href={item.href} key={index} fz={14} fw={400}>
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>
          <Divider mb="lg" />
          <Title align="left" order={2} mb={4} fw={600} fz={22}>
            User Settings
          </Title>
          <Text fz="sm" fw={500} mb="lg" c="dimmed">Manage and adjust user account preferences.</Text>
          
          <Grid>
            <Grid.Col span={6}>
                <Paper withBorder radius="md" p="lg">
                    {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} height={40} mb="md" radius="md" />
                    ))}
                </Paper>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <>
      <Grid>
        <Grid.Col span={12}>
            <Breadcrumbs separator=">" mb="md" fw={400}>{items}</Breadcrumbs>
            <Divider mb="lg" />
            <Title align="left" order={2} mb={4} fw={600} fz={22}>
              User Settings
            </Title>
            <Text fz="sm" fw={500} mb="lg" c="dimmed">Manage and adjust user account preferences.</Text>
        </Grid.Col>
        <Grid.Col span={12}>
            <Tabs defaultValue="details" orientation="vertical" variant="outline" radius="md">
                <Tabs.List>
                    <Tabs.Tab value="details" mb="sm">Account Preferences</Tabs.Tab>
                    <Tabs.Tab value="personnel" mb="sm">Security</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="details">
                    <Grid.Col span={6} px="md">
                        <Text pl="md" fw={600} fz="lg">Account Preferences</Text>
                        <Text pl="md" fz="sm" fw={500} mb="lg" c="dimmed">Adjust settings on your user account.</Text>
                        <UserSettingsAccountsForm 
                            userDetails = {userDetails}
                            onEditUser = {handleEditUser}
                        />
                    </Grid.Col>
                </Tabs.Panel>
                <Tabs.Panel value="personnel" px="md">
                    <Grid.Col span={6} px="md">
                        <Text fw={600} fz="lg">Security</Text>
                        <Text fz="sm" fw={500} mb="lg" c="dimmed">Ensure your account is using a long, random password to stay secure.</Text>
                        <UserSettingSecurityForm 
                            userDetails = {userDetails}
                            onEditSecurity = {handleEditSecurity}
                        />
                    </Grid.Col>
                </Tabs.Panel>
            </Tabs>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default UserSettingsPage;