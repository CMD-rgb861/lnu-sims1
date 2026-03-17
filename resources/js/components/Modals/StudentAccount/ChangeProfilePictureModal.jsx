import { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Grid,
  Button,
  LoadingOverlay,
  Stack,
  Group,
  Text,
  Avatar,
  Image,
  Paper,
  ActionIcon,
  Box,
  Slider,
  Alert
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconUpload, IconPhoto, IconX, IconTrash, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../utils/cropImage';

const ChangeProfilePictureModal = ({
  opened,
  onClose,
  onSubmit,
  isSubmitting,
  currentAvatar,   
  currentSignature, 
}) => {
  const [profilePic, setProfilePic] = useState(null);
  const [signature, setSignature] = useState(null);

  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [croppingType, setCroppingType] = useState(null); // 'profile' or 'signature'
  const [tempImage, setTempImage] = useState(null);       // URL of image being cropped
  const [tempFileName, setTempFileName] = useState("");   // Original file name
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCroppingProcess, setIsCroppingProcess] = useState(false);

  useEffect(() => {
    if (!opened) {
      setProfilePic(null);
      setSignature(null);
      setProfilePicPreview(null);
      setSignaturePreview(null);
      setErrorMessage(null);
      return;
    }

    if (profilePic) {
      const objectUrl = URL.createObjectURL(profilePic);
      setProfilePicPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); 
    } else {
      setProfilePicPreview(currentAvatar);
    }
  }, [profilePic, currentAvatar, opened]);

  useEffect(() => {
    if (signature) {
      const objectUrl = URL.createObjectURL(signature);
      setSignaturePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); 
    } else {
      setSignaturePreview(currentSignature);
    }
  }, [signature, currentSignature, opened]);

  const handleDrop = (files, type) => {
    setErrorMessage(null);
    const file = files[0];
    setTempImage(URL.createObjectURL(file));
    setTempFileName(file.name);
    setCroppingType(type);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    setIsCroppingProcess(true);
    try {
      // Use our utility function to generate the final File
      const croppedFile = await getCroppedImg(tempImage, croppedAreaPixels, tempFileName);
      
      if (croppingType === 'profile') {
        setProfilePic(croppedFile);
      } else if (croppingType === 'signature') {
        setSignature(croppedFile);
      }

      // Exit cropping mode
      setCroppingType(null);
      setTempImage(null);
    } catch (e) {
      console.error("Failed to crop image", e);
    } finally {
      setIsCroppingProcess(false);
    }
  };

  const handleCancelCrop = () => {
    setCroppingType(null);
    setTempImage(null);
  };

  const handleSubmit = () => {
    onSubmit({
      profile_pic: profilePic,
      e_signature: signature,
    });
  };

  const handleReject = (fileRejections) => {
    const error = fileRejections[0]?.errors[0];
    
    if (error?.code === 'file-too-large') {
      setErrorMessage('The selected file is too large. The maximum size is 2MB.');
    } else if (error?.code === 'file-invalid-type') {
      setErrorMessage('Invalid file format. Please upload a valid image (PNG, JPEG).');
    } else {
      setErrorMessage(error?.message || 'An error occurred while selecting the file.');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={croppingType ? "Crop Image" : "Change Profile Picture & E-Signature"}
      size="lg"
      radius="md"
      closeOnClickOutside={!croppingType}
      withCloseButton={!croppingType}
      centered
    >
        <LoadingOverlay visible={isSubmitting || isCroppingProcess} overlayProps={{ blur: 2 }} />
        {/* --- CROPPER UI --- */}
        {croppingType && (
            <Stack gap="md">
            <Box pos="relative" w="100%" h={400} bg="dark.7" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={croppingType === 'profile' ? 1 : 21 / 9} // 1:1 for profile, wide for signature
                cropShape={croppingType === 'profile' ? "round" : "rect"}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                />
            </Box>

            <Stack gap={4}>
                <Text size="sm" fw={500}>Zoom</Text>
                <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={setZoom}
                color="blue"
                />
            </Stack>

            <Group justify="flex-end" mt="md">
                <Button variant="light" color="gray" onClick={handleCancelCrop} fz="xs">
                Cancel Crop
                </Button>
                <Button color="blue" onClick={handleApplyCrop} fz="xs" leftSection={<IconCheck size={16} />}>
                Apply Crop
                </Button>
            </Group>
            </Stack>
        )}

        {/* --- MAIN UI (Hidden while cropping) --- */}
        {!croppingType && (
            <>
            {errorMessage && (
                <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Upload Error" 
                color="red" 
                variant="light" 
                mb="md"
                radius="lg"
                withCloseButton
                onClose={() => setErrorMessage(null)}
                gap="xs"
                >
                    <Text fz="xs" c="red">{errorMessage}</Text>
                </Alert>
            )}
            <Grid gutter="xl">
                {/* PROFILE PICTURE SECTION */}
                <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack align="center" gap="md">
                    <Text fw={600} fz="sm" c="dimmed">Profile Picture</Text>
                    
                    <Paper withBorder p="sm" radius="md" w="100%" style={{ position: 'relative' }}>
                    <Stack align="center" gap="sm">
                        <Avatar src={profilePicPreview} size={120} radius={120} mx="auto" />
                        
                        {profilePic ? (
                        <Button 
                            variant="subtle" color="red" size="xs" 
                            leftSection={<IconTrash size={14} />}
                            onClick={() => setProfilePic(null)}
                        >
                            Remove Selected File
                        </Button>
                        ) : (
                        <Dropzone
                            onDrop={(files) => handleDrop(files, 'profile')}
                            onReject={handleReject}
                            maxSize={2 * 1024 ** 2} 
                            accept={IMAGE_MIME_TYPE}
                            maxFiles={1} multiple={false} p="sm"
                            style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))', borderRadius: '10px' }}
                        >
                            <Group justify="center" gap="xs" style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept><IconUpload size={20} stroke={1.5} color="var(--mantine-color-blue-6)" /></Dropzone.Accept>
                                <Dropzone.Reject><IconX size={20} stroke={1.5} color="var(--mantine-color-red-6)" /></Dropzone.Reject>
                                <Dropzone.Idle><IconPhoto size={60} color="light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))" stroke={1.5} /></Dropzone.Idle>
                                <Text size="sm" fw={600} ta="center">Drag image here or click</Text>
                                <Text size="xs" c="light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))" mt={2} ta="center">Max file size: 2MB</Text>
                            </Group>
                        </Dropzone>
                        )}
                    </Stack>
                    </Paper>
                </Stack>
                </Grid.Col>

                {/* E-SIGNATURE SECTION */}
                <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack align="center" gap="md">
                    <Text fw={600} fz="sm" c="dimmed">E-Signature</Text>
                    
                    <Paper withBorder p="sm" radius="md" w="100%" style={{ position: 'relative' }}>
                    <Stack align="center" gap="sm">
                        <Image
                            src={signaturePreview} alt="E-Signature Preview"
                            h={120} w="100%" fit="contain"
                            fallbackSrc="https://placehold.co/250x120?text=No+Signature"
                        />
                        
                        {signature ? (
                        <Button 
                            variant="subtle" color="red" size="xs" 
                            leftSection={<IconTrash size={14} />}
                            onClick={() => setSignature(null)}
                        >
                            Remove Selected File
                        </Button>
                        ) : (
                        <Dropzone
                            onDrop={(files) => handleDrop(files, 'signature')}
                            onReject={handleReject}
                            maxSize={2 * 1024 ** 2} 
                            accept={IMAGE_MIME_TYPE}
                            maxFiles={1} multiple={false} p="sm"
                            style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))', borderRadius: '10px' }}
                        >
                            <Group justify="center" gap="xs" style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept><IconUpload size={20} stroke={1.5} color="var(--mantine-color-blue-6)" /></Dropzone.Accept>
                                <Dropzone.Reject><IconX size={20} stroke={1.5} color="var(--mantine-color-red-6)" /></Dropzone.Reject>
                                <Dropzone.Idle><IconPhoto size={60} color="light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))" stroke={1.5} /></Dropzone.Idle>
                                <Text size="sm" fw={600} ta="center">Drag image here or click</Text>
                                <Text size="xs" c="light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))" mt={2} ta="center">Max file size: 2MB</Text>
                            </Group>
                        </Dropzone>
                        )}
                    </Stack>
                    </Paper>
                </Stack>
                </Grid.Col>
            </Grid>

            {/* ACTION BUTTONS */}
            <Group justify="flex-end" mt="xl">
                <Button variant="light" color="gray" onClick={onClose} disabled={isSubmitting} fz="xs">
                Cancel
                </Button>
                <Button
                fz="xs" color="green"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={!profilePic && !signature} 
                >
                Upload & Save
                </Button>
            </Group>
            </>
        )}
    </Modal>
  );
};

export default ChangeProfilePictureModal;