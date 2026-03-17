import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Button, Group, Stack } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import HeaderLogoComponent from '../../components/HeaderLogo/HeaderLogoComponent';

const Error404Page = () => {
  const navigate = useNavigate();

  return (
    <Container 
      size="md" 
      style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
        <Stack align="center" gap="lg">
            <Title 
            style={{ 
                fontSize: '150px', 
                fontWeight: 900, 
                color: 'var(--mantine-color-blue-6)', 
                lineHeight: 1 
            }}
            >
            404
            </Title>

            {/* Catchy Header */}
            <Title order={2} ta="center">
            You have found a secret place.
            </Title>

            {/* Subtitle / Explanation */}
            <Text c="dimmed" size="lg" ta="center" maw={500}>
            Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has been moved to another URL.
            </Text>

            {/* Action Button */}
            <Group justify="center" mt="xl">
            <Button 
                size="md" 
                variant="light" 
                leftSection={<IconHome size={20} />}
                onClick={() => navigate('/dashboard')} // Redirects to your dashboard/home
            >
                Take me back to home page
            </Button>
            </Group>
            <Group mt="xl">
                <HeaderLogoComponent/>
            </Group>
        </Stack>
    </Container>
  );
};

export default Error404Page;