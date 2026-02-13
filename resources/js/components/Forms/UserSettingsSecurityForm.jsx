import {
  Paper,
  PasswordInput, // Changed from TextInput
  Grid,
  Button,
  LoadingOverlay,
  Stack,
  Progress,
  Text,
  Box,
  Group,
  Center
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconX } from '@tabler/icons-react';

// 1. Define Password Requirements
const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

function getStrengthColor(strength) {
  if (strength < 30) return 'red';
  if (strength < 50) return 'orange';
  if (strength < 70) return 'yellow';
  return 'teal';
}

// 2. Helper Component for Requirement Items
const PasswordRequirement = ({ meets, label }) => {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      style={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="xs"
    >
      {meets ? <IconCheck size={14} /> : <IconX size={14} />} 
      <Box ml={10}>{label}</Box>
    </Text>
  );
};

const UserSettingSecurityForm = ({
  userDetails,
  onEditSecurity,
  isSubmitting
}) => {

  const form = useForm({
    initialValues: {
        current_password: '',
        new_password: '',
        confirm_password: '',
    },
    validate: {
      current_password: (value) => value.trim().length > 0 ? null : 'Current password is required',
      new_password: (value) => {
         if (value.trim().length === 0) return 'New password is required';
         if (getStrength(value) < 100 && value.length < 6) return 'Password is too weak'; 
         return null;
      },
      confirm_password: (value, values) => value !== values.new_password ? 'Passwords did not match' : null,
    },
  });

  const handleSubmit = (values) => {
    const submissionData = { ...values, id: userDetails.id } ;
    onEditSecurity(submissionData)
  };

  // Calculate strength dynamically based on form value
  const strength = getStrength(form.values.new_password);
  const color = getStrengthColor(strength);

  return (
    <>
      <Paper withBorder radius="md" p="lg" mx="sm">
        <Grid>
            <Grid.Col span={12}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <LoadingOverlay visible={isSubmitting} overlayBlur={2} />
                    <Grid>
                        <Grid.Col span={12}>
                            <Stack>
                                <Grid>
                                    <Grid.Col span={12} sm={4}>
                                    <PasswordInput
                                        withAsterisk
                                        label="Current Password"
                                        placeholder="Your current password"
                                        {...form.getInputProps('current_password')}
                                    />
                                    </Grid.Col>
                                    
                                    <Grid.Col span={12} sm={4}>
                                        <PasswordInput
                                            withAsterisk
                                            label="New Password"
                                            placeholder="Your new password"
                                            {...form.getInputProps('new_password')}
                                        />
                                        
                                        {/* 3. Strength Indicator Block */}
                                        {form.values.new_password.length > 0 && (
                                            <Box mt="xs">
                                                <Group gap={5} grow>
                                                    {/* This creates the segmented bar effect */}
                                                    <Progress 
                                                        size="xs" 
                                                        color={color} 
                                                        value={strength >= 0 ? 100 : 0} 
                                                        transitionDuration={0} 
                                                    />
                                                </Group>
                                                
                                                <PasswordRequirement 
                                                    label="Includes at least 6 characters" 
                                                    meets={form.values.new_password.length > 5} 
                                                />
                                                {requirements.map((requirement, index) => (
                                                    <PasswordRequirement
                                                        key={index}
                                                        label={requirement.label}
                                                        meets={requirement.re.test(form.values.new_password)}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Grid.Col>

                                    <Grid.Col span={12} sm={4}>
                                    <PasswordInput
                                        withAsterisk
                                        label="Confirm New Password"
                                        placeholder="Confirm new password"
                                        {...form.getInputProps('confirm_password')}
                                    />
                                    </Grid.Col>
                                </Grid>
                                <Button
                                    type="submit"
                                    mt="md"
                                    p="xs"
                                    w="30%"
                                    color="teal"
                                    style={{ fontSize: '12px', }}
                                    loading={isSubmitting}
                                >
                                    Save Changes
                                </Button>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </form>
            </Grid.Col>
        </Grid>
      </Paper>
    </>
  );
};

export default UserSettingSecurityForm;