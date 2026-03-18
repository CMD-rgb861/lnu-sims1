import { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Stack,
  Group,
  PasswordInput,
  Progress,
  Text,
  Box,
  Center,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

// Helper to check how many requirements are met
function getStrength(password) {
  let multiplier = password.length > 7 ? 1 : 0;

  requirements.forEach((requirement) => {
    if (requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * (requirements.length + 1 - multiplier), 0);
}

const Requirement = ({ meets, label }) => {
  return (
    <Text
      c={meets ? 'teal' : 'dimmed'}
      mt={5}
      size="sm"
    >
      <Center inline>
        {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
        <Box ml={7}>{label}</Box>
      </Center>
    </Text>
  );
};

const ChangeAccountPasswordModal = ({ opened, onClose, onSubmit, isSubmitting }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [opened]);

  const strength = getStrength(newPassword);
  
  const getStrengthColor = (strength) => {
    if (strength < 30) return 'red';
    if (strength < 50) return 'orange';
    if (strength < 70) return 'yellow';
    return 'teal';
  };

  const checks = requirements.map((requirement, index) => (
    <Requirement key={index} label={requirement.label} meets={requirement.re.test(newPassword)} />
  ));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (strength < 100) {
      setError('Please ensure your new password meets all security requirements.');
      return;
    }

    // Pass data to the parent component
    onSubmit({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Change Password"
      size="md"
      radius="md"
      centered
      closeOnClickOutside={!isSubmitting}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Current Password */}
          <PasswordInput
            label="Current Password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.currentTarget.value)}
            required
            disabled={isSubmitting}
          />

          {/* New Password with Strength Meter */}
          <Box>
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.currentTarget.value)}
              required
              disabled={isSubmitting}
            />

            {/* Strength Progress Bar */}
            <Progress
              color={getStrengthColor(strength)}
              value={strength}
              size={5}
              mt="sm"
              mb="xs"
              style={{ transition: 'width 250ms ease' }}
            />

            {/* Requirements Checklist */}
            <Requirement label="Includes at least 8 characters" meets={newPassword.length > 7} />
            {checks}
          </Box>

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
            required
            onPaste={(e) => {
                e.preventDefault(); 
            }}
            disabled={isSubmitting}
            error={
              confirmPassword && newPassword !== confirmPassword
                ? 'Passwords do not match'
                : null
            }
          />

          {/* General Error Message */}
          {error && (
            <Text c="red" size="sm" fw={500}>
              {error}
            </Text>
          )}

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="light" color="gray" onClick={onClose} disabled={isSubmitting} fz="xs">
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="blue" 
              loading={isSubmitting} 
              fz="xs"
              disabled={strength < 100 || !currentPassword || newPassword !== confirmPassword}
            >
              Update Password
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default ChangeAccountPasswordModal;