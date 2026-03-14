import React from 'react';
import { Grid, Select, TextInput, Switch, Button, Paper, Group, Divider } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

const ProfileUpdatePage3Form = ({ form, index, famRelations, onDelete }) => {
    
    // Safely grab the current record to check for the ID on delete
    const currentRecord = form.values.family_members[index] || {};

    return (
        <Paper withBorder px="lg" pt="xl" pb="lg" radius="lg" mb="md">
            <Grid align="flex-end">
                {/* Row 1: Relationship & Guardian Switch */}
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Select
                        withAsterisk
                        label="Relationship"
                        placeholder="Select Relationship"
                        data={(Array.isArray(famRelations) ? famRelations : []).map(relation => ({ 
                            value: relation.id?.toString() || '', 
                            label: relation.description || 'Unknown' 
                        }))}
                        searchable
                        clearable
                        {...form.getInputProps(`family_members.${index}.relation_id`)}
                    />
                </Grid.Col>

                {/* Empty column to push the switch to the right */}
                <Grid.Col span={{ base: 12, md: 6 }} display={{ base: 'none', md: 'block' }}></Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Switch
                        labelPosition="right"
                        label="Set as Guardian"
                        color="blue"
                        {...form.getInputProps(`family_members.${index}.is_guardian`, { type: 'checkbox' })}
                    />
                </Grid.Col>
                
                {/* Row 2: Names */}
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        withAsterisk
                        label="First Name"
                        placeholder="First Name"
                        {...form.getInputProps(`family_members.${index}.first_name`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        label="Middle Name"
                        placeholder="Middle Name"
                        {...form.getInputProps(`family_members.${index}.middle_name`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        withAsterisk
                        label="Last Name"
                        placeholder="Last Name"
                        {...form.getInputProps(`family_members.${index}.last_name`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        label="Extension Name"
                        placeholder="e.g. Jr., Sr."
                        {...form.getInputProps(`family_members.${index}.ext_name`)}
                    />
                </Grid.Col>

                {/* Row 3: Birthday, Contact, Email */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        type="date"
                        label="Birthday"
                        placeholder="Birthday"
                        {...form.getInputProps(`family_members.${index}.birthday`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        withAsterisk
                        label="Contact Number"
                        placeholder="Contact Number"
                        {...form.getInputProps(`family_members.${index}.contact_number`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        label="Email Address"
                        placeholder="Email Address"
                        {...form.getInputProps(`family_members.${index}.email_address`)}
                    />
                </Grid.Col>

                {/* Row 4: Occupation & Employer */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Occupation"
                        placeholder="Occupation"
                        {...form.getInputProps(`family_members.${index}.occupation`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Employer"
                        placeholder="Employer"
                        {...form.getInputProps(`family_members.${index}.employer`)}
                    />
                </Grid.Col>

                {/* Row 5: Employer Details */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Employer Address"
                        placeholder="Employer Address"
                        {...form.getInputProps(`family_members.${index}.employer_address`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Employer Contact"
                        placeholder="Employer Contact Number"
                        {...form.getInputProps(`family_members.${index}.employer_contact`)}
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