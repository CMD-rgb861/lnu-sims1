import { ActionIcon, useMantineColorScheme, Text, Group } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

const ColorSchemeToggleComponent = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Group gap="xs">
        <ActionIcon
            variant="light"
            color={dark ? 'yellow' : 'blue'}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
            size="sm"

            >
            {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
        </ActionIcon>
        <Text size="xs">Toggle Dark Mode</Text>
    </Group>
  );
};

export default ColorSchemeToggleComponent;
