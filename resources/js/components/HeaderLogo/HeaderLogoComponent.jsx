import { Image, Group } from '@mantine/core';
import DefaultLogo from '../../assets/images/sims_logo_light.png';
import DarkModeLogo from '../../assets/images/sims_logo_dark.png';

const HeaderLogoComponent = () => {
  return (
    <Group>
      <Image src={DarkModeLogo} lightHidden alt="LNU SIMS Logo" maw={90} />
      <Image src={DefaultLogo} darkHidden alt="LNU SIMS Logo" maw={90} />
    </Group>
  );
};

export default HeaderLogoComponent;