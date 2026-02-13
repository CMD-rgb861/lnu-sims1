import './LoginPage.css';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  TextInput,
  PasswordInput,
  Button,
  Box,
  LoadingOverlay,
  Title,
  Paper,
  Image,
  Group,
  Text,
  Anchor,
  Flex,
  Stack,
  Center,
  Grid,
  ActionIcon
} from '@mantine/core';
import { IconArrowLeft, IconSchool, IconBriefcase } from '@tabler/icons-react';

import { loginEmployee, loginStudent } from '../../store/slices/AuthSlice';
import LogoComponent from '../../components/Logo/LogoComponent';
import ColorSchemeToggleComponent from '../../components/ColorScheme/ColorSchemeComponent';
import ItsoLogoComponent from '../../components/Logo/ItsoLogoComponent';

const LoginPage = () => {
  
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isAuthenticated, status } = useSelector((state) => state.auth);
    const isLoading = status === 'loading';

    const [userType, setUserType] = useState(null); 

    const [idNum, setIdNum] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        userType === 'student' 
        ? dispatch(loginStudent({ idNum, password }))
        : dispatch(loginEmployee({ idNum, password }));
    }

    const handleBack = () => {
        setUserType(null);
        setIdNum('');
        setPassword('');
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard'); 
        }
    }, [isAuthenticated, navigate]);

    return (
        <Center h="100vh" px="lg">
            <Paper 
                radius="xl" 
                withBorder 
                p={0} 
                maw={900} 
                w="100%"
                style={{ overflow: 'hidden' }} 
            >
                <Grid gutter={0}>
                    <Grid.Col span={{ base: 0, sm: 6 }} visibleFrom="sm">
                        <Box 
                            h="100%" 
                            style={{ 
                                backgroundImage: 'linear-gradient(135deg, #0056b3 0%, #00a8ff 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexDirection: 'column'
                            }}
                        >
                        </Box>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Box p={30} h="100%"> 
                                {!userType && (
                                    <Stack justify="center" h="100%">
                                        <Stack align="center" gap="xs">
                                            <LogoComponent />
                                            {/* Original Headers Preserved */}
                                            <Title order={3} fw={600} mt="lg" fz={25}>Account Login</Title>
                                            <Text c="dimmed" size="sm">Login to manage your SIMS Account</Text>
                                        </Stack>

                                        <Stack spacing="md" mt="sm" mb="sm">
                                            <Button 
                                                size="lg" 
                                                radius="xl" 
                                                variant="default"
                                                leftSection={<IconSchool size={22} color="#0056b3" />}
                                                onClick={() => setUserType('student')}
                                                style={{ height: '60px', fontSize: '1rem' }}
                                            >
                                                Login as Student
                                            </Button>
                                            <Button 
                                                size="lg" 
                                                radius="xl" 
                                                variant="default"
                                                leftSection={<IconBriefcase size={22} color="#0056b3" />}
                                                onClick={() => setUserType('employee')}
                                                style={{ height: '60px', fontSize: '1rem' }}
                                            >
                                                Login as Employee
                                            </Button>
                                        </Stack>

                                        <Flex align="center" justify="center" direction="column">    
                                            <ItsoLogoComponent />
                                            <Text fz={10} lts={0.2} c="dimmed">
                                                Developed by IT Support Office
                                            </Text>
                                        </Flex>
                                    </Stack>
                                )}

                                {userType && (
                                    <div style={{ position: 'relative' }}>
                                        <Stack gap="xs" align="center" mb="xl">
                                            <LogoComponent />
                                            <Title order={3} fw={600} mt="lg" fz={25}>Account Login</Title>
                                            <Text c="dimmed" size="sm">Login to manage your SIMS Account</Text>
                                        </Stack>

                                        <div style={{ position: 'relative' }}>
                                            <LoadingOverlay visible={false} overlayBlur={2} /> 
                                            
                                            <form onSubmit={handleLogin}>
                                                <TextInput
                                                    label={userType === 'student' ? "Student ID Number" : "Employee ID Number"}
                                                    placeholder={userType === 'student' ? "Student ID" : "Employee ID"}
                                                    value={idNum}
                                                    onChange={(e) => setIdNum(e.currentTarget.value)}
                                                    size="xs"
                                                    radius="xl"
                                                    required
                                                    mb="md"
                                                />

                                                <PasswordInput
                                                    label="Password"
                                                    placeholder="Your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.currentTarget.value)}
                                                    size="xs"
                                                    radius="xl"
                                                    required
                                                    mt="md"
                                                    mb="sm"
                                                />

                                                <Group position="right" mb="xl">
                                                    <Anchor c="blue" href="#" size="xs" fw={600}>
                                                        Reset password
                                                    </Anchor>
                                                </Group>

                                                <Button 
                                                    fullWidth 
                                                    type="submit" 
                                                    size="xs" 
                                                    radius="xl"
                                                    mb="md"
                                                    loading={isLoading}
                                                    disabled={isLoading}
                                                >
                                                    Login {userType === 'student' ? "as Student" : "as Employee"}
                                                </Button>

                                                <Button 
                                                    fullWidth 
                                                    variant="subtle"
                                                    color="gray"
                                                    type="button" 
                                                    onClick={handleBack} 
                                                    size="xs" 
                                                    radius="xl"
                                                    mb="sm"
                                                    disabled={isLoading}
                                                >
                                                    <IconArrowLeft size={16} style={{marginRight:"10px"}} />
                                                    Back
                                                </Button>
                                                <ItsoLogoComponent />
                                                <Text align="center" fz={10} lts={0.2} c="dimmed">
                                                    Developed by IT Support Office
                                                </Text>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </Box>
                        </Grid.Col>
                </Grid>
            </Paper>
            <Stack></Stack>
            <Box 
                w="100%" 
                p="md" 
                style={{ position: 'absolute', bottom: 0, left: 0 }}
                mt="xl"                    
            >
                <Center>
                    <Stack align="center" spacing={10}>
                        <Box hiddenFrom="sm">
                            <ColorSchemeToggleComponent />
                        </Box>

                        {/* 2. Footer Text */}
                        <Text align="center" size="xs" c="dimmed">
                            <Anchor c="dimmed" href="https://www.hub.lnu.edu.ph" mr="xs">
                                LNU Apps Ecosystem 
                            </Anchor> 
                            | 
                            <Anchor c="dimmed" href="https://www.lnu.edu.ph/data-privacy" ml="xs">
                                Data Privacy Statement 
                            </Anchor>
                            <br />
                            LNU SIMS v{import.meta.env.VITE_APP_VERSION} - Copyright © {new Date().getFullYear()} Leyte Normal University. All Rights Reserved.
                        </Text>
                    </Stack>
                </Center>
                <Box 
                    visibleFrom="sm" 
                    pos="absolute" 
                    right={20} 
                    top="50%" 
                    style={{ transform: 'translateY(-50%)' }}
                >
                    <ColorSchemeToggleComponent />
                </Box>
            </Box>
        </Center>
    );
};

export default LoginPage;