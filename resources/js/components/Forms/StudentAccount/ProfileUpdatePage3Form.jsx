import React from 'react';
import { Grid, Select, TextInput, Switch, Button, Paper, Group, Divider } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

const ProfileUpdatePage3Form = ({ form, index, famRelations, onDelete }) => {
    
    // Safely grab the current record to check for the ID on delete
    const currentRecord = form.values.fam_background[index] || {};

    return (
        <Paper withBorder px="lg" pt="xl" pb="lg" radius="lg" mb="md">
            <Grid align="flex-end">
                {/* Row 1: Relationship & Guardian Switch */}
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Select
                        withAsterisk
                        label="Relationship"
                        placeholder="Select Relationship"
                        data={(Array.isArray(famRelations) ? famRelations : [])
                            .filter(relation => relation !== null && typeof relation === 'object')
                            .map(relation => ({ 
                                value: String(relation.id || relation.relation_id || relation.value || ''), 
                                label: String(relation.description || relation.name || relation.label || 'Unknown') 
                            }))
                            .filter(item => item.value !== '')
                        }
                        searchable
                        clearable
                        comboboxProps={{ withinPortal: false }}
                        maxDropdownHeight={200}
                        {...form.getInputProps(`fam_background.${index}.relation_id`)}
                    />
                </Grid.Col>

                {/* Empty column to push the switch to the right */}
                <Grid.Col span={{ base: 12, md: 6 }} display={{ base: 'none', md: 'block' }}></Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Switch
                        labelPosition="right"
                        label="Set as Guardian"
                        color="blue"
                        checked={currentRecord.is_guardian || false}
                        onChange={(event) => {
                        const isChecked = event.currentTarget.checked;

                        if (isChecked) {
                            form.values.fam_background.forEach((_, i) => {
                                form.setFieldValue(`fam_background.${i}.is_guardian`, i === index);
                            });
                        } else {
                            form.setFieldValue(`fam_background.${index}.is_guardian`, false);
                        }
                    }}
                    />
                </Grid.Col>
                
                {/* Row 2: Names */}
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        withAsterisk
                        label="First Name"
                        placeholder="First Name"
                        {...form.getInputProps(`fam_background.${index}.first_name`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        label="Middle Name"
                        placeholder="Middle Name"
                        {...form.getInputProps(`fam_background.${index}.middle_name`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        withAsterisk
                        label="Last Name"
                        placeholder="Last Name"
                        {...form.getInputProps(`fam_background.${index}.last_name`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        label="Extension Name"
                        placeholder="e.g. Jr., Sr."
                        {...form.getInputProps(`fam_background.${index}.ext_name`)}
                    />
                </Grid.Col>

                {/* Row 3: Birthday, Contact, Email */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        type="date"
                        label="Birthday"
                        placeholder="Birthday"
                        {...form.getInputProps(`fam_background.${index}.birthday`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        withAsterisk
                        label="Contact Number"
                        placeholder="Contact Number"
                        {...form.getInputProps(`fam_background.${index}.contact_number`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        label="Email Address"
                        placeholder="Email Address"
                        {...form.getInputProps(`fam_background.${index}.email_address`)}
                    />
                </Grid.Col>

                {/* Row 4: Occupation & Employer */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Occupation"
                        placeholder="Occupation"
                        {...form.getInputProps(`fam_background.${index}.occupation`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Employer"
                        placeholder="Employer"
                        {...form.getInputProps(`fam_background.${index}.employer`)}
                    />
                </Grid.Col>

                {/* Row 5: Employer Details */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Employer Address"
                        placeholder="Employer Address"
                        {...form.getInputProps(`fam_background.${index}.employer_address`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Employer Contact"
                        placeholder="Employer Contact Number"
                        {...form.getInputProps(`fam_background.${index}.employer_contact`)}
                    />
                </Grid.Col>

                {/* Row 6: Action Button */}
                <Grid.Col span={12}>
                    <Divider my="sm" />
                    <Group justify="right">
                        <Button 
                            color="red" 
                            variant="subtle" 
                            leftSection={<IconTrash size={16} />}
                            onClick={() => onDelete(index, currentRecord.id)}
                            fz="xs"
                        >
                            Remove Member
                        </Button>
                    </Group>
                </Grid.Col>
            </Grid>
        </Paper>
    );
};

export default ProfileUpdatePage3Form;