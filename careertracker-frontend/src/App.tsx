import { JobApplicationProvider } from './context/JobApplicationContext';
import { jobData } from './Constants';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.tsx';
import { UserProvider } from './context/UserContext.tsx';


const App = () => {
    const usersJobApplications = jobData; // Replace with actual data fetching logic

    return (
        <UserProvider>
            <JobApplicationProvider initialJobApplications={usersJobApplications}>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </JobApplicationProvider>
        </UserProvider>
    );
};

export default App;