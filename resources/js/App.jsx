import './App.css';
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './store/slices/AuthSlice';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { ToastContainer } from 'react-toastify';

// pages and components
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';

// layouts and routes
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute'
import EmployeeAccountsPage from './pages/EmployeeAccount/UserManagement/EmployeeAccountsPage';
import PersonalInformationPage from './pages/StudentAccount/MyProfile/PersonalInformationPage';
import EducationalBackgroundPage from './pages/StudentAccount/MyProfile/EducationalBackgroundPage';
import FamilyBackgroundPage from './pages/StudentAccount/MyProfile/FamilyBackgroundPage';
import Error404Page from './pages/Errors/Error404Page';
import PreEnrollmentRecordsPage from './pages/StudentAccount/PreEnrollment/PreEnrollmentRecordsPage';

function App() {
    const dispatch = useDispatch();
    const status = useSelector((state) => state.auth.status);
    useEffect(() => {
      if (status === 'idle') {
        dispatch(fetchUser()).catch(() => {});
      }
    }, [status, dispatch]);

    // Custom Mantine theme props
    const theme = createTheme({
      fontFamily: 'Poppins, sans-serif',
      colors: {
        myColor: [
          "#f1f4fe",
          "#cde2ff",
          "#9ac2ff",
          "#64a0ff",
          "#3884fe",
          "#1d72fe",
          "#0063ff",
          "#0058e4",
          "#004ecd",
          "#0043b5"
        ],
      }
    });
    
    return (
        <MantineProvider 
          withGlobalStyles 
          withNormalizeCSS
          theme={theme}
        >
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <ModalsProvider>
            <Routes>
                {/* --- PUBLIC ROUTES --- */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />

                
                {/* --- PROTECTED ROUTES --- */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />

                        {/* --- PROTECTED ROUTES FOR STUDENT ACCOUNTs --- */}
                        <Route path="/mp/personal-information" element={<PersonalInformationPage />} />
                        <Route path="/mp/educational-background" element={<EducationalBackgroundPage />} />
                        <Route path="/mp/family-background" element={<FamilyBackgroundPage />} />

                        <Route path="/pe/records" element={<PreEnrollmentRecordsPage />} />

                        {/* --- PROTECTED ROUTES FOR EMPLOYEE ACCOUNTs --- */}
                        <Route path="/um/employees" element={<EmployeeAccountsPage />} />
                    </Route>
                </Route>

                {/* --- NOT FOUND --- */}
                <Route path="*" element={<Error404Page />} />
            </Routes>
          </ModalsProvider>
        </MantineProvider>
    );
}   

export default App;
