import { useState, useEffect } from "react";
import { Link, Navigate } from 'react-router-dom';
import {
    Title,
    Breadcrumbs,
    Anchor,
    Grid,
    Paper,
    Text,
    Divider,
    Alert,
    Center,
    LoadingOverlay,
    Skeleton,
    Stack,
    Group,
    Box,
    Button,
    SimpleGrid,
    Modal,
    Table,
    ActionIcon,
    List,
    useMantineColorScheme
} from '@mantine/core';
import { 
    IconAlertCircle, 
    IconCheck, 
    IconLock, 
    IconAlertTriangle,
    IconStarFilled,
    IconChevronLeft,
    IconChevronRight
} from '@tabler/icons-react';

import { useAuth } from '../../../hooks/useAuth';
import axiosClient from '../../../api/axiosClient';

const CompactSlot = ({ time, booked, total, onClick, isMyBooking, disabled }) => {
    const [isHovered, setIsHovered] = useState(false);

    const isFull = booked >= total;
    const isInteractable = (!isFull && !disabled) && !isMyBooking;

    let bgColor = 'teal.6'; 
    if (isMyBooking) bgColor = 'blue.6'; 
    else if (isFull) bgColor = 'gray.4'; 

    const opacity = (isFull && !isMyBooking) ? 0.6 : 1; 
    const cursor = (!isInteractable) ? 'not-allowed' : 'pointer';

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={isInteractable ? onClick : undefined}
            bg={bgColor}
            c="white"
            px={{ base: 4, sm: 8 }}
            py={{ base: 4, sm: 4 }}
            mb={4}
            style={{ 
                borderRadius: '6px',
                cursor: cursor,
                opacity: disabled ? 0.5 : opacity,
                borderLeft: isMyBooking ? '3px solid var(--mantine-color-blue-9)' : '3px solid transparent',
                transform: (isInteractable && isHovered) ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.1s ease-in-out',
                position: 'relative',

            }}
            role="button"
        >
            <Group justify="space-between" wrap="nowrap" gap={0} display={{ base: 'none', md: 'flex' }}>
                <Group gap={4} wrap="nowrap">
                    {isMyBooking && <IconStarFilled size={10} color="white" />}
                    <Text fw={700} fz="xs" lh={2}>{time}</Text>
                </Group>
                <Text fz="xs" lh={2} fw={500} opacity={0.9}>
                    {isMyBooking ? 'Your Schedule' : `${booked}/${total} slots`}
                </Text>
            </Group>

            {/* MOBILE VIEW: Centers Time, Hides Fraction to save space */}
            <Center display={{ base: 'flex', md: 'none' }}>
                <Group gap={4} wrap="nowrap">
                    {isMyBooking && <IconStarFilled size={10} color="white" />}
                    <Text fw={700} fz="xs" lh={2}>{time}</Text>
                </Group>
            </Center>
        </Box>
    );
};

// --- Main Component ---
const EnrollmentSchedulePage = () => {
    const { user } = useAuth();

    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const items = [
        { title: 'Home', href: '/dashboard' },
        { title: 'Pre-Enrollment', href: '#' },
        { title: 'Enrollment Schedule', href: '#' }
    ].map((item, index) => (
        <Anchor component={Link} to={item.href} key={index} fz={14} fw={400}>
            {item.title}
        </Anchor>
    ));

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState(null);
    const [bookedSchedule, setBookedSchedule] = useState(null); 
    const [selectedMonth, setSelectedMonth] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        if (user.id) {
            fetchSchedules(); 
            checkMyBooking();
        }
    }, [user.id]);

    useEffect(() => {
        if (schedules.length > 0 && !selectedMonth) {
            setSelectedMonth(schedules[0].monthYear);
        }
    }, [schedules, selectedMonth]);

    const fetchSchedules = async (isBackground = false) => {
        if (!isBackground) setLoading(true); 
        setError(null);
        
        try {
            const res = await axiosClient.get('api/pe/s/fetch/available-schedules');
            if (Array.isArray(res.data)) {
                setSchedules(res.data);
            } else {
                setSchedules([]);
                setError(res.data?.error || 'Invalid schedule data.');
            }
        } catch (err) {
            setSchedules([]);
            setError(err.response?.data?.error || "Could not load schedules. Please refresh.");
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const checkMyBooking = async () => {
        try {
            const res = await axiosClient.get('/api/pe/s/fetch/check-booking');
            if (res.data.exists) {
                setBookedSchedule({
                    dateStr: res.data.formattedDate, 
                    time: res.data.time,
                    rawDate: res.data.date,
                    remarks: res.data.remarks
                });
            }
        } catch (err) {
            console.error("Error checking booking", err);
        }
    };

    const handleSlotSelection = (dayData, time) => {
        if (shouldDisable) return; 

        const scheduleTimeCode = time === 'AM' ? 1 : 2;
        setSelectedSlot({
            date: dayData.date,
            day: dayData.day,
            time: time,
            scheduleId: dayData.scheduleId,
            scheduleTimeCode: scheduleTimeCode,
            bookedCount: dayData.amSlotsCount,
            totalCount: dayData.amSlotsTotal
        });
        setShowModal(true);
    };

    const handleBookingConfirm = async () => {
        if (!selectedSlot) return;
        setBookingLoading(true);
        setError(null);
        
        try {
            const res = await axiosClient.post('api/pe/s/book-schedule', {
                schedule_id: selectedSlot.scheduleId,
                schedule_time: selectedSlot.scheduleTimeCode,
                date: selectedSlot.date,
            });

            const formattedDate = new Date(selectedSlot.date).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
            });
            
            setBookedSchedule({
                dateStr: formattedDate,
                time: selectedSlot.time,
                rawDate: selectedSlot.date
            });

            setShowModal(false);
            fetchSchedules(true); 

        } catch (err) {
            setError(err.response?.data?.error || "Booking failed due to a server error or slot being full.");
        } finally {
            setBookingLoading(false);
            if (!error) setSelectedSlot(null);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSlot(null);
        setError(null);
    };

    // --- Calendar & Date Logic ---
    const currentMonthData = Array.isArray(schedules) ? schedules.find(m => m.monthYear === selectedMonth) : null;
    const currentMonthIndex = schedules.findIndex(m => m.monthYear === selectedMonth);

    let calendarCells = [];
    
    if (currentMonthData && currentMonthData.days.length > 0) {
        const [mStr, yStr] = currentMonthData.monthYear.split(' ');
        const monthDate = new Date(`${mStr} 1, ${yStr}`);
        const firstWeekday = monthDate.getDay(); 

        calendarCells = Array(42).fill(null);

        currentMonthData.days.forEach(day => {
            const safeDate = day.date.replace(/-/g, '/');
            const d = new Date(safeDate);
            
            if (!isNaN(d.getTime())) {
                const cellIndex = firstWeekday + d.getDate() - 1;
                if (cellIndex >= 0 && cellIndex < 42) {
                    calendarCells[cellIndex] = day;
                }
            }
        });
    }

    let trimmedCells = calendarCells;
    if (calendarCells.length) {
        let firstUsed = calendarCells.findIndex(c => c !== null);
        let lastUsed = calendarCells.length - 1 - [...calendarCells].reverse().findIndex(c => c !== null);
        const startRow = Math.floor(firstUsed / 7) * 7;
        const endRow = Math.floor(lastUsed / 7) * 7 + 7;
        trimmedCells = calendarCells.slice(startRow, endRow);
    }

    const isScheduleDone = () => {
        if (!bookedSchedule || !bookedSchedule.rawDate) return false;
        const scheduledDate = new Date(bookedSchedule.rawDate);
        const today = new Date();
        scheduledDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        return scheduledDate < today;
    };

    const shouldDisable = isScheduleDone() || (bookedSchedule && bookedSchedule.remarks === 1);

    const isPastDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    if (loading) {
        return (
            <Grid>
                <Grid.Col span={12}>
                    <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                    <Divider mb="lg" />
                    <Title order={2} mb={4} fw={600} fz={20}>Enrollment Schedule</Title>
                    <Text fz="xs" fw={500} mb="lg" c="dimmed">Select your preferred date for on-site enrollment.</Text>
                    <Paper withBorder radius="lg" p="xl" mb="lg">
                        <Skeleton height={40} width="100%" mb="md" radius="md" />
                        <Skeleton height={400} width="100%" radius="md" />
                    </Paper>
                </Grid.Col>
            </Grid>
        );
    }

    return (
        <Grid>
            <Grid.Col span={12}>
                <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                <Divider mb="lg" />
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                
                <Group mb={4} gap="xs">
                    <Title align="left" order={2} fw={600} fz={20}>
                        Select Enrollment Schedule
                    </Title>
                </Group>
                
                <Text fz="xs" fw={500} mb="lg" c="dimmed">
                    Select your preferred date for on-site enrollment.
                </Text>
                {currentMonthData && (
                    <Alert 
                            icon={<IconAlertCircle size={16} />} 
                            title="Instructions:" 
                            color="gray" 
                            variant="light" 
                            mb="md"
                            radius="lg"
                            py="lg"
                        >
                            <List size="xs" spacing={5} mt={2}>
                                <List.Item>
                                    Click on an available AM or PM slot on the calendar to choose your preferred on-site enrollment schedule.
                                </List.Item>
                                <List.Item>
                                    Clicking an available slot will open a confirmation window. Please review the date and time carefully before confirming.
                                </List.Item>
                                <List.Item>
                                    You may still change schedule as long as slots are still available.
                                </List.Item>
                            </List>
                    </Alert>
                )}
                {/* Alerts Section */}
                <Stack mb="lg">
                    {error && !loading && (
                        <Alert icon={<IconAlertTriangle size={16} />} color="red" radius="md" variant="light">
                            {error}
                        </Alert>
                    )}

                    {bookedSchedule && (
                        <Alert icon={<IconCheck size={16} />} color="green" radius="md" variant="light">
                            <Text fw={600} fz="sm">
                                Your enrollment schedule is set to {bookedSchedule.dateStr} ({bookedSchedule.time})
                            </Text>
                        </Alert>
                    )}

                    {bookedSchedule?.remarks === 1 && (
                        <Alert icon={<IconLock size={16} />} color="yellow" radius="md" variant="light">
                            <Text fw={600} fz="sm">
                                Your enrollment schedule has been finalized and can no longer be modified.
                            </Text>
                        </Alert>
                    )}
                </Stack>

                {/* Professional Calendar Component Area */}
                <Paper withBorder radius="lg" p={0} overflow="hidden">
                    {/* Calendar Header */}
                    <Box p="md">
                        <Group justify="space-between" align="center">
                            <ActionIcon 
                                variant="light" 
                                color="blue" 
                                size="lg" 
                                radius="md"
                                disabled={currentMonthIndex <= 0}
                                onClick={() => setSelectedMonth(schedules[currentMonthIndex - 1]?.monthYear)}
                            >
                                <IconChevronLeft size={20} />
                            </ActionIcon>
                            
                            <Title order={3} fw={700}>
                                {selectedMonth || 'No Schedules'}
                            </Title>

                            <ActionIcon 
                                variant="light" 
                                color="blue" 
                                size="lg" 
                                radius="md"
                                disabled={currentMonthIndex >= schedules.length - 1 || currentMonthIndex === -1}
                                onClick={() => setSelectedMonth(schedules[currentMonthIndex + 1]?.monthYear)}
                            >
                                <IconChevronRight size={20} />
                            </ActionIcon>
                        </Group>
                    </Box>

                    {/* Calendar Grid */}
                    {currentMonthData ? (
                        <Box 
                            style={{ 
                                pointerEvents: shouldDisable ? 'none' : 'auto',
                                opacity: shouldDisable ? 0.7 : 1,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {/* Days of the Week Header */}
                            <SimpleGrid cols={7} spacing={0}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <Text key={d} ta="center" fz="xs" fw={700} c="dimmed" tt="uppercase" py="sm">
                                        {d}
                                    </Text>
                                ))}
                            </SimpleGrid>

                            {/* Calendar Days Matrix */}
                            <SimpleGrid 
                                cols={7} 
                                spacing={1}
                                bg={isDark ? 'dark.8' : 'gray.3'}
                            >
                                {trimmedCells.map((day, index) => {
                                    if (!day) {
                                        return (
                                            <Box key={`empty-${index}`} bg={isDark ? 'dark.9' : 'gray.1'} style={{ minHeight: '110px' }} />
                                        );
                                    }

                                    // Safely parse the date
                                    const safeDate = day.date.replace(/-/g, '/');
                                    const dateObj = new Date(safeDate);
                                    const dayNumber = dateObj.getDate();
                                    
                                    // Check bookings
                                    const isBookedDate = bookedSchedule?.rawDate === day.date;
                                    const isMyAMBooking = isBookedDate && bookedSchedule?.time === 'AM';
                                    const isMyPMBooking = isBookedDate && bookedSchedule?.time === 'PM';
                                    const finalizedBooking = bookedSchedule?.remarks === 1;

                                    // --- NEW TIME LOGIC ---
                                    const now = new Date();
                                    const todayDateObj = new Date();
                                    
                                    // Zero out the times to compare dates accurately
                                    todayDateObj.setHours(0, 0, 0, 0);
                                    dateObj.setHours(0, 0, 0, 0);
                                    
                                    const isToday = dateObj.getTime() === todayDateObj.getTime();
                                    const isPast = dateObj < todayDateObj;
                                    
                                    // AM expires if it's a past date, or if it's today and past 12:00 NN (12)
                                    const isAMExpired = isPast || (isToday && now.getHours() >= 12);
                                    
                                    // PM expires if it's a past date, or if it's today and past 5:00 PM (17)
                                    const isPMExpired = isPast || (isToday && now.getHours() >= 17);
                                    
                                    // The whole day box is visually disabled ONLY if finalized OR both slots are expired
                                    const isDayDisabled = finalizedBooking || (isAMExpired && isPMExpired);

                                    return (
                                        <Box 
                                            key={index} 
                                            bg={
                                                isDayDisabled 
                                                ? (isDark ? 'dark.6' : 'gray.1')
                                                : (isDark ? 'dark.8' : 'white')  
                                            }
                                            p={{ base: 4, sm: 'xs' }}
                                            style={{ 
                                                minHeight: '80px',
                                                display: 'flex', 
                                                flexDirection: 'column' 
                                            }}
                                        >
                                            <Text ta="left" fw={600} fz={{ base: 'lg', sm: 'xl', md: 'xl', lg: 'xl'}} c={isDayDisabled ? "gray.4" : "dark"} mb={8}>
                                                {dayNumber}
                                            </Text>

                                            <CompactSlot
                                                time="AM"
                                                booked={day.amSlotsCount}
                                                total={day.amSlotsTotal}
                                                isMyBooking={isBookedDate && bookedSchedule.time === 'AM'}
                                                onClick={() => handleSlotSelection(day, 'AM')}
                                                disabled={finalizedBooking || isAMExpired || isMyAMBooking}
                                            />

                                            <CompactSlot
                                                time="PM"
                                                booked={day.pmSlotsCount}
                                                total={day.pmSlotsTotal}
                                                isMyBooking={isBookedDate && bookedSchedule.time === 'PM'}
                                                onClick={() => handleSlotSelection(day, 'PM')}
                                                disabled={finalizedBooking || isPMExpired || isMyPMBooking}
                                            />
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        </Box>
                    ) : (
                        <Center p="xl" style={{ minHeight: '300px' }}>
                            <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md" variant="light" p="sm">
                                <Text fw={500} fz="sm">Manual enrollment scheduling only available for Graduate School students</Text>
                            </Alert>
                        </Center>
                    )}
                </Paper>

                {/* Legend */}
                {currentMonthData && (
                    <Group gap="lg" mt="lg" px="xs">
                        <Text fz="sm" fw={600} c="dimmed" tt="uppercase">Legend:</Text>
                        <Group gap={8}>
                            <Box w={16} h={16} bg="teal.6" style={{ borderRadius: '4px' }} />
                            <Text fz="xs" fw={500} c="dimmed">Available</Text>
                        </Group>

                        <Group gap={8}>
                            <Box w={16} h={16} bg="gray.4" style={{ borderRadius: '4px' }} />
                            <Text fz="xs" fw={500} c="dimmed">Fully Booked / Unavailable</Text>
                        </Group>

                        <Group gap={8}>
                            <Box 
                                w={16} 
                                h={16} 
                                bg="blue.6" 
                                style={{ 
                                    borderRadius: '4px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}
                            >
                                <IconStarFilled size={10} color="white" />
                            </Box>
                            <Text fz="xs" fw={500} c="dimmed">Your Chosen Schedule</Text>
                        </Group>
                    </Group>
                )}

                {/* Confirmation Modal */}
                <Modal
                    opened={showModal}
                    onClose={closeModal}
                    title={<Text fw={700} fz="lg">Confirm Schedule</Text>}
                    centered
                    radius="md"
                    closeOnClickOutside={!bookingLoading}
                    closeOnEscape={!bookingLoading}
                    withCloseButton={!bookingLoading}
                >
                    {error && (
                        <Alert icon={<IconAlertTriangle size={16} />} color="red" mb="md" p="xs">
                            {error}
                        </Alert>
                    )}
                    
                    {selectedSlot && (
                        <Table withTableBorder withColumnBorders mb="xl">
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Th w="30%">Date</Table.Th>
                                    <Table.Td>
                                        {new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Th>Time</Table.Th>
                                    <Table.Td><Text fw={700} c="blue">{selectedSlot.time}</Text></Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Th>Availability</Table.Th>
                                    <Table.Td c="dimmed">{selectedSlot.bookedCount} / {selectedSlot.totalCount} slots filled</Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    )}

                    <Group justify="flex-end">
                        <Button variant="light" color="gray" onClick={closeModal} disabled={bookingLoading} size="xs">
                            Cancel
                        </Button>
                        <Button variant="light" color="teal" onClick={handleBookingConfirm} loading={bookingLoading} size="xs">
                            Confirm Slot
                        </Button>
                    </Group>
                </Modal>
            </Grid.Col>
        </Grid>
    );
};

export default EnrollmentSchedulePage;