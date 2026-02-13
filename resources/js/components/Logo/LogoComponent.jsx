import { Image, Group } from '@mantine/core';
import DefaultLogo from '../../assets/images/sims_logo_light.png';
import DarkModeLogo from '../../assets/images/sims_logo_dark.png';

const LogoComponent = () => {
  return (
    <Group>
      <Image src={DarkModeLogo} lightHidden alt="BPM Logo" maw={180} mx="auto" />
      <Image src={DefaultLogo} darkHidden alt="BPM Logo" maw={180} mx="auto" />
    </Group>
  );
};

export default LogoComponent;