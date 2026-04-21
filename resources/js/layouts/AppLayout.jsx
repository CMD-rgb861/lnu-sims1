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
    const [opened, { toggle, close }] = useDisclosure();
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
            px={20}
            header={{ height: 50 }}
            styles={{
                navbar: { zIndex: 300 },
                main: { position: 'relative', zIndex: 0 },
                header: { zIndex: 400 },
            }}
            navbar={{
                width: { sm: 250, lg: 300 },
                breakpoint: 'lg',
                collapsed: { mobile: !opened}, 
            }}
        >
        <AppShell.Header>
            <Group justify="space-between" align="center" h="100%" px="sm" wrap="nowrap">
                <Group wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="lg"
                        size="sm"
                    />
                    <Group wrap="nowrap" gap="xs" style={{ overflow: 'hidden' }}>
                        <HeaderLogoComponent />
                        <Code fw={500}>v{version}</Code>
                    </Group>
                </Group>
                <ColorSchemeToggleComponent />
            </Group>
        </AppShell.Header>

        {renderSidebar()}

        <AppShell.Main 
            pt={80} 
            onClick={() => {
                if (opened) close();
            }}
        >
            <Outlet />
        </AppShell.Main>
        </AppShell>
    );
};

export default AppLayout;