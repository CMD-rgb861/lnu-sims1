import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Text, Grid, Container } from '@mantine/core';

import './DashboardPage.css';
import StudentAccountContent from '../../components/Contents/Dashboard/StudentAccountContent';
import SuperadminContent from '../../components/Contents/Dashboard/SuperadminContent';
import ProfileUpdateModal from '../../components/Modals/StudentAccount/ProfileUpdateModal';

const DashboardPage = () => {
  // 1. Move ALL hooks inside the component body
  const { user, user_type, user_role_level } = useSelector((state) => state.auth);
  const isStudent = user_type === 'Student';
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (isStudent && user && user.has_profile === false) {
      setShowProfileModal(true);
    }
  }, [isStudent, user]);

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

      {isStudent && (
        <ProfileUpdateModal 
          user={user} 
          opened={showProfileModal} 
        />
      )}
    </Container>
  );
};

export default DashboardPage;