import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
    Title,
    Breadcrumbs,
    Anchor,
    Grid,
    Paper,
    Text,
    Divider,
    Timeline,
    LoadingOverlay,
    Skeleton,
    Center,
    Alert,
    Stack
} from '@mantine/core';
import { 
    IconCheck, 
    IconLoader2, 
    IconCircleDotted,
    IconAlertCircle
} from '@tabler/icons-react';

import { useAuth } from '../../../hooks/useAuth';
import axiosClient from '../../../api/axiosClient';

const StatusMonitoringPage = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const items = [
        { title: 'Home', href: '/dashboard' },
        { title: 'Pre-Enrollment', href: '#' },
        { title: 'Status Monitoring', href: '#' }
    ].map((item, index) => (
        <Anchor component={Link} to={item.href} key={index} fz={14} fw={400}>
            {item.title}
        </Anchor>
    ));

    const [loading, setLoading] = useState(true);
    const [steps, setSteps] = useState([]);

    useEffect(() => {
        const fetchStatusData = async () => {
            try {
                // Adjust this route to match your new API endpoint
                const response = await axiosClient.get(`/api/pe/s/fetch/status-monitoring/${user.id}`);
                setSteps(response.data.steps || []);
            } catch (error) {
                console.error("Failed to fetch status data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user.id) {
            fetchStatusData();
        }
    }, [user.id]);

    // Helper for visuals
    const getStepVisuals = (status) => {
        switch (status) {
            case 'completed':
                return { color: 'green', icon: <IconCheck size={16} />, lineVariant: 'solid' };
            case 'active':
                return { color: 'blue', icon: <IconLoader2 size={16} />, lineVariant: 'dashed' };
            case 'pending':
            default:
                return { color: 'gray', icon: <IconCircleDotted size={16} />, lineVariant: 'dashed' };
        }
    };

    // Find active step index for the timeline drawing logic
    const activeIndex = steps.findIndex(step => step.status === 'active') !== -1 
        ? steps.findIndex(step => step.status === 'active') 
        : steps.length;

    if (loading) {
        return (
            <Grid>
                <Grid.Col span={12}>
                    <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                    <Divider mb="lg" />
                    <Title order={2} mb={4} fw={600} fz={20}>Status Monitoring</Title>
                    <Paper withBorder radius="lg" p="xl" mb="lg" mt="md">
                        <Title order={4} fw={700} mb="xl">Pre-Enrollment Process Tracking</Title>
                        
                        <Timeline 
                            bulletSize={36} 
                            lineWidth={3} 
                            color="gray.2" // Faint gray line to connect the skeletons
                        >
                            {[1, 2, 3, 4].map((item) => (
                                <Timeline.Item 
                                    key={item}
                                    // The Skeleton circle perfectly overrides the Timeline bullet
                                    bullet={<Skeleton height={34} width={34} circle />} 
                                    title={<Skeleton height={18} width={item % 2 === 0 ? "40%" : "50%"} radius="xl" />}
                                    lineVariant="dashed" // Keeps the skeleton wireframe look
                                >
                                    <Skeleton height={14} width={item % 2 === 0 ? "60%" : "70%"} mt={8} radius="xl" />
                                    <Skeleton height={12} width="30%" mt={8} radius="xl" />
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Paper>
                </Grid.Col>
            </Grid>
        );
    }

    return (
        <Grid>
            <Grid.Col span={12}>
                <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                <Divider mb="lg" />
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                
                <Title align="left" order={2} mb={4} fw={600} fz={20}>
                    Status Monitoring
                </Title>
                <Text fz="xs" fw={500} mb="lg" c="dimmed">
                    Track the current progress of the pre-enrollment process.
                </Text>

                <Paper withBorder radius="lg" p="xl" mb="lg">
                    <Title order={4} fw={700} mb="xl">Pre-Enrollment Process Tracking</Title>
                    
                    {steps.length === 0 ? (
                        <Center style={{ height: '20vh' }}>
                            <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light" radius="lg">
                                <Text fz="sm">No active pre-enrollment data found for this school year.</Text>
                            </Alert>
                        </Center>
                    ) : (
                        <Timeline 
                            active={activeIndex} 
                            bulletSize={36} 
                            lineWidth={3}
                            color="blue"
                        >
                            {steps.map((step, index) => {
                                const visuals = getStepVisuals(step.status);
                                
                                return (
                                    <Timeline.Item 
                                        key={index}
                                        title={<Text fw={700} fz="md" c={step.status === 'pending' ? 'dimmed' : ''}>{step.title}</Text>}
                                        bullet={visuals.icon}
                                        color={visuals.color}
                                        lineVariant={visuals.lineVariant}
                                    >
                                        <Text 
                                            size="sm" 
                                            mt={4} 
                                            fw={step.status === 'active' ? 600 : 400} 
                                            c={step.status === 'active' ? 'blue' : 'dimmed'}
                                        >
                                            {step.subtitle}
                                        </Text>
                                        
                                        {/* Will only render if date is not null */}
                                        {step.date && (
                                            <Text size="xs" mt={4} fw={500} c="dimmed">
                                                {step.date}
                                            </Text>
                                        )}
                                    </Timeline.Item>
                                );
                            })}
                        </Timeline>
                    )}
                </Paper>
            </Grid.Col>
        </Grid>
    );
};

export default StatusMonitoringPage;