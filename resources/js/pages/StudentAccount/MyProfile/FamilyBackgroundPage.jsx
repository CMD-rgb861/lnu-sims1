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
                Family Background
            </Title>
            <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage your family background for student profiling.</Text>
            
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
                    <Title align="left" order={2} mb={4} fw={600} fz={20}>
                    Family Background
                    </Title>
                    <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage your family background for student profiling.</Text>

                    {/* Educational Background Fields */}
                    <Grid>
                        <Grid.Col span={12}>
                            <Paper withBorder radius="lg" p="lg">
                                <Text fz="md" fw={600}>Immediate Family Members</Text>
                            </Paper>
                        </Grid.Col>
                    </Grid>
        
                </Grid.Col>
            </Grid>
        </>
    );
};

export default FamilyBackgroundPage;