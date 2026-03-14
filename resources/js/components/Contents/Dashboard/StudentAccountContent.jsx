import {
  Grid,
  Text,
  Flex,
  Badge,
  Box
} from '@mantine/core';

const StudentAccountContent = () => {
  return (
    <>
        <Grid>
          <Grid.Col span={12} py="xl" mah={700} style={{overflow: "auto"}}>
            <Text fz="sm" fw={500} lts={0.1} c="dimmed" mt="md">Student Account Dashboard </Text>
          </Grid.Col>
        </Grid>
    </>
  );
};

export default StudentAccountContent;