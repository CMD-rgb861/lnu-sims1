import { Grid, Select, TextInput, Switch, Button, Paper, Group, Divider } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

const FamilyBackgroundForm = ({ form, index, famRelations, onDelete, onUpdateGuardian }) => {
    
    // Safely grab the current record to check for the ID on delete
    const currentRecord = form.values.records[index] || {};

    return (
        <Paper withBorder px="lg" pt="xl" pb="lg" radius="lg">
            <Grid align="flex-end">
                {/* Row 1: Relationship & Guardian Switch */}
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Select
                        withAsterisk
                        label="Relationship"
                        placeholder="Select Relationship"
                        data={famRelations.map(relation => ({ 
                            value: relation.id.toString(), 
                            label: relation.description 
                        }))}
                        searchable
                        clearable
                        {...form.getInputProps(`records.${index}.relation_id`)}
                    />
                </Grid.Col>

                {/* Empty column to push the switch to the right, similar to your col-md-6 */}
                <Grid.Col span={{ base: 12, md: 6 }} display={{ base: 'none', md: 'block' }}></Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Switch
                        labelPosition="right"
                        label="Set as Guardian"
                        color="blue"
                        {...form.getInputProps(`records.${index}.is_guardian`, { type: 'checkbox' })}
                        onChange={(event) => {
                            const isChecked = event.currentTarget.checked;

                            form.values.records.forEach((_, i) => {
                                form.setFieldValue(`records.${i}.is_guardian`, i === index);
                            });

                            if (isChecked && currentRecord.id) {
                                onUpdateGuardian(currentRecord.id);
                            }
                        }}
                    />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        withAsterisk
                        label="First Name"
                        placeholder="First Name"
                        {...form.getInputProps(`records.${index}.first_name`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        label="Middle Name"
                        placeholder="Middle Name"
                        {...form.getInputProps(`records.${index}.middle_name`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        withAsterisk
                        label="Last Name"
                        placeholder="Last Name"
                        {...form.getInputProps(`records.${index}.last_name`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                        label="Extension Name"
                        placeholder="e.g. Jr., Sr."
                        {...form.getInputProps(`records.${index}.ext_name`)}
                    />
                </Grid.Col>

                {/* Row 3: Birthday, Contact, Email */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        type="date"
                        label="Birthday"
                        placeholder="Birthday"
                        {...form.getInputProps(`records.${index}.birthday`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        withAsterisk
                        label="Contact Number"
                        placeholder="Contact Number"
                        {...form.getInputProps(`records.${index}.contact_number`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        label="Email Address"
                        placeholder="Email Address"
                        {...form.getInputProps(`records.${index}.email_address`)}
                    />
                </Grid.Col>

                {/* Row 4: Occupation & Employer */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Occupation"
                        placeholder="Occupation"
                        {...form.getInputProps(`records.${index}.occupation`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Employer"
                        placeholder="Employer"
                        {...form.getInputProps(`records.${index}.employer`)}
                    />
                </Grid.Col>

                {/* Row 5: Employer Details */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Employer Address"
                        placeholder="Employer Address"
                        {...form.getInputProps(`records.${index}.employer_address`)}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Employer Contact"
                        placeholder="Employer Contact Number"
                        {...form.getInputProps(`records.${index}.employer_contact`)}
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

export default FamilyBackgroundForm;