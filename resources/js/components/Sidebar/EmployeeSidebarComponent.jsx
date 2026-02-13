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
  Divider
} from '@mantine/core';
import {
  IconLayoutBoard,
  IconUserCog,
  IconUserCircle,
  IconSchool,
  IconChalkboardTeacher,
  IconHelp,
  IconUsersGroup,
  IconCalendarCog,
  IconBooks,
  IconDeviceAnalytics,
  IconClipboardText,
  IconLogs,
  IconSettings2
} from '@tabler/icons-react';
import { getDiceBearAvatar } from '../../plugins/dicebear'; 
import { SidebarFooterComponent } from './SidebarFooterComponent';

import './SidebarComponent.css'; 

const sidebarLinks = [

  { label: 'Dashboard', icon: IconLayoutBoard, link: '/dashboard'},
  {
    label: 'User Management',
    icon: IconUsersGroup,
    initiallyOpened: false,
    links: [
      { label: 'Employee Accounts', link: '/um/employees'},
      { label: 'Student Accounts', link: '/cr/profiling'},
    ],
  },
  {
    label: 'Schedule Management',
    icon: IconCalendarCog,
    initiallyOpened: false,
    links: [
      { label: 'School Year', link: '/cr/blotters'},
      { label: 'Enrollment Schedules', link: '/cr/profiling'},
    ],
  },
  {
    label: 'Curriculum Management',
    icon: IconBooks,
    initiallyOpened: false,
    links: [
      { label: 'Program Curriculums', link: '/cr/blotters'},
      { label: 'Course Catalog', link: '/cr/profiling'},
    ],
  },
  {
    label: 'System Management',
    icon: IconSettings2,
    initiallyOpened: false,
    links: [
      { label: 'User Types', link: '/cr/blotters'},
      { label: 'Colleges', link: '/cr/profiling'},
      { label: 'Departments', link: '/cr/profiling'},
      { label: 'Programs', link: '/cr/profiling'},
    ],
  },
  {
    label: 'Pre-Enrollment',
    icon: IconSchool,
    initiallyOpened: false,
    links: [
      { label: 'Process Enrollees', link: '/cr/blotters'},
      { label: 'Pre-Enrollment Logs', link: '/cr/profiling'},
    ],
  },
  {
    label: 'Student Advisement',
    icon: IconChalkboardTeacher,
    initiallyOpened: false,
    links: [
      { label: 'Assigned Programs', link: '/cr/blotters'},
      { label: 'Advised Students', link: '/cr/profiling'},
      { label: 'Advisement Logs', link: '/cr/profiling'},
    ],
  },
  { label: 'Analytics', icon: IconDeviceAnalytics, link: '/al'},
  { label: 'Reports', icon: IconClipboardText, link: '/al'},
  { type: 'divider', label: 'Additional Settings' },
  { label: 'Account Settings', icon: IconUserCog, link: '/us' },
  { label: 'System Logs', icon: IconLogs, link: '/us' },
  { label: 'Help', icon: IconHelp, link: '/us' },
];

const EmployeeSidebarComponent = () => {
  const { pathname } = useLocation(); 
  
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
  
        if (visibleChildLinks.length === 0) {
          return null;
        } 
  
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
      // const canView = permissions[item.permission]?.can_read;
  
      if (!isPublic) {
        return null; 
      }
  
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
          {links}
        </AppShell.Section>
  
        <AppShell.Section>
          <SidebarFooterComponent />
        </AppShell.Section>
      </AppShell.Navbar>
    );
};

export default EmployeeSidebarComponent;