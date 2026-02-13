import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/AuthSlice';

import {
  AppShell,
  Box,
  Group,
  Text,
  UnstyledButton,
  Avatar,
  Menu,
} from '@mantine/core';
import {
  IconLogout,
  IconChevronRight,
  IconUser,
} from '@tabler/icons-react';

import { getDiceBearAvatar } from '../../plugins/dicebear'; 
import './SidebarFooterComponent.css';

export const SidebarFooterComponent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  if (!user) {
    return null; 
  }

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logoutUser());
  };
  
  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();

  const dicebearUrl = getDiceBearAvatar(fullName, 'initials');

  return (
    <AppShell.Section className="footer" mb={10}>
      {user && (
        <Box>
          <Menu shadow="md" width={230} position="top-end">
            <Menu.Target>
              <UnstyledButton
                sx={(theme) => ({
                  display: 'block',
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.radius.sm,
                })}
              >
                <Group gap="md">
                  <Avatar
                    src={user.avatar || dicebearUrl}
                    alt={fullName || 'User'}
                    radius="xl"
                    size="md"
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Text className="profile-name" size="xs" fw={700} fz="xs">
                      {fullName || 'User'}
                    </Text>
                    <Text c="dimmed" size="xs" fw={500}>
                      {user.id_number || '--'}
                    </Text>
                  </Box>

                  <IconChevronRight size={16} color="gray" />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Menu</Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={16} />}
                onClick={() => console.log('Go to settings')}
              >
                My Profile
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      )}
    </AppShell.Section>
  );
};

export default SidebarFooterComponent;