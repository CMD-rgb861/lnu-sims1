import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Grid,
  TextInput,
  NumberInput,
  Button,
  LoadingOverlay,
  Fieldset,
  Stack,
  Group,
  Stepper,
  Select,
  Text
} from '@mantine/core';
import { useForm } from '@mantine/form';

const BlotterModal = ({
  opened,
  onClose,
  onSubmit,
  pageToEdit,
  isSubmitting,
  allNationalitiesData,
  allRegionsData,
  allProvincesData,
  allMunicipalitiesData,
  allBarangaysData,
  onRegionChange,
  onProvinceChange,
  onMunicipalityChange,
}) => {

  const isEditMode = !!pageToEdit;

  const [active, setActive] = useState(1);
  const [highestStepVisited, setHighestStepVisited] = useState(active);

  const handleStepChange = (nextStep) => {
    const isOutOfBounds = nextStep > 3 || nextStep < 0;

    if (isOutOfBounds) {
        return;
    }
    setActive(nextStep);
    setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
  };

  // Allow the user to freely go back and forth between visited steps.
  const shouldAllowSelectStep = (step) => {
    return highestStepVisited >= step && active !== step;
  };

  const nationalitiesOptions = useMemo(
    () =>
      allNationalitiesData.nationalities.map((nationality) => ({
        value: String(nationality.id),
        label: nationality.nationality,
      })),
    [allNationalitiesData.nationalities]
  );

  const regionOptions = useMemo(
    () =>
      allRegionsData.regions.map((region) => ({
        value: String(region.id),
        label: region.name,
      })),
    [allRegionsData.regions]
  );

  const provinceOptions = useMemo(() => {
    if (!allProvincesData.provinces || !Array.isArray(allProvincesData.provinces)) {
        return []; 
    }
    return allProvincesData.provinces.map((province) => ({
        value: String(province.id), 
        label: province.name,       
    }));
 }, [allProvincesData.provinces]);

 const municipalityOptions = useMemo(() => {
    if (!allMunicipalitiesData.municipalities || !Array.isArray(allMunicipalitiesData.municipalities)) {
        return []; 
    }
    return allMunicipalitiesData.municipalities.map((municipality) => ({
        value: String(municipality.id), 
        label: municipality.name,       
    }));
 }, [allMunicipalitiesData.municipalities]);

 const barangayOptions = useMemo(() => {
    if (!allBarangaysData.barangays || !Array.isArray(allBarangaysData.barangays)) {
        return []; 
    }
    return allBarangaysData.barangays.map((barangay) => ({
        value: String(barangay.id), 
        label: barangay.name,       
    }));
 }, [allBarangaysData.barangays]);

  const noNationalities = nationalitiesOptions.length === 0;
  const noRegions = regionOptions.length === 0;
  const noProvinces = provinceOptions.length === 0;
  const noMunicipalities = municipalityOptions.length === 0;
  const noBarangays = barangayOptions.length === 0;

  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
    },
    validate: {
      name: (value) => value.trim().length > 0 ? null : 'Page name is required',
      slug: (value) => value.trim().length > 0 ? null : 'Page slug is required',
    },
  });

  useEffect(() => {
    if (isEditMode && pageToEdit) {

      form.setValues({
        name: pageToEdit.name || '',
        slug: pageToEdit.slug || '',
      });
    } else {
      form.reset();
    }
  }, [opened, isEditMode, pageToEdit]); 

  const handleSubmit = (values) => {
    const submissionData = isEditMode ? { ...values, id: pageToEdit.id } : values;
    onSubmit(submissionData);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? `Edit Blotter Record` : 'Add Blotter Record'}
      size="50%"
    >
    <LoadingOverlay visible={isSubmitting} overlayBlur={2} />
    <Grid>
        <Grid.Col span={12}>
            <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
                <Stepper.Step
                label="Blotter Subjects"
                description="Enter blotter subject details"
                >
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Fieldset legend="Complainant">
                            <Stack>
                                <Grid>
                                    <Grid.Col span={4} sm={4}>
                                    <TextInput
                                        label="First Name"
                                        placeholder="e.g. Juan"
                                        {...form.getInputProps('first_name')}
                                    />
                                    </Grid.Col>
                                    <Grid.Col span={4} sm={4}>
                                    <TextInput
                                        label="Middle Name"
                                        placeholder="e.g. Santos"
                                        {...form.getInputProps('middle_name')}
                                    />
                                    </Grid.Col>
                                    <Grid.Col span={4} sm={4}>
                                    <TextInput
                                        label="Last Name"
                                        placeholder="e.g. Dela Cruz"
                                        {...form.getInputProps('last_name')}
                                    />
                                    </Grid.Col>
                                </Grid>
                                <Grid>
                                    <Grid.Col span={2} sm={4}>
                                        <TextInput
                                            label="Extension"
                                            placeholder="e.g. Jr."
                                            {...form.getInputProps('ext_name')}
                                        />
                                        </Grid.Col>
                                    <Grid.Col span={4} sm={4}>
                                    <TextInput
                                        label="Alias/Nickname"
                                        placeholder="e.g. Totoy"
                                        {...form.getInputProps('alias')}
                                    />
                                    </Grid.Col>
                                    <Grid.Col span={2} sm={4}>
                                        <NumberInput
                                            label="Age"
                                            min={1}
                                            max={100}
                                            allowDecimal={false}
                                            allowNegative={false}
                                            {...form.getInputProps('age')}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4} sm={4}>
                                        <Select
                                            label="Gender"
                                            data={[
                                                { value: "1", label: "Male" },
                                                { value: "2", label: "Female" },
                                            ]}
                                            defaultValue="1"
                                            allowDeselect={false}
                                            {...form.getInputProps('gender')}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Grid>
                                    <Grid.Col span={4} sm={4}>
                                        <TextInput
                                            label="Contact Number"
                                            placeholder="e.g. 09501234567"
                                            {...form.getInputProps('contact_number')}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4} sm={4}>
                                        <Select
                                            label="Civil Status"
                                            data={[
                                                { value: "1", label: "Single" },
                                                { value: "2", label: "Married" },
                                                { value: "3", label: "Cohabitation" },
                                                { value: "4", label: "Annulled/Divorced" },
                                                { value: "5", label: "Widow/Widower" },
                                            ]}
                                            defaultValue="1"
                                            allowDeselect={false}
                                            {...form.getInputProps('civil_status')}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4} sm={4}>
                                        <Select
                                            label="Nationality"
                                            placeholder={
                                                noNationalities ? "No nationalities available" : "Select Nationality"
                                            }
                                            data={nationalitiesOptions}
                                            searchable
                                            clearable
                                            value={form.values.nationality_id ? String(form.values.nationality_id) : null}
                                            error={form.errors.nationality_id}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Text fz="sm" fw={500} c="dimmed">Address:</Text>
                                <Grid>
                                    <Grid.Col span={4} sm={4}>
                                        <Select
                                            label="Region"
                                            placeholder={
                                                noRegions ? "No Regions available" : "Select Region"
                                            }
                                            data={regionOptions}
                                            searchable
                                            clearable
                                            value={form.values.region_id ? String(form.values.region_id) : null}
                                            onChange={(value) => {
                                                form.setFieldValue('region_id', value);
                                                onRegionChange(value);

                                                form.setFieldValue('province_id', null);
                                                form.setFieldValue('municipality_id', null);
                                                form.setFieldValue('barangay_id', null);
                                            }}
                                            error={form.errors.region_id}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Grid>
                                    <Grid.Col span={4} sm={4}>
                                        <Select
                                            label="Province"
                                            placeholder={
                                                noProvinces ? "No Provinces available" : "Select Province"
                                            }
                                            data={provinceOptions}
                                            searchable
                                            clearable
                                            value={form.values.province_id ? String(form.values.province_id) : null}
                                            onChange={(value) => {
                                                form.setFieldValue('province_id', value);
                                                onProvinceChange(value);
                                                
                                                form.setFieldValue('municipality_id', null);
                                                form.setFieldValue('barangay_id', null);
                                            }}
                                            error={form.errors.province_id}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4} sm={4}>
                                        <Select
                                            label="Municipality/City"
                                            placeholder={
                                                noMunicipalities ? "No Municipalities/Cities available" : "Select Municipality/City"
                                            }
                                            data={municipalityOptions}
                                            searchable
                                            clearable
                                            value={form.values.municipality_id ? String(form.values.municipality_id) : null}
                                            onChange={(value) => {
                                                form.setFieldValue('municipality_id', value);
                                                onMunicipalityChange(value);

                                                form.setFieldValue('barangay_id', null);
                                            }}
                                            error={form.errors.municipality_id}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4} sm={4}>
                                        <Select
                                            label="Barangay"
                                            placeholder={
                                                noBarangays ? "No barangays available" : "Select Barangay"
                                            }
                                            data={barangayOptions}
                                            searchable
                                            clearable
                                            value={form.values.barangay_id ? String(form.values.barangay_id) : null}
                                            error={form.errors.barangay_id}
                                        />
                                    </Grid.Col>
                                </Grid>
                            </Stack>
                        </Fieldset>
                        
                    </form>
                    <Group justify="flex-end" mt="lg">
                        <Button variant="light" color="gray" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="green"
                            variant="light"
                            loading={isSubmitting}
                        >
                            {isEditMode ? 'Save Changes' : 'Add Page'}
                        </Button>
                    </Group>
                </Stepper.Step>
                <Stepper.Step
                label="Blotter Information"
                description="Enter blotter details"
                >
                Step 2 content: Verify email
                </Stepper.Step>

                <Stepper.Completed>
                Completed, click back button to get to previous step
                </Stepper.Completed>
            </Stepper>
        </Grid.Col>
    </Grid>
    </Modal>
  );
};

export default BlotterModal;