import { Image, Group } from '@mantine/core';
import DefaultLogo from '../../assets/images/lnu_itso_logo_light.png';
import DarkModeLogo from '../../assets/images/lnu_itso_logo_dark.png';

const ItsoLogoComponent = () => {
  return (
    <Group>
      <Image src={DarkModeLogo} lightHidden alt="ITSO Logo" maw={110} mx="auto" my="10px" />
      <Image src={DefaultLogo} darkHidden alt="ITSo Logo" maw={110} mx="auto" my="10px"  />
    </Group>
  );
};

export default ItsoLogoComponent;