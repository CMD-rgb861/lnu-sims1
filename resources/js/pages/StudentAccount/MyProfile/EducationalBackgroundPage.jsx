import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Title,
  Breadcrumbs,
  Anchor,
  Grid,
  Paper,
  Skeleton,
  Text,
  Divider,
  Avatar,
  Stack,
  Box,
  Group,
  Switch,
  Image,
  Button,
  Badge,
  LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconSignature, IconAlertCircle, IconAlertTriangle, IconArrowBarToUp, IconSettings2, IconDeviceFloppy, IconPlus } from '@tabler/icons-react';

import axiosClient from '../../../api/axiosClient';
import { getDiceBearAvatar } from '../../../plugins/dicebear'; 
import { useAuth } from '../../../hooks/useAuth';

import EducationalBackgroundForm from '../../../components/Forms/StudentAccount/EducationalBackgroundForm';

const EducationalBackgroundPage = () => {
    // Breadcrumbs items
    const items = [
        { title: 'Home', href: '/dashboard' },
        { title: 'My Profile', href: '#' },
        { title: 'Educational Background', href: '# '}
    ].map((item, index) => (
        <Anchor href={item.href} key={index} fz={14} fw={400}>
        {item.title}
        </Anchor>
    ));

    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    const dicebearUrl = getDiceBearAvatar(fullName, 'initials');

    const [educationRecords, setEducationRecords] = useState([]);
    const [academicLevels, setAcademicLevels] = useState([]);
    const form = useForm({
        initialValues: {
            records: [
                { 
                    id: null, 
                    level_id: '', 
                    school_id: '', 
                    period_from: '', 
                    period_to: '', 
                    year_graduated: '', 
                    honors: '', 
                    degree: '', 
                    units_earned: '' 
                }
            ],
        },

        validate: {
            records: {
                level_id: (value) => (!value ? 'Academic level is required' : null),
                school_id: (value) => (!value ? 'School name is required' : null),
                period_from: (value) => (!value ? 'Start year is required' : null),
                period_to: (value) => (!value ? 'End year is required' : null),
                year_graduated: (value) => (!value ? 'Year graduated is required' : null),
            }
        }
    });
    
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const refetchData = async () => {
        try {
            const targetId = user.id; 
            const [educBackgroundResponse] = await Promise.all([
                axiosClient.get(`/api/mp/fetch/educ-background/${targetId}`), 
            ]);

            const fetchedRecords = educBackgroundResponse.data.records;

            if (fetchedRecords.length > 0) {
                const formattedRecords = fetchedRecords.map(record => ({
                    ...record,
                    level_id: record.level_id ? String(record.level_id) : '',
                    period_from: record.period_from ? String(record.period_from) : '',
                    period_to: record.period_to ? String(record.period_to) : '',
                    year_graduated: record.year_graduated ? String(record.year_graduated) : '',
                }));
                form.setValues({ records: formattedRecords });
            } else {
                form.setValues({ records: [{
                    id: null, level_id: '', school_id: '', period_from: '',
                    period_to: '', year_graduated: '', honors: 'N/A', 
                    degree: 'N/A', units_earned: ''
                }]});
            }
            setAcademicLevels(educBackgroundResponse.data.levels);
        } catch (error) {
            console.error("Failed to refetch data:", error);
        }
    };

    useEffect(() => {
        const fetchEducationalData = async () => {
            try {
                const targetId = user.id; 
                const [educBackgroundResponse] = await Promise.all([
                    axiosClient.get(`/api/mp/fetch/educ-background/${targetId}`), 
                ]);

                const fetchedRecords = educBackgroundResponse.data?.records || [];
                const fetchedLevels = educBackgroundResponse.data?.levels || [];

                setAcademicLevels(fetchedLevels);

                if (fetchedRecords.length > 0) {
                    const formattedRecords = fetchedRecords.map(record => ({
                        ...record,
                        level_id: record.level_id ? String(record.level_id) : '',
                        school_id: record.school?.name ? record.school.name : (record.school_id ? String(record.school_id) : ''),
                        period_from: record.period_from ? String(record.period_from) : '',
                        period_to: record.period_to ? String(record.period_to) : '',
                        year_graduated: record.year_graduated ? String(record.year_graduated) : '',
                    }));
                    form.setValues({ records: formattedRecords });
                }
            } catch (error) {
                console.error("Error fetching educational background", error);
            } finally {
                setLoading(false);
            }
        };

        if (user.id) {
            fetchEducationalData();
        }
    }, [user.id]);


    const handleRecordChange = (index, field, value) => {
        const updatedRecords = [...educationRecords];
        updatedRecords[index][field] = value;
        setEducationRecords(updatedRecords);
    };

    const handleAddRecord = () => {
        form.insertListItem('records', {
            id: null, level_id: '', school_id: '', period_from: '',
            period_to: '', year_graduated: '', honors: 'N/A', 
            degree: 'N/A', units_earned: ''
        });
       
    };

    const handleRemoveRecord = async (index, recordId) => {
        if (recordId) {
            try {
                setLoading(true);
                await axiosClient.delete(`/api/mp/delete-educ-background/${recordId}`);
            } catch (error) {
                console.error("Failed to delete record", error);
                setLoading(false);
                return; 
            }
        }

        form.removeListItem('records', index);
        setLoading(false);
    };

    const handleSaveAll = async () => {
        const validation = form.validate();

        if (validation.hasErrors) {
            return; 
        }

        setIsSubmitting(true);
        const id = user.id

        try {
            await axiosClient.put(`/api/mp/update-educ-background/${id}`, {
                records: form.values.records
            });
            setLoading(true);
        } catch (error) {
            console.error("Failed to save records", error);
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Grid>
                <Grid.Col span={12}>
                <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">
                    {items}
                </Breadcrumbs>
                <Divider mb="lg" />
                <Title align="left" order={2} mb={4} fw={600} fz={20}>
                    Educational Background
                </Title>
                <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage your educational background for student profiling.</Text>
                
                <Grid>
                    <Grid.Col span={12}>
                        <Paper withBorder radius="lg" p="lg">
                            {Array.from({ length: 12 }).map((_, index) => (
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
                    <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                    <Title align="left" order={2} mb={4} fw={600} fz={20}>
                        Educational Background
                    </Title>
                    <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage your educational background for student profiling.</Text>
                    {/* Educational Background Fields */}
                    <Grid>
                        <Grid.Col span={12}>
                            <Paper withBorder radius="lg" p="lg">
                                <Text fz="md" fw={600} mb="md">Previously Attended Schools</Text>
                                <Stack gap="lg">
                                   {form.values.records?.map((record, index) => (
                                        <EducationalBackgroundForm
                                            key={record.id || `new-${index}`} 
                                            index={index}
                                            form={form} 
                                            academicLevels={academicLevels}
                                            onDelete={handleRemoveRecord}
                                        />
                                    ))}

                                    {/* Buttons to Add More or Save */}
                                    <Group justify="right" mt="md">
                                    <Button 
                                        variant="light" 
                                        color="gray"
                                        fz="xs"
                                        onClick={handleAddRecord} 
                                    >
                                        Add Another Level
                                    </Button>

                                    <Button 
                                        color="teal" 
                                        fz="xs"
                                        onClick={handleSaveAll} 
                                        loading={isSubmitting}
                                    >
                                        Save Changes
                                    </Button>
                                    </Group>
                                </Stack>
                            </Paper>
                        </Grid.Col>
                    </Grid>
        
                </Grid.Col>
            </Grid>
        </>
    );
};

export default EducationalBackgroundPage;