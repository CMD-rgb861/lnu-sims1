import { useEffect, useState } from 'react';
import {
  Title,
  Breadcrumbs,
  Anchor,
  Grid,
  Paper,
  Skeleton,
  Text,
  Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useModals } from '@mantine/modals';

import axiosClient from '../../api/axiosClient';
import DashboardAlertsModal from '../../components/Modals/DashboardAlertsModal';
import DashboardAlertsTable from '../../components/Tables/DashboardAlertsTable';

const ROWS_PER_PAGE = 10;

const DashboardAlertsPage = () => {
  // Breadcrumbs items
  const items = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Configuration', href: '#' },
    { title: 'Dashboard Alerts', href: '/da' },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} fz={14} fw={400}>
      {item.title}
    </Anchor>
  ));

  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [activePage, setActivePage] = useState(1);

  const [selectedAlert, setSelectedAlert] = useState(null);

  // Handle modal state
  const [
    modalOpened,
    { open: openModal, close: closeModal },
  ] = useDisclosure(false);

  const modals = useModals();

  const refetchData = async () => {
    try {
      const alertsResponse = await axiosClient.get('api/da/data');
      setAlerts(alertsResponse.data.alerts);
    } catch (error) {
      toast.error("Failed to refetch data");
    }
  };

  // Fetch roles and permissions data from the backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch roles and pages in parallel
        const [alertsResponse] = await Promise.all([
          axiosClient.get('api/da/data')
        ]);
        setAlerts(alertsResponse.data.alerts);
      } catch (error) {
        //
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset active page to 1
  useEffect(() => {
    setActivePage(1);
  }, [search]);

  // Sorting function
  const setSorting = (key) => {
    const reversed = key === sortKey ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortKey(key);
  };

  const filteredData = alerts.filter((item) =>
    String(item.title || '').toLowerCase().includes(search.toLowerCase().trim())
  );
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;

    if (sortKey === 'isSuperAdmin') {
      const valA = a.isSuperAdmin ? 1 : 0;
      const valB = b.isSuperAdmin ? 1 : 0;
      return reverseSortDirection ? valA - valB : valB - valA;
    }
    return reverseSortDirection
      ? b[sortKey].localeCompare(a[sortKey])
      : a[sortKey].localeCompare(b[sortKey]);
  });

  // Handle modal functions
  const handleOpenAddModal = () => {
    setSelectedAlert(null); 
    openModal();
  };

  const handleOpenEditModal = (user) => {
    setSelectedAlert(user); 
    openModal();
  };

  const handleSubmit = (values) => {
    if (selectedAlert) {
        handleEditAlert(values);
    } else {
        handleAddAlert(values);
    }
  };
  
  // Handle "Add Page" API call
  const handleAddAlert = async (values) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      await axiosClient.post('api/da/add-alert', values);
      setSearch('');
      closeModal();
    } catch (error) {
      //
    } finally {
      await refetchData();
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Handle "Edit Page" API call
  const handleEditAlert = async (values) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      await axiosClient.put(
        `api/da/${values.id}`,
        values
      );
      await refetchData();
      closeModal();
    } catch (error) {
      //
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Handle "Delete Page" API call
  const handleDeleteAlert = async (id) => {
    setLoading(true);
    try {
      await axiosClient.delete(`api/da/${id}`);
      await refetchData();
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmModal = (alert) => {
    modals.openConfirmModal({
      title: 'Delete this alert message?',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the alert message with title "<strong>{alert.title}</strong>"
            ? This action is permanent and cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete Alert', cancel: "Cancel" },
      color: 'red',
      confirmProps: { color: 'red' },
      onConfirm: () => handleDeleteAlert(alert.id),
    });
  };

  const totalRecords = sortedData.length;
  
  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const start = (activePage - 1) * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;
  const paginatedData = sortedData.slice(start, end);

  if (loading) {
    return (
      <Grid>
        <Grid.Col span={12}>
          <Breadcrumbs mb="md" fw={400} separator=">">
            {[
              { title: 'Home', href: '/dashboard' },
              { title: 'Configuration', href: '#' },
              { title: 'Dashboard Alerts', href: '/da' },
            ].map((item, index) => (
              <Anchor href={item.href} key={index} fz={14} fw={400}>
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>
          <Divider mb="lg" />
          <Title align="left" order={2} mb={4} fw={600} fz={22}>
            Dashboard Alerts
          </Title>
          <Text fz="sm" fw={500} mb="lg" c="dimmed">Create alerts and announcements on users dashboards.</Text>

          <Paper withBorder radius="md" p="lg">
            <Grid>
              <Grid.Col span={4}>
                <Skeleton height={36} width={120} radius="md" />
              </Grid.Col>
              <Grid.Col span={3} offset={5}>
                <Skeleton height={36} radius="md" />
              </Grid.Col>
            </Grid>

            <Skeleton height={30} mt="md" mb="md" radius="md" />

            {Array.from({ length: ROWS_PER_PAGE }).map((_, index) => (
              <Skeleton key={index} height={40} mb="md" radius="md" />
            ))}
          </Paper>
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <>
      <DashboardAlertsModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={handleSubmit}
        alertToEdit={selectedAlert}
        isSubmitting={isSubmitting}
      />
      <Grid>
        <Grid.Col span={12}>
          <Breadcrumbs mb="md" fw={400} separator=">">{items}</Breadcrumbs>
          <Divider mb="lg" />
          <Title align="left" order={2} mb={4} fw={600} fz={22}>
            Dashboard Alerts
          </Title>
          <Text fz="sm" fw={500} mb="lg" c="dimmed">Create alerts and announcements on users dashboards.</Text>

          <DashboardAlertsTable
            data={paginatedData}
            search={search}
            onSearchChange={(event) => setSearch(event.currentTarget.value)}
            onAddAlert={handleOpenAddModal}
            onEditAlert={handleOpenEditModal}
            onDeleteAlert={openDeleteConfirmModal}
            sortKey={sortKey}
            reverseSortDirection={reverseSortDirection}
            onSort={setSorting}
            activePage={activePage}
            totalPages={totalPages}
            onPageChange={setActivePage}
            totalRecords={totalRecords}
            rowsPerPage={ROWS_PER_PAGE}  
          />
        </Grid.Col>
      </Grid>
    </>
  );
};

export default DashboardAlertsPage;