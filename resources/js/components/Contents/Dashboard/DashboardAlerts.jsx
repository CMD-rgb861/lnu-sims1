import { useState, useEffect } from 'react';
import { Alert, Stack, Transition, Box, Text } from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle, IconAlertCircle, IconCheck } from '@tabler/icons-react';

const DashboardAlerts = ({ alerts }) => {
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dismissed_announcements');
    if (saved) setDismissedIds(JSON.parse(saved));
  }, []);

  const handleDismiss = (id) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem('dismissed_announcements', JSON.stringify(updated));
  };

  const getStyles = (category) => {
    switch (category) {
      case 4: return { color: 'red', icon: <IconAlertTriangle size={18} /> };    // Urgent
      case 3: return { color: 'orange', icon: <IconInfoCircle size={18} /> };  // Warning
      case 2: return { color: 'teal', icon: <IconCheck size={18} /> };         // Success
      default: return { color: 'blue', icon: <IconInfoCircle size={18} /> };    // Info
    }
  };

  // Filter out alerts the user has already dismissed
  const visibleAnnouncements = alerts.filter(a => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <Stack gap="md" mb="xl">
      {visibleAnnouncements.map((item) => {
        const { color, icon } = getStyles(item.category);
        
        return (
          <Alert
            key={item.id}
            variant="light"
            color={color}
            title={item.title}
            icon={icon}
            withCloseButton={item.is_dismissible} // If false, close button is hidden
            onClose={() => handleDismiss(item.id)}
            radius="md"
            styles={{
                title: { fontWeight: 700 }
            }}
          >
            <Text fz="xs">{item.message}</Text>
          </Alert>
        );
      })}
    </Stack>
  );
};

export default DashboardAlerts;