import { useState, useEffect, useMemo } from 'react';
import { Grid, Select, TextInput, NumberInput, Button, Paper, Group, Autocomplete, Divider } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import axiosClient from '../../../api/axiosClient';

const EducationalBackgroundForm = ({ form, index, academicLevels, onChange, onDelete }) => {

    const currentRecord = form.values.records[index] || {};

    const [searchValue, setSearchValue] = useState(
        currentRecord.school?.name || ''
    );
    const [debouncedSearch] = useDebouncedValue(searchValue, 300); 
    const [schoolOptions, setSchoolOptions] = useState([]);

    useEffect(() => {
        if (debouncedSearch.length >= 2) {
            axiosClient.get(`/api/mp/fetch/educ-schools/search?term=${debouncedSearch}`)
            .then(response => {
            setSchoolOptions(response.data || []);
            })
            .catch(error => console.error("Error fetching schools", error));
        } else {
        setSchoolOptions([]);
        }
    }, [debouncedSearch]);

    const handleSchoolChange = (val) => {
        setSearchValue(val); 
        form.setFieldValue(`records.${index}.school_id`, val);
    };

    const currentYear = new Date().getFullYear();
  
    const fromYears = useMemo(() => {
        return Array.from({ length: currentYear - 1980 + 1 }, (_, i) => (currentYear - i).toString());
    }, [currentYear]);

    const toYears = useMemo(() => {
        const startYear = parseInt(currentRecord?.period_from) || 1900;
        const maxStart = Math.max(startYear, 1900);
        return Array.from({ length: currentYear - maxStart + 1 }, (_, i) => (currentYear - i).toString());
    }, [currentRecord?.period_from, currentYear]);

    const gradYears = useMemo(() => {
        return ['N/A', ...fromYears];
    }, [fromYears]);

    const handleChange = (field, value) => {
        onChange(index, field, value);
    };

    const showDegreeAndUnits = currentRecord?.level_id == 5 || currentRecord?.level_id == 6;

    return (
        <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                    withAsterisk
                    label="Academic Level"
                    placeholder="Select Academic Level"
                    data={academicLevels.map(level => ({ value: level.id.toString(), label: level.name }))}
                    searchable
                    clearable
                    {...form.getInputProps(`records.${index}.level_id`)}
                />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 8 }}>
                <Autocomplete
                    withAsterisk
                    label="School Name"
                    placeholder="Type to search school..."
                    data={schoolOptions}
                    value={searchValue}
                    onChange={handleSchoolChange}
                    maxDropdownHeight={200}
                    error={form.errors[`records.${index}.school_id`]}
                />
                </Grid.Col>

                {/* Row 2: Attended From, To, Graduated, Honors */}
                <Grid.Col span={{ base: 12, md: 2 }}>
                <Select
                    withAsterisk
                    label="Attended From"
                    placeholder="Select Year"
                    data={fromYears}
                    onChange={(val) => handleChange('period_from', val)}
                    searchable
                    clearable
                    {...form.getInputProps(`records.${index}.period_from`)}
                />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 2 }}>
                <Select
                    withAsterisk
                    label="Attended To"
                    placeholder="Select Year"
                    data={toYears}
                    onChange={(val) => handleChange('period_to', val)}
                    searchable
                    clearable
                    disabled={!currentRecord.period_from}
                    {...form.getInputProps(`records.${index}.period_to`)}
                />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 2 }}>
                <Select
                    withAsterisk
                    label="Year Graduated"
                    placeholder="Select Year"
                    data={gradYears}
                    onChange={(val) => handleChange('year_graduated', val)}
                    searchable
                    clearable
                    {...form.getInputProps(`records.${index}.year_graduated`)}
                />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                    label="Honors Received"
                    placeholder="e.g., Cum Laude, Valedictorian"
                    onChange={(e) => handleChange('honors', e.currentTarget.value)}
                    {...form.getInputProps(`records.${index}.honors`)}
                />
                </Grid.Col>

                {/* Row 3 (Conditional): Degree & Units Earned */}
                {showDegreeAndUnits && (
                <>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                    <TextInput
                        label="Senior High School Strand / College Degree"
                        placeholder="Degree or Strand"
                        onChange={(e) => handleChange('degree', e.currentTarget.value)}
                        {...form.getInputProps(`records.${index}.degree`)}
                    />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                        label="Units Earned"
                        placeholder="Units Earned"
                        onChange={(val) => handleChange('units_earned', val)}
                        min={0}
                        {...form.getInputProps(`records.${index}.units_earned`)}
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
                        onClick={() => onDelete(index, currentRecord.id)}
                        fz="xs"
                    >
                    Remove Level
                    </Button>
                </Group>
                 <Divider my="md" />
            </Grid.Col>
        </Grid>
    );
};

export default EducationalBackgroundForm;