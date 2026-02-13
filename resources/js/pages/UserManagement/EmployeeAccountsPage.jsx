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

import EmployeeAccountsTable from '../../components/Tables/UserManagement/EmployeeAccountsTable';

const ROWS_PER_PAGE = 10;

const EmployeeAccountsPage = () => {
  // Breadcrumbs items
  const items = [
    { title: 'Home', href: '/dashboard' },
    { title: 'User Management', href: '#' },
    { title: 'Employee Acounts', href: '/um/employee-accounts' },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} fz={12} fw={400}>
      {item.title}
    </Anchor>
  ));

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [activePage, setActivePage] = useState(1);

  // Handle modal state
  const [
    modalOpened,
    { open: openModal, close: closeModal },
  ] = useDisclosure(false);

  const modals = useModals();

  const refetchData = async () => {
    try {
      const employeesResponse = await axiosClient.get('api/um/employees/data');
      setEmployees(employeesResponse.data);
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
        const [employeesResponse] = await Promise.all([
          axiosClient.get('api/um/employees/data')
        ]);
        setEmployees(employeesResponse.data);
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

const filteredData = employees.filter((item) => {
    const query = search.toLowerCase().trim();
    return (
        (item.display_name && item.display_name.toLowerCase().includes(query)) ||
        (item.id_number && item.id_number.toLowerCase().includes(query))
    );
});
    
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
    setSelectedEmployee(null); 
    openModal();
  };

  const handleOpenEditModal = (user) => {
    setSelectedEmployee(user); 
    openModal();
  };

  const handleSubmit = (values) => {
    if (selectedEmployee) {
        handleEditEmployee(values);
    } else {
        handleAddEmployee(values);
    }
  };
  
  // Handle "Add Employee" API call
  const handleAddEmployee = async (values) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      await axiosClient.post('api/um/employees/add-employee', values);
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
  const handleEditEmployee = async (values) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      await axiosClient.put(
        `api/um/employees/${values.id}`,
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
  const handleDeleteEmployee = async (id) => {
    setLoading(true);
    try {
      await axiosClient.delete(`api/um/employees/${id}`);
      await refetchData();
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmModal = (employee)=> {
    modals.openConfirmModal({
      title: 'Delete this page?',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the employee account for "<strong>{employee.full_name}</strong>"
            ({employee.student_number})? This action is permanent and cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete Employee Account', cancel: "Cancel" },
      color: 'red',
      confirmProps: { color: 'red' },
      onConfirm: () => handleDeleteEmployee(employee.id),
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
          <Breadcrumbs mb="md" fw={400} fz={12} separator=">">
            {[
              { title: 'Home', href: '/dashboard' },
              { title: 'User Management', href: '#' },
              { title: 'Employee Accounts', href: '/um/employees' },
            ].map((item, index) => (
              <Anchor href={item.href} key={index} fz={12} fw={400}>
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>
          <Divider mb="lg" />
          <Title align="left" order={2} mb={4} fw={600} fz={18}>
            Employee Accounts
          </Title>
          <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage user accounts for employees.</Text>

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
      {/* <PagesManagementModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={handleSubmit}
        employeeToEdit={selectedEmployee}
        isSubmitting={isSubmitting}
      /> */}
      <Grid>
        <Grid.Col span={12}>
          <Breadcrumbs mb="md" fw={400} separator=">">{items}</Breadcrumbs>
          <Divider mb="lg" />
          <Title align="left" order={2} mb={4} fw={600} fz={18}>
            Employee Accounts
          </Title>
          <Text fz="xs" fw={500} mb="lg" c="dimmed">Manage user accounts for employees.</Text>

          <EmployeeAccountsTable
            data={paginatedData}
            search={search}
            onSearchChange={(event) => setSearch(event.currentTarget.value)}
            onAddEmployee={handleOpenAddModal}
            onEditEmployee={handleOpenEditModal}
            onDeleteEmployee={openDeleteConfirmModal}
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

export default EmployeeAccountsPage;