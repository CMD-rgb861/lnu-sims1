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

const ProfileUpdateModal = ({ user, opened, onClose }) => {
    const dispatch = useDispatch();

    // --- FORM STATE INITIALIZATION ---
    const form = useForm({
        initialValues: {
            id: user?.id || '',
            id_number: user?.id_number || '',
            last_name: user?.last_name || '',
            first_name: user?.first_name || '',
            middle_name: user?.middle_name || '',
            last_name: user?.last_name || '',
            email_address: user?.email_address || '',
            blood_type: '',
            educ_background: [
                { level_id: '', school_id: '', period_from: '', period_to: '', year_graduated: '', honors: '', degree: '', units_earned: 0 }
            ],
            fam_background: [
                { name: '', relationship: '', occupation: '', contact_number: '' }
            ],
            region: '',
            province: '',
            city: '',
            barangay: '',
        },
        validate: {
            id_number: (value) => (value?.length >= 7 ? null : 'ID Number must be at least 7 characters'),
            first_name: (value) => (value?.trim().length > 0 ? null : 'First name is required'),
            last_name: (value) => (value?.trim().length > 0 ? null : 'Last name is required'),
            email_address: (value) => (value?.trim().length > 0 ? null : 'Email address is required'),
            contact_number: (value) => {
                if (!value || value.trim().length === 0) return 'Contact number is required';
                if (value.trim().length !== 11) return 'Must be exactly 11 digits';
                if (!/^\d+$/.test(value)) return 'Must contain only numbers'; 
                return null; 
            },
            profile_picture: (value) => (value ? null : 'Profile picture is required'),
            e_signature: (value) => (value ? null : 'E-signature is required'),
            birthday: (value) => (value?.trim().length > 0 ? null : 'Birthday is required'),
            gender: (value) => (value?.trim().length > 0 ? null : 'Gender is required'),
            civil_status: (value) => (value?.trim().length > 0 ? null : 'Civil status is required'),
            nationality: (value) => (value?.trim().length > 0 ? null : 'Nationality is required'),
            blood_type: (value) => (value?.trim().length > 0 ? null : 'Blood type is required'),
            address_region_id: (value) => (value?.trim().length > 0 ? null : 'Region is required'),
            address_province_id: (value) => (value?.trim().length > 0 ? null : 'Province is required'),
            address_municipality_id: (value) => (value?.trim().length > 0 ? null : 'Municipality is required'),
            address_barangay_id: (value) => (value?.trim().length > 0 ? null : 'Barangay is required'),
            educ_background: {
                level_id: (value) => (value ? null : 'Level is required'),
                school_id: (value) => (value ? null : 'School is required'),
                period_from: (value) => (value ? null : 'Start year is required'),
                period_to: (value) => (value ? null : 'End year is required'),
                year_graduated: (value) => (value ? null : 'Year graduated is required'),
            },
            fam_background: {
                relation_id: (value) => (value ? null : 'Relationship is required'),
                first_name: (value) => (value?.trim().length > 0 ? null : 'First name required'),
                last_name: (value) => (value?.trim().length > 0 ? null : 'Last name required'),
                contact_number: (value) => {
                    if (!value || value.trim().length === 0) return 'Contact number is required';
                    if (value.trim().length !== 11) return 'Must be exactly 11 digits';
                    if (!/^\d+$/.test(value)) return 'Must contain only numbers'; 
                    return null; 
                },
            }
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- STEPPER & CONSENT STATE ---
    const [activeStep, setActiveStep] = useState(-1);
    const [consentChecked, setConsentChecked] = useState(false);

    // --- PSGC STATE ---
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    
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
    const [familyRelations, setFamilyRelations] = useState([]);
    const [nationalities, setNationalities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [educLevelsResponse, famRelationsResponse, nationalitiesResponse] = await Promise.all([
                    axiosClient.get('/api/mp/fetch/educ-background/levels'),
                    axiosClient.get('/api/mp/fetch/family-background/relations'),
                    axiosClient.get('/api/nationalities')
                ]);
                const levels = educLevelsResponse.data?.levels || educLevelsResponse.data || [];
                const relations = famRelationsResponse.data?.relations || famRelationsResponse.data || [];
                const nationalities = nationalitiesResponse.data || [];

                setAcademicLevels(Array.isArray(levels) ? levels : []);
                setFamilyRelations(Array.isArray(relations) ? relations : []);
                setNationalities(Array.isArray(nationalities) ? nationalities : []);
            } catch (error) {
                console.error("Failed to refetch data:", error);
            }
        };
        fetchData();
    }, [opened]);

    useEffect(() => {
        if (opened) {
            axiosClient.get('/api/psgc/regions') 
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    setRegions(data);
                })
                .catch(err => {
                    console.error("Failed to load regions", err);
                    setRegions([]);
                });
        }
    }, [opened]);

    useEffect(() => {
        if (form.values.address_region_id) {
            axiosClient.get(`/api/psgc/provinces/${form.values.address_region_id}`) // UPDATE ROUTE
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    setProvinces(data);
                })
                .catch(err => {
                    console.error("Failed to load provinces", err);
                    setProvinces([]);
                });
        } else {
            setProvinces([]);
        }
        // Optional but recommended: Reset child fields when the parent changes
        form.setFieldValue('address_province_id', '');
        form.setFieldValue('address_municipality_id', '');
        form.setFieldValue('address_barangay_id', '');
    }, [form.values.address_region_id]);

    useEffect(() => {
        if (form.values.address_province_id) {
            axiosClient.get(`/api/psgc/municipalities/${form.values.address_province_id}`) // UPDATE ROUTE
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    setMunicipalities(data);
                })
                .catch(err => {
                    console.error("Failed to load cities", err);
                    setMunicipalities([]);
                });
        } else {
            setMunicipalities([]);
        }
        // Reset child fields
        form.setFieldValue('address_municipality_id', '');
        form.setFieldValue('address_barangay_id', '');
    }, [form.values.address_province_id]);

    useEffect(() => {
        if (form.values.address_municipality_id) {
            axiosClient.get(`/api/psgc/barangays/${form.values.address_municipality_id}`) 
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    setBarangays(data);
                })
                .catch(err => {
                    console.error("Failed to load barangays", err);
                    setBarangays([]);
                });
        } else {
            setBarangays([]);
        }
        form.setFieldValue('barangay', '');
    }, [form.values.address_municipality_id]);

    // --- DYNAMIC FORM HANDLERS ---
    const addAcademicRecord = () => {
        form.insertListItem('educ_background', { level_id: '', school_id: '', period_from: '', period_to: '', year_graduated: '', honors: '', degree: '', units_earned: '' });
    };

    const removeAcademicRecord = (index) => {
        form.removeListItem('educ_background', index);
    };

    const addFamilyMember = () => {
        form.insertListItem('fam_background', { name: '', relationship: '', occupation: '', contact_number: '' });
    };

    const removeFamilyMember = (index) => {
        form.removeListItem('fam_background', index);
    };

    // --- STEPPER CONTROLS ---
    const nextStep = () => {
        const validation = form.validate();
        const stepFields = {
            0: [ 
                'id_number', 'first_name', 'last_name', 'email_address', 'birthday', 
                'gender', 'civil_status', 'contact_number', 'nationality', 'blood_type', 
                'address_region_id', 'address_province_id', 'address_municipality_id', 
                'address_barangay_id', 'address_zip_code', 'address_street', 'profile_picture', 'e_signature'
            ],
            1: ['educ_background'], 
            2: ['fam_background'], 
        };

        const currentStepFields = stepFields[activeStep] || [];

        const hasErrorInCurrentStep = Object.keys(validation.errors).some((errorKey) => {
            return currentStepFields.some(field => errorKey.startsWith(field));
        });

        if (!hasErrorInCurrentStep) {
            form.clearErrors();
            setActiveStep((current) => current + 1);
        } else {
            console.log("Please fix the errors in the current step.");
        }
    };

    const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

    const handleLogout = (e) => {
        e.preventDefault();
        dispatch(logoutUser());
    };

    // --- SUBMISSION LOGIC ---
    const handleSubmitProfile = async () => {
        const validation = form.validate();
        if (validation.hasErrors) {
            setErrorMessage("Please check the form for errors before submitting.");
            return; 
        }

        setIsSubmitting(true);
        setErrorMessage(null); 

        try {
            const formData = new FormData();
        
            formData.append('profile_data', JSON.stringify(form.values));
            if (profilePic) formData.append('profile_picture', profilePic);
            if (eSignature) formData.append('e_signature', eSignature);
            const response = await axiosClient.post('/api/mp/create-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onClose();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const backendErrors = error.response.data.errors;
                const formattedErrors = {};
                Object.keys(backendErrors).forEach(key => {
                    formattedErrors[key] = backendErrors[key][0]; 
                });
                form.setErrors(formattedErrors);
                setErrorMessage("Some fields are invalid. Please check your inputs.");
                
            } else {
                setErrorMessage(error.response?.data?.message || "An unexpected error occurred during submission.");
            }
        } finally {
            onClose();
            setIsSubmitting(false);
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
                form.setFieldValue('profile_picture', croppedFile);
            } else if (croppingType === 'signature') {
                setSignature(croppedFile);
                form.setFieldValue('e_signature', croppedFile);
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
                To ensure a smooth and efficient pre-enrollment process, it is important that your student profile is complete and up to date. 
                Before getting started, please read the Data Privacy Consent Notice carefully. 
                Your consent is required under the Data Privacy Act of 2012. Once acknowledged, 
                you will be guided to update your personal, academic, and family background information.
            </Text>

            <Alert icon={<IconInfoCircle size={16} />} title="Data Privacy Notice" color="blue" variant="light" radius="lg">
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
                    <LoadingOverlay visible={isCroppingProcess} overlayblur={2} />
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
                    <Group position="right" mt="md" justify="right">
                        <Button variant="light" color="gray" onClick={handleCancelCrop} size="xs">Cancel</Button>
                        <Button color="teal" onClick={handleApplyCrop} size="xs" leftSection={<IconCheck size={16} />}>Apply Crop</Button>
                    </Group>
                </Stack>
            );
        }

        return (
            <Stack spacing="md" p="sm">
                <Alert icon={<IconInfoCircle size={16} />} color="gray" radius="lg">
                    <b>Instructions:</b>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
                        <li>Fields marked with (*) are required. </li>
                        <li>On the <b>e-signature section</b>, upload a picture of your signature with a white background and black ink.</li>
                        <li>On the <b>blood type section</b>, select "Unknown" if you are unsure.</li>
                        <li>Don't leave fields blank. Put <b>N/A</b> if the field is not applicable.</li>
                    </ul>
                </Alert>

                {errorMessage && (
                    <Alert icon={<IconAlertCircle size={16} />} title="Upload Error" color="red" variant="light" withCloseButton onClose={() => setErrorMessage(null)} gap="xs" radius="lg">
                        <Text fz="xs" c="red">{errorMessage}</Text>
                    </Alert>
                )}

                <Title order={4} mt="md">Upload Images</Title>
                
                <Grid gutter="xl" mb="sm">
                    {/* PROFILE PICTURE DROPZONE */}
                    <Grid.Col span={{ base: 12, xl: 6, lg: 6, md: 6, sm: 12 }}>
                        <Stack align="center" spacing="md">
                            <Text fw={600} size="sm" c="dimmed">Profile Picture <Text c="red" span>*</Text></Text>
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
                                            style={{ 
                                                borderStyle: 'dashed', 
                                                borderWidth: 1, 
                                                borderColor: form.errors.profile_picture ? 'var(--mantine-color-red-6)' : 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))',
                                                backgroundColor: form.errors.profile_picture ? 'var(--mantine-color-red-0)' : undefined, 
                                                borderRadius: '10px' 
                                            }}
                                        >
                                            <Group justify="center" gap="xs" style={{ pointerEvents: 'none' }}>
                                                <Dropzone.Accept><IconUpload size={20} color="var(--mantine-color-blue-6)" /></Dropzone.Accept>
                                                <Dropzone.Reject><IconX size={20} color="var(--mantine-color-red-6)" /></Dropzone.Reject>
                                                <Dropzone.Idle><IconPhoto size={40} color="light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))" /></Dropzone.Idle>
                                                <Text size="sm" fw={600} ta="center">Drag image here or click</Text>
                                                <Text size="xs" c="light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))" mt={2} ta="center">Max file size: 2MB</Text>
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
                            <Text fw={600} size="sm" c="dimmed">E-Signature <Text c="red" span>*</Text></Text>
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
                                            style={{ 
                                                borderStyle: 'dashed', 
                                                borderWidth: 1, 
                                                borderColor: form.errors.profile_picture ? 'var(--mantine-color-red-6)' : 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))',
                                                backgroundColor: form.errors.profile_picture ? 'var(--mantine-color-red-0)' : undefined, 
                                                borderRadius: '10px' 
                                            }}
                                        >
                                            <Group justify="center" gap="xs" style={{ pointerEvents: 'none' }}>
                                                <Dropzone.Accept><IconUpload size={20} color="var(--mantine-color-blue-6)" /></Dropzone.Accept>
                                                <Dropzone.Reject><IconX size={20} color="var(--mantine-color-red-6)" /></Dropzone.Reject>
                                                <Dropzone.Idle><IconPhoto size={40} color="light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))" /></Dropzone.Idle>
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

                <Title order={4}>Personal Information</Title>
                
                <ProfileUpdatePage1Form 
                    form={form}
                    nationalities={nationalities}
                    regions={regions}
                    provinces={provinces}
                    municipalities={municipalities}
                    barangays={barangays} 
                />
                
                <Group position="apart" mt="xl" justify="right">
                    <Button variant="subtle" color="gray" onClick={handleLogout}>Logout</Button>
                    <Button variant="light" rightSection={<IconArrowRight size={14}/>} onClick={nextStep}>Next</Button>
                </Group>
            </Stack>
        );
    };

    const renderAcademicBackground = () => (
        <Stack spacing="md" p="sm">
            <Alert icon={<IconInfoCircle size={16} />} color="gray" radius="lg">
                <b>Instructions:</b>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
                    <li>You are requested to provide information pertaining to all the schools that you previously attended.</li>
                    <li>Fields marked with (*) are required. </li>
                    <li>Click the <b>Add Additional Level</b> button for each school attended relative to the year level selected.</li>
                    <li>Do not leave fields blank. Put <b>N/A</b> if the field is not applicable.</li>
                </ul>
            </Alert>
            <Title order={4} mt="md">Academic Background</Title>
            
            {/* Iterating dynamically across the records array */}
            {form.values.educ_background.map((_, index) => (
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
                <Button variant="subtle" leftSection={<IconArrowLeft size={14}/>} color="gray" onClick={prevStep}>Previous</Button>
                <Button variant="light" rightSection={<IconArrowRight size={14}/>} onClick={nextStep}>Next</Button>
            </Group>
        </Stack>
    );

    const renderFamilyBackground = () => (
        <Stack spacing="md" p="sm">
            <Alert icon={<IconInfoCircle size={16} />} color="gray" radius="lg">
                <b>Instructions:</b>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
                    <li>You are requested to provide information pertaining to the immediate family members in your household.</li>
                    <li>Fields marked with (*) are required. </li>
                    <li>Click the <b>Add Additional Member</b> button for each family member.</li>
                    <li>Do not leave fields blank. Put <b>N/A</b> if the field is not applicable.</li>
                </ul>
            </Alert>
            <Title order={4} mt="md">Family Background</Title>
            {form.values.fam_background.map((_, index) => (
                <ProfileUpdatePage3Form 
                    key={index} 
                    index={index}
                    form={form}
                    famRelations={familyRelations}
                    onDelete={removeFamilyMember}
                />
            ))}

            <Button variant="outline" color="green" mt="md" onClick={addFamilyMember}>
                + Add Additional Member
            </Button>

            <Group position="apart" mt="xl" justify="right">
                <Button variant="subtle" leftSection={<IconArrowLeft size={14}/>} color="gray" onClick={prevStep}>Previous</Button>
                <Button variant="light" leftSection={<IconCheck size={14}/>} color="green" onClick={handleSubmitProfile} loading={isSubmitting}>Finish & Submit</Button>
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
            <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}  breakpoint="sm" size="sm">
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