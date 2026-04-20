import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import {
  AppShell,
  NavLink,
  ScrollArea,
  Text,
  Avatar,
  Stack,
  Skeleton,
  Divider,
  Badge // Added Badge
} from '@mantine/core';
import {
  IconLayoutBoard,
  IconUserCog,
  IconUserCircle,
  IconSchool,
  IconChalkboardTeacher,
  IconHelp,
  IconBell // Added IconBell
} from '@tabler/icons-react';
import axiosClient from '../../api/axiosClient'; 
import { SidebarFooterComponent } from './SidebarFooterComponent';

import './SidebarComponent.css';
import NotificationsModal from '../Modals/Notifications/NotificationsModal';
import { setUnreadCount } from '../../store/slices/NotificationSlice';

const sidebarLinks = [
  { label: 'Dashboard', icon: IconLayoutBoard, link: '/dashboard' },
  {
    label: 'My Profile',
    icon: IconUserCircle,
    initiallyOpened: false,
    links: [
      { label: 'Personal Information', link: '/mp/personal-information' },
      { label: 'Educational Background', link: '/mp/educational-background' },
      { label: 'Family Background', link: '/mp/family-background' },
    ],
  },
  {
    label: 'Pre-Enrollment',
    icon: IconSchool,
    initiallyOpened: false,
    links: [
      { label: 'Pre-Enrollment Records', link: '/pe/records' },
      { label: 'Status Monitoring', link: '/pe/status-monitoring' },
      { label: 'Advised Subjects', link: '/pe/advised-subjects' },
      { label: 'Enrollment Schedule', link: '/pe/enrollment-schedule' },
    ],
  },
  { label: 'Grades', icon: IconChalkboardTeacher, link: '/g/view' },
  { label: 'Evaluation', icon: IconChalkboardTeacher, link: '/eval/view' },
  { type: 'divider', label: 'Additional Settings' },
  { label: 'Account Settings', icon: IconUserCog, link: '/as' },
  { label: 'Help', icon: IconHelp, link: '/us' },
];

const StudentSidebarComponent = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notifications);

  // Open evaluations count (for sidebar badge dot)
  const [openEvalCount, setOpenEvalCount] = useState(0);

  // 1. Notification State
  const [notifOpened, setNotifOpened] = useState(false);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const response = await axiosClient.get('/api/n/data');
                dispatch(setUnreadCount(response.data.unread_count)); 
            } catch (error) {
                console.error("Failed to fetch notification count", error);
            }
        };
        fetchCount();
    }, []);

  // Fetch open evaluations count for sidebar dot
  const fetchOpenEvaluations = async () => {
    try {
      const res = await axiosClient.get('/api/eval/fetch/enrollments', { params: { term: 'current' } });
      const payload = res?.data || {};
      const enrollments = Array.isArray(payload.enrollments) ? payload.enrollments : (payload || []);
      const count = enrollments.filter(e => (e.is_available ?? false) && !(e.is_submitted ?? false)).length;
      setOpenEvalCount(count);
    } catch (err) {
      console.warn('Failed to fetch open evaluations count', err);
      setOpenEvalCount(0);
    }
  };

  useEffect(() => {
    fetchOpenEvaluations();

    // Listen for evaluation submissions from other pages and refresh the count
    const handler = () => fetchOpenEvaluations();
    window.addEventListener('eval:updated', handler);
    return () => window.removeEventListener('eval:updated', handler);
  }, []);

  const links = sidebarLinks.map((item, index) => {
    if (item.type === 'divider') {
      return <Divider size="xs" my="sm" key={`divider-${index}`} label={item.label} labelPosition="left" />;
    }

    const IconComponent = item.icon;

    if (item.links) {
      const visibleChildLinks = item.links.filter(childLink => {
        if (!childLink.permission) return true;
        return permissions[childLink.permission]?.can_read;
      });

      if (visibleChildLinks.length === 0) return null;

      const isChildActive = visibleChildLinks.some((link) => link.link === pathname);

      return (
        <NavLink
          key={item.label}
          label={item.label}
          leftSection={<IconComponent size={16} />}
          childrenOffset={28}
          defaultOpened={item.initiallyOpened || isChildActive}
        >
          {visibleChildLinks.map((link) => (
            <NavLink
              key={link.label}
              label={link.label}
              component={Link}
              to={link.link}
              active={pathname === link.link}
            />
          ))}
        </NavLink>
      );
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
        rightSection={
          // show small red dot for Evaluation when there are open items
          item.label === 'Evaluation' && openEvalCount > 0 ? (
            <span className="nav-badge-dot" aria-label={`${openEvalCount} open evaluations`} />
          ) : null
        }
      />
    );
  });

  return (
    <AppShell.Navbar className="navbar">
      <AppShell.Section className="links" grow component={ScrollArea} mx="-xs">
        {links}

        {/* 3. Manual Notification NavLink */}
        <NavLink
          label="Notifications"
          leftSection={<IconBell size={16} />}
          onClick={() => setNotifOpened(true)}
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

      {/* 4. Notification Modal */}
      <NotificationsModal 
        opened={notifOpened} 
        onClose={() => setNotifOpened(false)} 
      />
    </AppShell.Navbar>
  );
};

export default StudentSidebarComponent;