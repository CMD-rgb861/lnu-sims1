import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Text, Grid, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { fetchUser } from '../../store/slices/AuthSlice';
import { logoutUser } from '../../store/slices/AuthSlice';

import './DashboardPage.css';
import axiosClient from '../../api/axiosClient';
import StudentAccountContent from '../../components/Contents/Dashboard/StudentAccountContent';
import SuperadminContent from '../../components/Contents/Dashboard/SuperadminContent';
import ProfileUpdateModal from '../../components/Modals/StudentAccount/ProfileUpdateModal';
import SetPermanentPasswordModal from '../../components/Modals/Auth/SetPermanentPasswordModal';
import EnrollmentDetailsUpdateModal from '../../components/Modals/StudentAccount/EnrollmentDetailsUpdateModal';

const DashboardPage = () => {
    // 1. Move ALL hooks inside the component body
    const { user, user_type, user_role_level } = useSelector((state) => state.auth);
    const [programs, setPrograms] = useState([]);
    const [programLevels, setProgramLevels] = useState([]);

    const [profileUpdateModalOpened, { open: openProfileUpdateModal, close: closeProfileUpdateModal }] = useDisclosure(false);
    const [setPasswordModalOpened, { open: openSetPasswordModal, close: closeSetPasswordModal }] = useDisclosure(false);
    const [enrollmentUpdateModalOpened, { open: openEnrollmentUpdateModal, close: closeEnrollmentUpdateModal }] = useDisclosure(false);
    
    const dispatch = useDispatch();
    
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isStudent = user_type === 'Student';
    const isVerified = user?.profile_verified;
    const hasEnrollmentDetails = user?.has_active_enrollment;

    const fetchPrograms = async () => {
        try {
            const response = await axiosClient.get('/api/p/programs'); 
            setPrograms(response.data);
        } catch (error) {
            console.error("Failed to fetch programs:", error);
        }
    };

    const fetchProgramLevels = async () => {
        try {
            const response = await axiosClient.get('/api/p/program-levels'); 
            setProgramLevels(response.data);
        } catch (error) {
            console.error("Failed to fetch program levels:", error);
        }
    };

    useEffect(() => {
        if (!user) return;

        if (!isVerified) {
            openSetPasswordModal();
            return; 
        }
        
        if (isStudent && user.has_profile === false) {
            openProfileUpdateModal();
            closeEnrollmentUpdateModal(); 
            return; 
        } else {
            closeProfileUpdateModal();
        }

        if (isStudent && hasEnrollmentDetails === false) {
            fetchProgramLevels();
            fetchPrograms();
            openEnrollmentUpdateModal();
        } else {
            closeEnrollmentUpdateModal();
        }

    }, [
        user, 
        isVerified, 
        isStudent, 
        hasEnrollmentDetails, 
    ]);

    const handleVerifyAccount = async (values) => {
        setIsVerifying(true);
        try {
            await axiosClient.post('/api/auth/verify', values);
            await dispatch(fetchUser()).unwrap();
        } catch (error) {
            console.error("Verification failed", error);
        } finally {
            setIsVerifying(false);
            closeSetPasswordModal();
        }
    };

    const handleEnrollmentSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            await axiosClient.post('/api/pe/s/update-enrollment-details', values);
        } catch (error) {
            console.error("Failed to update enrollment details", error);
        } finally {
            setIsSubmitting(false);
            closeEnrollmentUpdateModal();
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        dispatch(logoutUser());
    };

    const renderDashboardContent = () => {

        if (user_type === 'Student') {
            return <StudentAccountContent />;
        }

        const primaryRole = user_role_level && user_role_level.length > 0 
        ? user_role_level[0].role_id
        : null;

        switch (primaryRole) {
            case 1: 
                return <SuperadminContent />;
            default:
                return <Text c="red" align="center" mt="xl">Access Restricted or Role Unknown.</Text>;
        }
    };

    // 3. Render your UI
    return (
        <Container fluid>
        <Grid align="center" mb="lg">
            <Text weight={600} size="xl">Dashboard</Text>
        </Grid>
        
        {renderDashboardContent()}

        {!isVerified && (
            <SetPermanentPasswordModal 
                opened={setPasswordModalOpened}
                onClose={closeSetPasswordModal}
                onSubmit={handleVerifyAccount}
                isSubmitting={isVerifying}
                onLogout={handleLogout}
            />
        )}

        {isStudent && (
            <>
                <ProfileUpdateModal 
                    user={user} 
                    opened={profileUpdateModalOpened}
                    onClose={closeProfileUpdateModal}
                />
                <EnrollmentDetailsUpdateModal
                    opened={enrollmentUpdateModalOpened}
                    onSubmit={handleEnrollmentSubmit}
                    isSubmitting={isSubmitting}
                    activeSchoolYear={user?.active_school_year}
                    previousEnrollment={null} 
                    programs={programs}
                    programLevels={programLevels}
                    onLogout={handleLogout}     
                />
            </>
        )}

        </Container>
    );
};

export default DashboardPage;