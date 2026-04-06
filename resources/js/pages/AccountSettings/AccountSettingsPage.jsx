import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMediaQuery } from '@mantine/hooks';
import {
  Title,
  Breadcrumbs,
  Anchor,
  Grid,
  Paper,
  Skeleton,
  Text,
  Tabs,
  Divider,
  Box,
  useMantineTheme
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';

import axiosClient from '../../api/axiosClient';
import AccountSettingsAccountsForm from '../../components/Forms/AccountSettingsAccountsForm';
import AccountSettingSecurityForm from '../../components/Forms/AccountSettingSecurityForm';

import { updateUser, logoutUser } from '../../store/slices/AuthSlice';

import { IconUserCog } from '@tabler/icons-react';

const AccountSettingsPage = () => {
    // Breadcrumbs items
    const items = [
        { title: 'Home', href: '/dashboard' },
        { title: 'Account Settings', href: '#' }
    ].map((item, index) => (
        <Anchor href={item.href} key={index} fz={14} fw={400}>
        {item.title}
        </Anchor>
    ));

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

    const { user, user_type } = useSelector((state) => state.auth);
    const apiPrefix = user_type === "Student" ? 'api/as/s' : 'api/as/e';

    const [userDetails, setUserDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const refetchData = async () => {
    //     try {
    //         const [userDetailsReponse] = await Promise.all([
    //             axiosClient.get(`${apiPrefix}/data`),
    //         ]);
    //         setUserDetails(userDetailsReponse.data);
    //     } catch (error) {
    //         console.error("Failed to refetch data", error);
    //     }
    // };

    const handleEditUser = async (values) => {
        setIsSubmitting(true);
        setLoading(true);
        try {
            const payload = { ...values };
            await axiosClient.put(`${apiPrefix}/preferences/update`, payload);
            window.location.reload();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleEditSecurity = async (values) => {
        setIsSubmitting(true);
        try {
            await axiosClient.put(`${apiPrefix}/security/update`, values);
            dispatch(logoutUser());
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
            <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
            <Divider mb="lg" />
            <Title order={2} mb={4} fw={600} fz={20}>
                Account Settings
            </Title>
            <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage and adjust user account preferences.</Text>
            
            <Grid>
                {/* FIXED: Added responsive span base: 12 (Mobile 100%), md: 6 (Desktop 50%) */}
                <Grid.Col span={{ base: 12, md: 8, lg: 6 }}>
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
                <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                <Divider mb="lg" />
                <Title order={2} mb={4} fw={600} fz={20}>
                    Account Settings
                </Title>
                <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage and adjust user account preferences.</Text>
            </Grid.Col>

            <Grid.Col span={12}>
                {/* FIXED: Make tabs orientation switch to horizontal on small screens to save space */}
                <Tabs 
                    defaultValue="details" 
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    variant="outline" 
                    radius="md"
                >
                    <Tabs.List>
                        <Tabs.Tab value="details" mb={isMobile ? '' : 'sm'} fz="xs">Account Preferences</Tabs.Tab>
                        <Tabs.Tab value="personnel" mb={isMobile ? '' : 'sm'} fz="xs">Security</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="details" pl={isMobile ? 0 : 'md'} pt={isMobile ? 'md' : 0}>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 10, lg: 6 }}>
                                <Box mb="md">
                                    <Text fw={600} fz="lg">Account Preferences</Text>
                                    <Text fz="sm" fw={400} c="dimmed">Adjust settings on your user account.</Text>
                                </Box>
                                <AccountSettingsAccountsForm 
                                    key={JSON.stringify(user)}
                                    userDetails={user}
                                    onEditUser={handleEditUser}
                                />
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>

                    <Tabs.Panel value="personnel" pl={isMobile ? 0 : 'md'} pt={isMobile ? 'md' : 0}>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 10, lg: 6 }}>
                                <Box mb="md">
                                    <Text fw={600} fz="lg">Security</Text>
                                    <Text fz="sm" fw={400} c="dimmed">Ensure your account is using a long, random password to stay secure.</Text>
                                </Box>
                                <AccountSettingSecurityForm 
                                    userDetails={user}
                                    onEditSecurity={handleEditSecurity}
                                />
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>
                </Tabs>
            </Grid.Col>
        </Grid>
        </>
    );
};

export default AccountSettingsPage;