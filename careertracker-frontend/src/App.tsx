import { JobApplicationProvider } from './context/JobApplicationContext';
import { jobData } from './Constants';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from "./components/dashboard/Dashboard.tsx";
import AddApplicationPage from './pages/AddApplicationPage';
import EditApplicationPage from './pages/EditApplicationPage';
import ViewApplicationPage from './pages/ViewApplicationPage';


const App = () => {

    const usersJobApplications = jobData; // Replace with actual data fetching logic
    
    return (
        <JobApplicationProvider initialJobApplications={usersJobApplications}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/add" element={<AddApplicationPage />} />
                    <Route path="/edit/:id" element={<EditApplicationPage />} />
                    <Route path="/view/:id" element={<ViewApplicationPage />} />
                </Routes>
            </BrowserRouter>
        </JobApplicationProvider>
    );
};

export default App;
