import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Stack, Text, Box, Center, Group, Button, Divider, ScrollArea, Paper, useMantineTheme, useComputedColorScheme, Loader, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { IconBell, IconCheck, IconChecks, IconEyeCheck } from '@tabler/icons-react';

import axiosClient from '../../../api/axiosClient';
import { setUnreadCount } from '../../../store/slices/NotificationSlice';

const NotificationsModal = ({ opened, onClose }) => {
    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme('light');
    const dispatch = useDispatch();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/api/n/data');
            setNotifications(res.data.notifications);
            dispatch(setUnreadCount(res.data.unread_count));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const unreadNotifications = notifications.filter(n => n.read_at === null);
    const readNotifications = notifications.filter(n => n.read_at !== null);

    const renderNotification = (n, isUnread) => {
        const unreadBg = computedColorScheme === 'dark' 
            ? theme.colors.green[9] 
            : theme.colors.green[0];

        const unreadText = computedColorScheme === 'dark'
            ? theme.colors.green[2]
            : theme.colors.green[9];

        return (
            <Paper
                key={n.id}
                withBorder
                radius="md"
                p="md"
                bg={isUnread ? unreadBg : 'transparent'}
                style={{
                    borderColor: isUnread ? theme.colors.green[4] : undefined,
                    transition: 'all 0.2s ease',
                    position: 'relative' 
                }}
            >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Box style={{ flex: 1 }}>
                        <Text 
                            fw={isUnread ? 700 : 500} 
                            fz="sm" 
                            c={isUnread ? unreadText : 'var(--mantine-color-text)'}
                        >
                            {n.data?.title || 'Notification'}
                        </Text>

                        <Text 
                            fz={13} 
                            mt={4} 
                            c={isUnread ? unreadText : 'var(--mantine-color-text)'}
                            style={{ opacity: isUnread ? 0.9 : 1 }}
                        >
                            {n.data?.message || 'No description provided'}
                        </Text>
                    </Box>

                    {/* SHOW MARK AS READ BUTTON ONLY IF UNREAD */}
                    {isUnread && (
                        <Tooltip label="Mark as read" fz="xs" position="left" withArrow>
                            <ActionIcon 
                                variant="light" 
                                color="green" 
                                size="sm" 
                                radius="xl"
                                onClick={() => handleMarkAsRead(n.id)}
                            >
                                <IconEyeCheck size={18} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>

                <Text fz={12} mt={8} >
                    {n.created_at ? formatDistanceToNow(parseISO(n.created_at), { addSuffix: true }) : ''}
                </Text>
            </Paper>
        );
    };

    useEffect(() => {
        if (opened) fetchNotifications();
    }, [opened]);

    const markAllAsRead = async () => {
        try {
            await axiosClient.post('/api/n/mark-all-as-read');
            setLoading(true);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axiosClient.post(`/api/n/mark-as-read/${id}`);
            setLoading(true);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
            );
            dispatch(setUnreadCount(response.data.unread_count));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title="Notifications Panel" 
            size="lg"
            radius="md"
            centered
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <ScrollArea h={400}>
                {loading ? (
                    <Center py="xl"><Loader size="sm" /></Center>
                ) : (
                    <Stack gap="md" pr="xs">
                        {notifications.length === 0 ? (
                            <Text c="dimmed" ta="center" py="xl" fz="sm">No notifications yet.</Text>
                        ) : (
                            <>
                                {/* UNREAD SECTION */}
                                {unreadNotifications.length > 0 && (
                                    <Box>
                                        <Group>
                                            <Badge color="red" variant="filled" size="xs" circle>
                                                {unreadNotifications.length }
                                            </Badge>
                                            <Text fz="sm" fw="500">New Notifications</Text>
                                        </Group>
                                        <Divider mb="md" mt="xs"></Divider>
                                        <Stack gap="xs">
                                            {unreadNotifications.map(n => renderNotification(n, true))}
                                        </Stack>
                                        <Group justify="flex-end">
                                            <Button variant="subtle" size="xs" mt="lg" onClick={markAllAsRead} leftSection={<IconChecks size={14}/>}>
                                                Mark all as read
                                            </Button>
                                        </Group>
                                    </Box>
                                )}

                                {/* READ SECTION */}
                                {readNotifications.length > 0 && (
                                    <Box>
                                        <Text fz="sm" fw="500">Previous Notifications</Text>
                                        <Divider mb="md" mt="xs"></Divider>
                                        <Stack gap="xs">
                                            {readNotifications.map(n => renderNotification(n, false))}
                                        </Stack>
                                    </Box>
                                )}
                            </>
                        )}
                    </Stack>
                )}
            </ScrollArea>
        </Modal>
    );
};

export default NotificationsModal;