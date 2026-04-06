import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import {
  AppShell,
  NavLink,
  ScrollArea,
  Text,
  Badge, // Added
  Divider
} from '@mantine/core';
import {
  IconLayoutBoard,
  IconUserCog,
  IconUsersGroup,
  IconCalendarCog,
  IconBooks,
  IconSettings2,
  IconSchool,
  IconChalkboardTeacher,
  IconDeviceAnalytics,
  IconClipboardText,
  IconLogs,
  IconHelp,
  IconBell // Added
} from '@tabler/icons-react';

import axiosClient from '../../api/axiosClient'; // Ensure this is imported
import { SidebarFooterComponent } from './SidebarFooterComponent';

import './SidebarComponent.css';
import NotificationsModal from '../Modals/Notifications/NotificationsModal';

const sidebarLinks = [
  { label: 'Dashboard', icon: IconLayoutBoard, link: '/dashboard' },
  // ... (Keep your existing sidebarLinks array)
  { label: 'Reports', icon: IconClipboardText, link: '/al' },
  { type: 'divider', label: 'Additional Settings' },
  // We will insert Notifications dynamically in the render logic
  { label: 'Account Settings', icon: IconUserCog, link: '/us' },
  { label: 'System Logs', icon: IconLogs, link: '/us' },
  { label: 'Help', icon: IconHelp, link: '/us' },
];

const EmployeeSidebarComponent = () => {
  const { pathname } = useLocation();

  // 1. Move state INSIDE the component
  const [notifOpened, setNotifOpened] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 2. Move useEffect INSIDE the component
  useEffect(() => {
    const getCount = async () => {
      try {
        const res = await axiosClient.get('/api/notifications');
        setUnreadCount(res.data.unread_count);
      } catch (error) {
        console.error("Could not fetch notifications count", error);
      }
    };
    getCount();
  }, []);

  const links = sidebarLinks.map((item, index) => {
    if (item.type === 'divider') {
      return <Divider size="xs" my="sm" key={`divider-${index}`} label={item.label} labelPosition="left" />;
    }

    const IconComponent = item.icon;

    if (item.links) {
      // ... (Keep your existing nested links logic)
    }

    const isPublic = !item.permission;
    if (!isPublic) return null;

    return (
      <NavLink
        key={item.label}
        label={item.label}
        leftSection={<IconComponent size={16} />}
        component={Link}
        to={item.link || '/'}
        active={pathname === item.link}
      />
    );
  });

  return (
    <AppShell.Navbar className="navbar">
      <AppShell.Section className="links" grow component={ScrollArea} mx="-xs">
        {/* Render the standard links */}
        {links}

        {/* 3. Insert the Notifications NavLink manually at the end of the list */}
        <NavLink
          label="Notifications"
          leftSection={<IconBell size={16} />}
          onClick={() => setNotifOpened(true)} // Opens the modal
          rightSection={
            unreadCount > 0 && (
              <Badge color="red" variant="filled" size="xs" circle>
                {unreadCount}
              </Badge>
            )
          }
        />
      </AppShell.Section>

      <AppShell.Section>
        <SidebarFooterComponent />
      </AppShell.Section>

      {/* 4. Add the Notification Modal component here */}
      <NotificationsModal 
        opened={notifOpened} 
        onClose={() => setNotifOpened(false)} 
      />
    </AppShell.Navbar>
  );
};

export default EmployeeSidebarComponent;