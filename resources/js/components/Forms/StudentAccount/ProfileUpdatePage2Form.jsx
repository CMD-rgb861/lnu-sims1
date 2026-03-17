import { useState, useEffect, useMemo, useRef } from 'react';
import { Grid, Select, TextInput, NumberInput, Button, Paper, Group, Autocomplete } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';

import axiosClient from '../../../api/axiosClient';

const ProfileUpdatePage2Form = ({ form, index, academicLevels, onDelete }) => {
    const isFirstRender = useRef(true);

    // Read the current state of this specific record from the Mantine form
    const currentRecord = form.values.educ_background[index] || {};

    // --- SCHOOL SEARCH LOGIC ---
    const formSchoolValue = currentRecord.school_id || '';
    const [debouncedSearch] = useDebouncedValue(formSchoolValue, 300); 
    const [schoolOptions, setSchoolOptions] = useState([]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (debouncedSearch.length >= 2) {
            axiosClient.get(`/api/mp/fetch/educ-schools/search?term=${debouncedSearch}`)
            .then(response => {
                // setSchoolOptions(response.data?.map(school => ({
                //     value: String(school.id), 
                //     label: school.name 
                // })));
                const stringOptions = response.data?.map(school => school.name) || [];
                setSchoolOptions(stringOptions);
            })
            .catch(error => console.error("Error fetching schools", error));
        } else {
            setSchoolOptions([]);
        }
    }, [debouncedSearch]);

    // const handleSchoolChange = (val) => {
    //     setSearchValue(val); 
    //     form.setFieldValue(`records.${index}.school_id`, val);
    // };

    // --- YEAR GENERATION ---
    const currentYear = new Date().getFullYear();
  
    const fromYears = useMemo(() => {
        return Array.from({ length: currentYear - 1980 + 1 }, (_, i) => (currentYear - i).toString());
    }, [currentYear]);

    const toYears = useMemo(() => {
        const selectedFromYear = currentRecord.period_from;
        const allYears = Array.from({ length: (currentYear + 5) - 1980 + 1 }, (_, i) => String((currentYear + 5) - i));
        if (selectedFromYear) {
            return allYears.filter(year => parseInt(year) >= parseInt(selectedFromYear));
        }
        return allYears;
    }, [currentYear, currentRecord.period_from]);

    const gradYears = useMemo(() => {
        return ['N/A', ...fromYears];
    }, [fromYears]);


    const showDegreeAndUnits = false; 

    return (
        <Paper withBorder px="lg" pt="xl" pb="lg" radius="lg">
            <Grid>
                {/* Row 1: Level & School Name */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Select
                        withAsterisk
                        label="Academic Level"
                        placeholder="Select Academic Level"
                        data={academicLevels.map(level => ({ value: level.id.toString(), label: level.name }))}
                        searchable
                        clearable
                        comboboxProps={{ withinPortal: false }}
                        maxDropdownHeight={200}
                        {...form.getInputProps(`educ_background.${index}.level_id`)}
                    />
                </Grid.Col>
                    
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Autocomplete
                        withAsterisk
                        label="School Name"
                        placeholder="Type to search school..."
                        data={schoolOptions}
                        error={form.errors[`educ_background.${index}.school_id`]}
                        {...form.getInputProps(`educ_background.${index}.school_id`)}
                    />
                </Grid.Col>

                {/* Row 2: Attended From, To, Graduated, Honors */}
                <Grid.Col span={{ base: 12, md: 2 }}>
                    <Select
                        withAsterisk
                        label="Attended From"
                        placeholder="Select Year"
                        data={fromYears}
                        searchable
                        clearable
                        comboboxProps={{ withinPortal: false }}
                        maxDropdownHeight={200}
                        {...form.getInputProps(`educ_background.${index}.period_from`)}
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 2 }}>
                    <Select
                        withAsterisk
                        label="Attended To"
                        placeholder="Select Year"
                        data={toYears}
                        searchable
                        clearable
                        comboboxProps={{ withinPortal: false }}
                        maxDropdownHeight={200}
                        disabled={!currentRecord.period_from} // Safely checks form state
                        {...form.getInputProps(`educ_background.${index}.period_to`)}
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 2 }}>
                    <Select
                        withAsterisk
                        label="Year Graduated"
                        placeholder="Select Year"
                        data={gradYears}
                        searchable
                        clearable
                        comboboxProps={{ withinPortal: false }}
                        maxDropdownHeight={200}
                        {...form.getInputProps(`educ_background.${index}.year_graduated`)}
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Honors Received"
                        placeholder="e.g., Cum Laude, Valedictorian"
                        {...form.getInputProps(`educ_background.${index}.honors`)}
                    />
                </Grid.Col>

                {/* Row 3 (Conditional): Degree & Units Earned */}
                {showDegreeAndUnits && (
                    <>
                        <Grid.Col span={{ base: 12, md: 8 }}>
                            <TextInput
                                label="Senior High School Strand / College Degree"
                                placeholder="Degree or Strand"
                                {...form.getInputProps(`educ_background.${index}.degree`)}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <NumberInput
                                label="Units Earned"
                                placeholder="Units Earned"
                                min={0}
                                {...form.getInputProps(`educ_background.${index}.units_earned`)}
                            />
                        </Grid.Col>
                    </>
                )}

                {/* Row 4: Action Button */}
                <Grid.Col span={12}>
                    <Group justify="right" mt="xs">
                        <Button 
                            color="red" 
                            variant="subtle" 
                            leftSection={<IconTrash size={16} />}
                            onClick={() => onDelete(index)} 
                            fz="xs"
                        >
                            Remove Level
                        </Button>
                    </Group>
                </Grid.Col>
            </Grid>
        </Paper>
    );
};

export default ProfileUpdatePage2Form;