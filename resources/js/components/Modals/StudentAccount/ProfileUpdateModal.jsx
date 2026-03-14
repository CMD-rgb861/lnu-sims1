import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from '@mantine/form';
import { 
    Modal, Button, Checkbox, Alert, Stepper, Group, Stack, 
    Text, Title, Avatar, Divider, Box, Anchor,
    LoadingOverlay, Image, Slider, Grid, Paper, TextInput
} from '@mantine/core';
import { 
    IconInfoCircle, IconArrowRight, IconTrash, IconUpload, IconBellRinging,
    IconPhoto, IconX, IconCheck, IconAlertCircle,
    IconArrowLeft
} from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import Cropper from 'react-easy-crop';

import { logoutUser } from '../../../store/slices/AuthSlice';
import axiosClient from '../../../api/axiosClient';
import getCroppedImg from '../../../utils/cropImage'; 
import PersonalInformationForm from '../../Forms/StudentAccount/PersonalInformationForm';
import ProfileUpdatePage1Form from '../../Forms/StudentAccount/ProfileUpdatePage1Form';
import ProfileUpdatePage2Form from '../../Forms/StudentAccount/ProfileUpdatePage2Form';
import ProfileUpdatePage3Form from '../../Forms/StudentAccount/ProfileUpdatePage3Form';

const ProfileUpdateModal = ({ user, opened }) => {
    const dispatch = useDispatch();

    // --- FORM STATE INITIALIZATION ---
    const form = useForm({
        initialValues: {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            blood_type: '',
            records: [
                { level_id: '', school_id: '', period_from: '', period_to: '', year_graduated: '', honors: '', degree: '', units_earned: '' }
            ],
            family_members: [
                { name: '', relationship: '', occupation: '', contact_number: '' }
            ]
        }
    });

    // --- STEPPER & CONSENT STATE ---
    const [activeStep, setActiveStep] = useState(-1);
    const [consentChecked, setConsentChecked] = useState(false);
    
    // --- IMAGE STATE ---
    const [profilePic, setProfilePic] = useState(null);
    const [eSignature, setSignature] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [eSignaturePreview, setSignaturePreview] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // --- CROPPING STATE ---
    const [croppingType, setCroppingType] = useState(null);
    const [tempImage, setTempImage] = useState(null);       
    const [tempFileName, setTempFileName] = useState("");   
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCroppingProcess, setIsCroppingProcess] = useState(false);

    // --- AXIOS FETCH LOGIC ---
    const [academicLevels, setAcademicLevels] = useState([]);

    useEffect(() => {
        if (opened) {
            axiosClient.get('/api/mp/fetch/academic-levels')
                .then(res => {
                    const levels = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    setAcademicLevels(levels);
                })
                .catch(err => {
                    console.error("Failed to load academic levels", err);
                    setAcademicLevels([]); 
                });
        }
    }, [opened]);

    // --- DYNAMIC FORM HANDLERS ---
    const addAcademicRecord = () => {
        form.insertListItem('records', { level_id: '', school_id: '', period_from: '', period_to: '', year_graduated: '', honors: '', degree: '', units_earned: '' });
    };

    const removeAcademicRecord = (index) => {
        form.removeListItem('records', index);
    };

    const addFamilyMember = () => {
        form.insertListItem('family_members', { name: '', relationship: '', occupation: '', contact_number: '' });
    };

    const removeFamilyMember = (index) => {
        form.removeListItem('family_members', index);
    };

    // --- STEPPER CONTROLS ---
    const nextStep = () => setActiveStep((current) => (current < 2 ? current + 1 : current));
    const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

    const handleLogout = (e) => {
        e.preventDefault();
        dispatch(logoutUser());
    };

    // --- SUBMISSION LOGIC ---
    const handleSubmitProfile = async () => {
        try {
            const formData = new FormData();
            formData.append('profile_data', JSON.stringify(form.values));
            if (profilePic) formData.append('profile_picture', profilePic);
            if (eSignature) formData.append('e_signature', eSignature);

            await axiosClient.post('/api/student/profile/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            console.log('Profile successfully updated!');
            // TODO: Close modal, show notification, or refresh user data
        } catch (error) {
            console.error('Submission failed', error);
        }
    };

    // --- IMAGE PREVIEW EFFECTS ---
    useEffect(() => {
        if (profilePic) {
            const objectUrl = URL.createObjectURL(profilePic);
            setProfilePicPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl); 
        } else {
            setProfilePicPreview(null);
        }
    }, [profilePic]);

    useEffect(() => {
        if (eSignature) {
            const objectUrl = URL.createObjectURL(eSignature);
            setSignaturePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl); 
        } else {
            setSignaturePreview(null);
        }
    }, [eSignature]);

    const handleDrop = (files, type) => {
        setErrorMessage(null);
        const file = files[0];
        setTempImage(URL.createObjectURL(file));
        setTempFileName(file.name);
        setCroppingType(type);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const onCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleApplyCrop = async () => {
        setIsCroppingProcess(true);
        try {
            const croppedFile = await getCroppedImg(tempImage, croppedAreaPixels, tempFileName);
            
            if (croppingType === 'profile') {
                setProfilePic(croppedFile);
            } else if (croppingType === 'signature') {
                setSignature(croppedFile);
            }

            setCroppingType(null);
            setTempImage(null);
        } catch (e) {
            console.error("Failed to crop image", e);
            setErrorMessage("Failed to crop the image. Please try again.");
        } finally {
            setIsCroppingProcess(false);
        }
    };

    const handleCancelCrop = () => {
        setCroppingType(null);
        setTempImage(null);
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

    const renderConsentSection = () => (
        <Stack spacing="md" p="sm">
            <Group spacing="sm">
                <IconBellRinging size={28} style={{ color: 'var(--mantine-color-blue-filled)' }} /> 
                <Title order={2}>Hello, {user?.first_name || 'Student'}.</Title>
            </Group>
            <Text>Greetings!</Text>
            <Text>
                To ensure a smooth and efficient enrollment process, it is important that your student profile is complete and up to date. 
                Before getting started, please read the Data Privacy Consent Notice carefully. 
                Your consent is required under the Data Privacy Act of 2012. Once acknowledged, 
                you will be guided to update your personal, academic, and family background information.
            </Text>

            <Alert icon={<IconInfoCircle size={16} />} title="Data Privacy Notice" color="blue" variant="light">
                In accordance with the <strong>Data Privacy Act of 2012</strong>,
                the information you provide will be collected and processed solely for purposes of academic monitoring, student support, and institutional reporting. 
                Your consent is required before we can collect and process your data.

                <Text mt="lg" fz="sm" fw={600}>Click on the link below to learn more: </Text>
                <Text><Anchor fz="sm" href="https://www.lnu.edu.ph/data-privacy/" target="_blank" underline="hover">Data Privacy Statement</Anchor></Text>
            </Alert>

            <Checkbox
                label="I have read and understood the notice, and I give my consent to the collection and use of my data."
                checked={consentChecked}
                onChange={(event) => setConsentChecked(event.currentTarget.checked)}
                size="sm"
                mt="md"
            />

            <Group justify="right" mt="xl">
                <Button 
                    disabled={!consentChecked}
                    onClick={() => setActiveStep(0)}
                    variant="light"
                    rightSection={<IconArrowRight size={12} />}
                    fz="xs"
                >
                Proceed
                </Button>
            </Group>
        </Stack>
    );

    const renderPersonalInfo = () => {
        if (croppingType) {
            return (
                <Stack spacing="md" mt="md" pos="relative" p="sm">
                    <LoadingOverlay visible={isCroppingProcess} overlayBlur={2} />
                    <Box pos="relative" w="100%" h={400} bg="dark.7" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                        <Cropper
                            image={tempImage}
                            crop={crop}
                            zoom={zoom}
                            aspect={croppingType === 'profile' ? 1 : 21 / 9}
                            cropShape={croppingType === 'profile' ? "round" : "rect"}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </Box>
                    <Stack spacing={4}>
                        <Text size="sm" weight={500}>Zoom</Text>
                        <Slider value={zoom} min={1} max={3} step={0.1} onChange={setZoom} color="blue" />
                    </Stack>
                    <Group position="right" mt="md">
                        <Button variant="light" color="gray" onClick={handleCancelCrop} size="xs">Cancel</Button>
                        <Button color="blue" onClick={handleApplyCrop} size="xs" leftIcon={<IconCheck size={16} />}>Apply Crop</Button>
                    </Group>
                </Stack>
            );
        }

        return (
            <Stack spacing="md" p="sm">
                <Alert icon={<IconInfoCircle size={16} />} color="gray">
                    <b>Instructions:</b>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li>On the <b>blood type section</b>, select "Unknown" if you are unsure.</li>
                        <li>On the <b>e-signature section</b>, upload a picture of your signature with a white background and black ink.</li>
                        <li>Put <b>N/A</b> if the field is not applicable.</li>
                    </ul>
                </Alert>

                {errorMessage && (
                    <Alert icon={<IconAlertCircle size={16} />} title="Upload Error" color="red" variant="light" withCloseButton onClose={() => setErrorMessage(null)}>
                        <Text fz="xs" c="red">{errorMessage}</Text>
                    </Alert>
                )}

                <Title order={4} mt="md">Upload Images</Title>
                
                <Grid gutter="xl">
                    {/* PROFILE PICTURE DROPZONE */}
                    <Grid.Col span={{ base: 12, xl: 6, lg: 6, md: 6, sm: 12 }}>
                        <Stack align="center" spacing="md">
                            <Text fw={600} size="sm" c="dimmed">Profile Picture</Text>
                            <Paper withBorder p="sm" radius="md" w="100%">
                                <Stack align="center" spacing="sm">
                                    <Avatar src={profilePicPreview} size={120} radius={120} mx="auto" />
                                    {profilePic ? (
                                        <Button variant="subtle" color="red" size="xs" leftSection={<IconTrash size={14} />} onClick={() => setProfilePic(null)}>
                                            Remove
                                        </Button>
                                    ) : (
                                        <Dropzone 
                                            onDrop={(files) => handleDrop(files, 'profile')} 
                                            onReject={handleReject} maxSize={2 * 1024 ** 2} 
                                            accept={IMAGE_MIME_TYPE} 
                                            maxFiles={1} 
                                            multiple={false} 
                                            p="sm" 
                                            style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))', borderRadius: '10px' }}
                                        >
                                            <Group position="center" spacing="xs" style={{ pointerEvents: 'none' }}>
                                                <Dropzone.Accept><IconUpload size={20} color="var(--mantine-color-blue-6)" /></Dropzone.Accept>
                                                <Dropzone.Reject><IconX size={20} color="var(--mantine-color-red-6)" /></Dropzone.Reject>
                                                <Dropzone.Idle><IconPhoto size={40} color="light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))" /></Dropzone.Idle>
                                                <Text size="xs" align="center" c="dimmed">Drag image or click (Max: 2MB)</Text>
                                            </Group>
                                        </Dropzone>
                                    )}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid.Col>

                    {/* E-SIGNATURE DROPZONE */}
                    <Grid.Col span={{ base: 12, xl: 6, lg: 6, md: 6, sm: 12 }}>
                        <Stack align="center" spacing="md">
                            <Text fw={600} size="sm" c="dimmed">E-Signature</Text>
                            <Paper withBorder p="sm" radius="md" w="100%">
                                <Stack align="center" spacing="sm">
                                    <Image src={eSignaturePreview} alt="E-Signature Preview" height={120} width="100%" fit="contain" fallbackSrc="https://placehold.co/250x120?text=No+Signature" />
                                    {eSignature ? (
                                        <Button variant="subtle" color="red" size="xs" leftSection={<IconTrash size={14} />} onClick={() => setSignature(null)}>
                                            Remove
                                        </Button>
                                    ) : (
                                        <Dropzone 
                                            onDrop={(files) => handleDrop(files, 'signature')} 
                                            onReject={handleReject} maxSize={2 * 1024 ** 2} 
                                            accept={IMAGE_MIME_TYPE} 
                                            maxFiles={1} 
                                            multiple={false} 
                                            p="sm" 
                                            style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))', borderRadius: '10px' }}
                                        >
                                            <Group position="center" spacing="xs" style={{ pointerEvents: 'none' }}>
                                                <Dropzone.Accept><IconUpload size={20} color="var(--mantine-color-blue-6)" /></Dropzone.Accept>
                                                <Dropzone.Reject><IconX size={20} color="var(--mantine-color-red-6)" /></Dropzone.Reject>
                                                <Dropzone.Idle><IconPhoto size={40} color="light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))" /></Dropzone.Idle>
                                                <Text size="xs" align="center" c="dimmed">Drag signature or click (Max: 2MB)</Text>
                                            </Group>
                                        </Dropzone>
                                    )}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid.Col>
                </Grid>

                <Divider my="sm" />
                <Title order={4}>Personal Information</Title>
                
                <ProfileUpdatePage1Form form={form} />
                
                <Group position="apart" mt="xl" justify="right">
                    <Button variant="light" color="gray" onClick={handleLogout}>Logout</Button>
                    <Button variant="light" rightSection={<IconArrowRight size={14}/>} onClick={nextStep}>Next</Button>
                </Group>
            </Stack>
        );
    };

    const renderAcademicBackground = () => (
        <Stack spacing="md" p="sm">
            <Alert icon={<IconInfoCircle size={16} />} color="gray">
                <b>Instructions:</b>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>You are requested to provide information pertaining to all the schools that you previously attended.</li>
                    <li>Click the <b>Add Additional Level</b> button for each school attended relative to the year level selected.</li>
                    <li>Put <b>N/A</b> if the field is not applicable.</li>
                </ul>
            </Alert>
            <Title order={4} mt="md">Academic Background</Title>
            
            {/* Iterating dynamically across the records array */}
            {form.values.records.map((_, index) => (
                <ProfileUpdatePage2Form 
                    key={index} 
                    index={index}
                    form={form}
                    academicLevels={academicLevels}
                    onDelete={removeAcademicRecord}
                />
            ))}

            <Button variant="outline" color="green" mt="md" onClick={addAcademicRecord}>
                + Add Additional Level
            </Button>

            <Group position="apart" mt="xl" justify="right">
                <Button variant="light" leftSection={<IconArrowLeft size={14}/>} color="gray" onClick={prevStep}>Previous</Button>
                <Button variant="light" rightSection={<IconArrowRight size={14}/>} onClick={nextStep}>Next</Button>
            </Group>
        </Stack>
    );

    const renderFamilyBackground = () => (
        <Stack spacing="md" p="sm">
            <Alert icon={<IconInfoCircle size={16} />} color="gray">
                <b>Instructions:</b>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>You are requested to provide information pertaining to the family members you have on your household.</li>
                    <li>Click the <b>Add Additional Member</b> button for each family member.</li>
                    <li>Put <b>N/A</b> if the field is not applicable.</li>
                </ul>
            </Alert>
            <Title order={4} mt="md">Family Background</Title>
            {form.values.family_members.map((_, index) => (
                <ProfileUpdatePage3Form 
                    key={index} 
                    index={index}
                    form={form}
                    academicLevels={academicLevels}
                    onDelete={removeAcademicRecord}
                />
            ))}

            <Button variant="outline" color="green" mt="md" onClick={addFamilyMember}>
                + Add Additional Member
            </Button>

            <Group position="apart" mt="xl" justify="right">
                <Button variant="light" leftSection={<IconArrowLeft size={14}/>} color="gray" onClick={prevStep}>Previous</Button>
                <Button variant="light" leftSection={<IconCheck size={14}/>} color="green" onClick={handleSubmitProfile}>Finish & Submit</Button>
            </Group>
        </Stack>
    );

    return (
        <Modal
            opened={opened}
            onClose={() => {}} 
            withCloseButton={false} 
            closeOnClickOutside={false} 
            closeOnEscape={false} 
            size={900}
            title={activeStep >= 0 ? "Student Profile Update" : null}
            styles={{ title: { fontSize: '1.25rem', fontWeight: 600 } }} 
            centered
        >
        {activeStep === -1 ? (
            renderConsentSection()
        ) : (
            <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm" size="sm">
                <Stepper.Step label="Personal Information" description="Basic details">
                    {renderPersonalInfo()}
                </Stepper.Step>
                
                <Stepper.Step label="Academic Background" description="Previous schools">
                    {renderAcademicBackground()}
                </Stepper.Step>
                
                <Stepper.Step label="Family Background" description="Household details">
                    {renderFamilyBackground()}
                </Stepper.Step>
            </Stepper>
        )}
        </Modal>
    );
};

export default ProfileUpdateModal;