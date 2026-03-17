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
  LoadingOverlay,
  Alert,
  List
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconSignature, IconAlertCircle, IconAlertTriangle, IconArrowBarToUp, IconSettings2, IconDeviceFloppy, IconPlus } from '@tabler/icons-react';

import axiosClient from '../../../api/axiosClient';
import { getDiceBearAvatar } from '../../../plugins/dicebear'; 
import { useAuth } from '../../../hooks/useAuth';

import EducationalBackgroundForm from '../../../components/Forms/StudentAccount/EducationalBackgroundForm';
import FamilyBackgroundForm from '../../../components/Forms/StudentAccount/FamilyBackgroundForm';

const FamilyBackgroundPage = () => {
    // Breadcrumbs items
    const items = [
        { title: 'Home', href: '/dashboard' },
        { title: 'My Profile', href: '#' },
        { title: 'Family Background', href: '# '}
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

    const [familyRecords, setFamilyRecords] = useState([]);
    const [familyRelations, setFamilyRelations] = useState([]);

    const form = useForm({
        initialValues: {
            records: [
                { 
                    id: null, 
                    relation_id: '', 
                    is_guardian: false, 
                    first_name: '', 
                    middle_name: '', 
                    last_name: '', 
                    ext_name: '',
                    birthday: '',
                    contact_number: '',
                    email_address: '',
                    occupation: '',
                    employer: '',
                    employer_address: '',
                    employer_contact: ''
                }
            ],
        },
        validate: {
            records: {
                relation_id: (value) => (!value ? 'Relationship is required' : null),
                first_name: (value) => (!value ? 'School name is required' : null),
                last_name: (value) => (!value ? 'Start year is required' : null),
            }
        }
    });
    
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const refetchData = async () => {
        try {
            const targetId = user.id; 
            const [familyBackgroundResponse] = await Promise.all([
                axiosClient.get(`/api/mp/fetch/family-background/${targetId}`), 
            ]);

            const fetchedRecords = familyBackgroundResponse.data.records;

            if (fetchedRecords.length > 0) {
                const formattedRecords = fetchedRecords.map(record => ({
                    ...record,
                    relation_id: record.relation_id ? String(record.relation_id) : '',
                }));
                form.setValues({ records: formattedRecords });
            } else {
                form.setValues({ records: [{
                    id: null, relation_id: '', first_name: 'N/A', middle_name: '',
                    last_name: 'N/A', ext_name: 'N/A', birthday: '', contact_number: '', 
                    email_address: 'N/A', occupation: 'N/A', employer: 'N/A', employer_address: 'N/A',
                    employer_contact: 'N/A', is_guardian: 0
                }]});
            }
            setFamilyRelations(familyBackgroundResponse.data.relations);
        } catch (error) {
            console.error("Failed to refetch data:", error);
        }
    };

    useEffect(() => {
        const fetchEducationalData = async () => {
            try {
            const targetId = user.id; 
                const [familyBackgroundResponse] = await Promise.all([
                    axiosClient.get(`/api/mp/fetch/family-background/${targetId}`), 
                ]);

                const fetchedRecords = familyBackgroundResponse.data.records;

                if (fetchedRecords.length > 0) {
                    const formattedRecords = fetchedRecords.map(record => ({
                        ...record,
                        relation_id: record.relation_id ? String(record.relation_id) : '',
                    }));
                    form.setValues({ records: formattedRecords });
                } else {
                    form.setValues({ records: [{
                        id: null, relation_id: '', first_name: 'N/A', middle_name: '',
                        last_name: 'N/A', ext_name: 'N/A', birthday: '', contact_number: '', 
                        email_address: 'N/A', occupation: 'N/A', employer: 'N/A', employer_address: 'N/A',
                        employer_contact: 'N/A', is_guardian: 0
                    }]});
                }
                setFamilyRelations(familyBackgroundResponse.data.relations);
            } catch (error) {
                console.error("Error fetching family background:", error);
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
        setFamilyRecords(updatedRecords);
    };

    const handleAddRecord = () => {
        form.insertListItem('records', {
            id: null, relation_id: '', first_name: 'N/A', middle_name: '',
            last_name: 'N/A', ext_name: 'N/A', birthday: '', contact_number: '', 
            email_address: 'N/A', occupation: 'N/A', employer: 'N/A', employer_address: 'N/A',
            employer_contact: 'N/A', is_guardian: 0
        });
       
    };

    const handleRemoveRecord = async (index, recordId) => {
        if (recordId) {
            try {
                setLoading(true);
                await axiosClient.delete(`/api/mp/delete-fam-background/${recordId}`);
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
            await axiosClient.put(`/api/mp/update-fam-background/${id}`, {
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
                    Family Background
                </Title>
                <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage your family background for student profiling.</Text>
                
                <Grid>
                    <Grid.Col span={12}>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Paper withBorder radius="lg" p="lg" mb="lg">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} height={40} mb="md" radius="md" />
                                ))}
                            </Paper>
                        ))}
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
                        Family Background
                    </Title>
                    <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage your family background for student profiling.</Text>
                    <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        title="Instructions:" 
                        color="gray" 
                        variant="light" 
                        mb="md"
                        radius="lg"
                        py="lg"
                    >
                        <List size="xs" spacing={5} mt={2}>
                            <List.Item>All fields marked with an asterisk (*) are required.</List.Item>
                            <List.Item>Click "Save Changes" to finalize your changes.</List.Item>
                        </List>
                    </Alert>
                    {/* Educational Background Fields */}
                    <Grid>
                        <Grid.Col span={12}>
                            <Text fz="md" fw={600} mb="md">Immediate Family Members</Text>
                            <Stack gap="lg">
                                {form.values.records?.map((record, index) => (
                                    <FamilyBackgroundForm
                                        key={record.id || `new-${index}`} 
                                        index={index}
                                        form={form} 
                                        famRelations={familyRelations}
                                        onDelete={handleRemoveRecord}
                                    />
                                ))}

                                {/* Buttons to Add More or Save */}
                                <Group justify="right" mt="md" mb="xl">
                                <Button 
                                    variant="light" 
                                    color="gray"
                                    fz="xs"
                                    onClick={handleAddRecord} 
                                >
                                    Add Another Member
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
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            </Grid>
        </>
    );
};

export default FamilyBackgroundPage;