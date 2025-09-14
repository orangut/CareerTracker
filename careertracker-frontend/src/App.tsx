import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { JobApplicationProvider } from './context/JobApplicationContext';
import { jobData } from './Constants';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from "./components/dashboard/Dashboard.tsx";
import AddApplicationPage from './pages/AddApplicationPage';
import EditApplicationPage from './pages/EditApplicationPage';
import ViewApplicationPage from './pages/ViewApplicationPage';
import NotificationPage from './pages/NotificationPage';
import DrawerMenu from './components/DrawerMenu.tsx'; 
import Header from './components/Header.tsx';


const App = () => {
    const usersJobApplications = jobData; // Replace with actual data fetching logic
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const drawerWidth = 230; // Width of the hamburger menu drawer

    const [username, setUsername] = useState("John Doe"); // Placeholder for the user's name
    const [notificationCount, setNotificationCount] = useState(5); // Placeholder for notification count

    return (
        <JobApplicationProvider initialJobApplications={usersJobApplications}>
            <BrowserRouter>
                <DrawerMenu  open={isMenuOpen} onToggle={setIsMenuOpen}/>
                 {/* Main Content Container with Sliding Effect */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        transition: 'margin-left .3s',
                        marginLeft: isMenuOpen ? `${drawerWidth}px` : 0,
                    }}
                >
                    <Header username={username} notificationCount={notificationCount} />

                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/add" element={<AddApplicationPage />} />
                        <Route path="/edit/:id" element={<EditApplicationPage />} />
                        <Route path="/view/:id" element={<ViewApplicationPage />} />
                        <Route path="/notifaction" element={<NotificationPage />} />
                    </Routes>
                </Box>
            </BrowserRouter>
        </JobApplicationProvider>
    );
};

export default App;