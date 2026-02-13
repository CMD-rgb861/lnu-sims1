import { AppShell, Burger, Group, Image, Code, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks'; 
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ColorSchemeToggleComponent from '../components/ColorScheme/ColorSchemeComponent';
import HeaderLogoComponent from '../components/HeaderLogo/HeaderLogoComponent';
import StudentSidebarComponent from '../components/Sidebar/StudentSidebarComponent';
import EmployeeSidebarComponent from '../components/Sidebar/EmployeeSidebarComponent';

const AppLayout = () => {
    const theme = useMantineTheme();
    const [opened, { toggle }] = useDisclosure(); 
    const version = import.meta.env.VITE_APP_VERSION;

    const { user_type } = useSelector((state) => state.auth);

    const renderSidebar = () => {
        if (user_type === 'Student') {
            return <StudentSidebarComponent />;
        }
            return <EmployeeSidebarComponent />;
    };

    return (
        <AppShell
        py={30}
        px={20}
        header={{ height: 50 }}
        navbar={{
            width: { sm: 250, lg: 300 },
            breakpoint: 'md',
            collapsed: { mobile: !opened }, 
        }}
        >
        <AppShell.Header>
            <Group 
                justify="space-between"
                p="sm"
            >
                <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="md"
                size="xs"
                />
                <Group>
                <HeaderLogoComponent />
                <Code fw={500}>v{version}</Code>
                </Group>
                <ColorSchemeToggleComponent />
            </Group>
        </AppShell.Header>

        {renderSidebar()}

        <AppShell.Main>
            <Outlet />
        </AppShell.Main>
        </AppShell>
    );
};

export default AppLayout;