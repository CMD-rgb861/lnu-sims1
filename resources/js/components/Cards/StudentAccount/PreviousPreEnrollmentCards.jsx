import { useState } from 'react';
import { 
    Card, 
    Text, 
    Group, 
    Badge, 
    Divider, 
    SimpleGrid, 
    Pagination, 
    Stack, 
    Box,
    Center
} from '@mantine/core';
import { IconSchool } from '@tabler/icons-react';

// --- Helper Functions ---
const getSemester = (val) => {
    if (val === 1 || val === "1") return 'First Semester';
    if (val === 2 || val === "2") return 'Second Semester';
    if (val === 3 || val === "3") return 'Summer';
    return 'Semester not specified';
};

const getYearLevel = (val) => {
    if (val === 1 || val === "1") return '1st Year';
    if (val === 2 || val === "2") return '2nd Year';
    if (val === 3 || val === "3") return '3rd Year';
    if (val === 4 || val === "4") return '4th Year';
    return 'Year level not specified';
};

const getEnrollmentType = (val) => {
    if (val === 1 || val === "1") return 'New Student';
    if (val === 2 || val === "2") return 'Continuing Student';
    if (val === 3 || val === "3") return 'Shiftee/Returnee';
    if (val === 4 || val === "4") return 'Transferee';
    return 'Enrollment type not specified';
};

const getAcadStanding = (val) => {
    if (val === 1 || val === "1") return { label: 'Regular', color: 'green' };
    if (val === 2 || val === "2") return { label: 'Irregular', color: 'yellow' };
    return { label: 'Pending', color: 'gray' };
};

// --- Single Card Component ---
const RecordCard = ({ record }) => {
    const acadStanding = getAcadStanding(record.acad_standing);

    return (
        <Card withBorder radius="md" p="md">
            {/* Top Image Replacement: Blue Gradient Section */}
            <Card.Section 
                h={100} 
                style={{ 
                    backgroundImage: 'linear-gradient(135deg, rgb(77, 169, 255) 0%, #0471ff 100%)' 
                }} 
            />

            {/* Middle Section: Main Info */}
            <Group mt="md" wrap="nowrap">
                <IconSchool size={20} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text fw={700} fz="lg" lineClamp={1}>
                    {record.program?.program_name || 'Undefined'}
                </Text>
            </Group>

            <Text fz="sm" c="dimmed">
                S.Y. {record.school_year?.school_year_from} - {record.school_year?.school_year_to} 
                {' • '} 
                {getSemester(record.school_year?.semester)}
            </Text>

            {/* Bottom Footer Section: 3-Column Stats (Matching the image style) */}
            <Card.Section inheritPadding mt="sm" pb="md">
                <Divider my="sm" />
                <SimpleGrid cols={3}>
                    <Box>
                        <Text fz="xs" c="dimmed" fw={400} mb={2}>Year Level</Text>
                        <Text fw={600} fz="sm">{getYearLevel(record.year_level)}</Text>
                    </Box>
                    <Box>
                        <Text fz="xs" c="dimmed" fw={400} mb={2}>Type</Text>
                        <Text fw={600} fz="sm">{getEnrollmentType(record.enrollment_type)}</Text>
                    </Box>
                    <Box>
                        <Text fz="xs" c="dimmed" fw={400} mb={2}>Standing</Text>
                        <Text fw={600} fz="sm" c={acadStanding.color}>{acadStanding.label}</Text>
                    </Box>
                </SimpleGrid>
            </Card.Section>
        </Card>
    );
};

// --- Main Container with Pagination ---
const PreviousPreEnrollmentCards = ({ records = [] }) => {
    const [activePage, setActivePage] = useState(1);
    const ITEMS_PER_PAGE = 3;

    // Calculate pagination slices
    const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
    const paginatedRecords = records.slice(
        (activePage - 1) * ITEMS_PER_PAGE,
        activePage * ITEMS_PER_PAGE
    );

    if (records.length === 0) {
        return null; 
    }

    return (
        <Stack gap="xl">
            {/* Display up to 3 cards in a responsive grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                {paginatedRecords.map((record) => (
                    <RecordCard key={record.id} record={record} />
                ))}
            </SimpleGrid>

            {/* Render Pagination only if there is more than 1 page */}
            {totalPages > 1 && (
                <Center mt="md">
                    <Pagination 
                        total={totalPages} 
                        value={activePage} 
                        onChange={setActivePage} 
                        color="blue" 
                        size="sm"
                        radius="md"
                        withEdges 
                    />
                </Center>
            )}
        </Stack>
    );
};

export default PreviousPreEnrollmentCards;