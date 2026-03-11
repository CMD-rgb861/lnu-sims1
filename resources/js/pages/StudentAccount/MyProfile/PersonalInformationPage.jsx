import { useEffect, useState } from 'react';
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
  Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUser, IconSignature, IconAlertCircle, IconAlertTriangle, IconArrowBarToUp, IconSettings2 } from '@tabler/icons-react';

import axiosClient from '../../../api/axiosClient';
import { getDiceBearAvatar } from '../../../plugins/dicebear'; 
import { useAuth } from '../../../hooks/useAuth';
import PersonalInformationForm from '../../../components/Forms/StudentAccount/PersonalInformationForm';
import ChangeProfilePictureModal from '../../../components/Modals/StudentAccount/ChangeProfilePictureModal';
import ChangeAccountPasswordModal from '../../../components/Modals/StudentAccount/ChangeAccountPasswordModal';


const PersonalInformationPage = () => {
    // Breadcrumbs items
    const items = [
        { title: 'Home', href: '/dashboard' },
        { title: 'My Profile', href: '#' },
        { title: 'Personal Information', href: '# '}
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

    const [studentDetails, setStudentDetails] = useState(null); 
    const [studentProfilePic, setStudentProfilePic] = useState(null); 
    const [studentSignature, setStudentSignature] = useState(null); 
    const [dropdownData, setDropdownData] = useState({
        nationalities: [],
        regions: [],
        provinces: [],
        municipalities: [],
        barangays: []
    });

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSignature, setShowSignature] = useState(false);

    const [pictureModalOpened, { open: openPictureModal, close: closePictureModal }] = useDisclosure(false);
    const [passwordModalOpened, { open: openPasswordModal, close: closePasswordModal }] = useDisclosure(false);

    const STORAGE_URL = import.meta.env.VITE_API_BASE_URL 
        ? `${import.meta.env.VITE_API_BASE_URL}/storage/` 
        : 'http://localhost:8000/storage/';

    const refetchData = async () => {
        try {
            const [studentDetailsReponse, nationalitiesResponse] = await Promise.all([
            axiosClient.get(`api/mp/fetch/student-details/${user.id}`),
            ]);
            setStudentDetails(studentDetailsReponse.data);
            setStudentProfilePic(studentDetailsReponse.data.studentProfile.profile_pic);
            setStudentSignature(studentDetailsReponse.data.studentProfile.e_signature);
            setDropdownData({
            nationalities: studentDetailsReponse.data.nationalities || [],
            regions: studentDetailsReponse.data.regions || [],
            provinces: studentDetailsReponse.data.provinces || [],
            municipalities: studentDetailsReponse.data.municipalities || [],
            barangays: studentDetailsReponse.data.barangays || []
            });
        } catch (error) {
        console.error("Failed to refetch data:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        try {
            const [studentDetailsReponse] = await Promise.all([
            axiosClient.get(`api/mp/fetch/student-details/${user.id}`),
            ]);
            setStudentDetails(studentDetailsReponse.data);
            setStudentProfilePic(studentDetailsReponse.data.studentProfile.profile_pic);
            setStudentSignature(studentDetailsReponse.data.studentProfile.e_signature);
            setDropdownData({
            nationalities: studentDetailsReponse.data.nationalities || [],
            regions: studentDetailsReponse.data.regions || [],
            provinces: studentDetailsReponse.data.provinces || [],
            municipalities: studentDetailsReponse.data.municipalities || [],
            barangays: studentDetailsReponse.data.barangays || []
            });
        } catch (error) {
            console.error("Failed to refetch data:", error);
        } finally {
            setLoading(false);
        }
        };
        fetchData();
    }, []);

    const handleUpdatePersonalInfo = async (values) => {
        setIsSubmitting(true);
        setLoading(true);
        try {
        const payload = { 
            ...values
        };
        await axiosClient.put(`api/mp/update-personal-info`, payload);
        await refetchData();
        } catch (error) {
        //
        } finally {
        setIsSubmitting(false);
        setLoading(false);
        }
    };

    // Handle uploading of profile picture and e-signature
    const handlePictureUpload = async (files) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            formData.append('id', user.id);
            
            if (files.profile_pic) {
            formData.append('profile_pic', files.profile_pic);
            }
            if (files.e_signature) {
            formData.append('e_signature', files.e_signature);
            }

            await axiosClient.post(`api/mp/upload-pictures`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            await refetchData(); 
            closePictureModal(); 
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle update of account password
    const handlePasswordSubmit = async (passwordData) => {
        setIsSubmitting(true);
        try {
        // passwordData contains: current_password, new_password, new_password_confirmation
        const response = await axiosClient.put('/api/mp/change-password', {
            id: studentId,
            ...passwordData
        });
        
        console.log('Password updated successfully');
        setOpened(false); // Close modal on success
        
        // Show success toast/notification here

        } catch (error) {
        console.error('Failed to update password', error.response?.data);
        // Show error toast/notification here based on Laravel validation errors
        } finally {
        setIsSubmitting(false);
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
                Personal Information
            </Title>
            <Text fz="xs" fw={400} mb="lg" c="dimmed">Manage your personal information for student profiling.</Text>
            
            <Grid>
                <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                    <Paper withBorder radius="lg" p="lg">
                        <Skeleton height={120} circle mx="auto" mb="md" />
                        <Skeleton height={20} radius="md" mx="auto" mb="md" />
                        <Skeleton height={15} width="70%" radius="md" mx="auto" mb="md" />
                        <Skeleton height={15} width="40%" radius="md" mx="auto" mb="lg" />
                        <Divider my="md" />
                        <Box>
                            <Group justify="space-between" mb="sm">
                                <Group gap="xs">
                                    <IconSignature size={18} />
                                    <Text fw={600} fz="sm" ls={-0.5}>E-Signature</Text>
                                </Group>
                                <Switch
                                    label="Show"
                                    labelPosition="left"
                                    checked={showSignature}
                                    onChange={(event) => setShowSignature(event.currentTarget.checked)}
                                    size="xs"
                                />
                            </Group>

                            <Box 
                                ta="center" 
                                h={150} 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Skeleton height={15} width="40%" radius="md" mx="auto" />
                            </Box>
                        </Box>

                        <Divider my="md" />
                        <Skeleton height={20} radius="md" mx="auto" mb="md" />
                        <Skeleton height={20} radius="md" mx="auto" mb="md" />
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
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
            <ChangeProfilePictureModal 
                opened={pictureModalOpened}
                onClose={closePictureModal}
                onSubmit={handlePictureUpload}
                isSubmitting={isSubmitting}
                currentAvatar={user.avatar || dicebearUrl}
                currentSignature={studentDetails?.e_signature ? `${STORAGE_URL}${studentDetails.e_signature}` : null}
            />
            <ChangeAccountPasswordModal
                opened={passwordModalOpened}
                onClose={closePasswordModal}
                onSubmit={handlePasswordSubmit}
                isSubmitting={isSubmitting}
            />
            <Grid>
                <Grid.Col span={12}>
                    <Breadcrumbs separator=">" mb="md" fw={400}>{items}</Breadcrumbs>
                    <Divider mb="lg" />
                    <Title align="left" order={2} mb={4} fw={600} fz={20}>
                    Personal Information
                    </Title>
                    <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage your personal information for student profiling.</Text>

                    <Grid>
                        {/* Student Profile Column */}
                        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                            <Paper withBorder p="xl" radius="lg">
                                <Stack align="center" gap="xs">
                                    <Avatar
                                        src={`${STORAGE_URL}${studentProfilePic}` || dicebearUrl}
                                        size={120}
                                        radius={120}
                                        mx="auto"
                                    >
                                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                    </Avatar>

                                    <Box ta="center" mt="sm" mb="sm">
                                        <Text fw={700} fz="xl">
                                            {user?.first_name} {user?.middle_name} {user?.last_name}
                                        </Text>
                                        <Text c="dimmed" fz="sm" mt={4}>
                                            {user?.email_address}
                                        </Text>
                                        <Group justify="center" mt={8}>
                                            <Badge leftSection={<IconUser size={14} />} justify="center" size="lg" variant='light' c="gray">
                                                <Text fw={500} fz="sm">
                                                    {user?.id_number}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Box>
                                </Stack>

                                <Divider my="md" />

                                {/* E-Signature Section */}
                                <Box>
                                    <Group justify="space-between" mb="sm">
                                        <Group gap="xs">
                                            <IconSignature size={18} />
                                            <Text fw={600} fz="sm" ls={-0.5}>E-Signature</Text>
                                        </Group>
                                        <Switch
                                            label="Show"
                                            labelPosition="left"
                                            checked={showSignature}
                                            onChange={(event) => setShowSignature(event.currentTarget.checked)}
                                            size="xs"
                                        />
                                    </Group>

                                    <Box 
                                        ta="center" 
                                        h={150} 
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {showSignature ? (
                                            studentSignature ? (
                                                <Image
                                                    src={`${STORAGE_URL}${studentSignature}`}
                                                    alt="E-Signature"
                                                    h={150}
                                                    w={250}
                                                    fit="contain"
                                                    fallbackSrc="https://placehold.co/250x150?text=Error+Loading+Signature"
                                                />
                                            ) : (
                                                <Group justify="center" gap="xs">
                                                    <IconAlertTriangle size={16} color="red" />
                                                    <Text fz="xs" c="red">
                                                        No E-Signature Uploaded
                                                    </Text>
                                                </Group>
                                            )
                                        ) : (
                                            <Group justify="center" gap="xs">
                                                <IconAlertCircle size={16} color="gray" />
                                                <Text fz="xs" c="dimmed">
                                                    E-Signature is hidden for privacy
                                                </Text>
                                            </Group>
                                        )}
                                    </Box>
                                </Box>

                                <Divider my="md" />

                                <Stack gap="sm">
                                    <Button 
                                        leftSection={<IconArrowBarToUp size={17} />}
                                        variant="light"
                                        color="blue" 
                                        size="sm"
                                        fullWidth 
                                        onClick={openPictureModal}
                                    >
                                        <Text fz="xs" fw={600}>Change Picture/E-Signature</Text>
                                    </Button>
                                    <Button 
                                        leftSection={<IconSettings2 size={17} />}
                                        variant="light"
                                        color="blue" 
                                        fullWidth
                                        onClick={openPasswordModal}
                                    >
                                        <Text fz="xs" fw={600}>Change Account Password</Text>
                                    </Button>
                                </Stack>
                            </Paper>
                        </Grid.Col>

                        {/* Personal Information Fields Column */}
                        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                            <Paper withBorder p="lg" radius="lg">
                                <Text fz="md" fw={600}>Personal Information</Text>
                                <PersonalInformationForm
                                    userDetails={studentDetails}
                                    dropdownData={dropdownData}
                                    onSubmit={handleUpdatePersonalInfo}
                                    isSubmitting={isSubmitting}
                                />
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            </Grid>
        </>
    );
};

export default PersonalInformationPage;