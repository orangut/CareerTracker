import Dashboard from "./components/dashboard/Dashboard.tsx";
import { JobApplicationProvider } from './context/JobApplicationContext';
import { jobData } from './Constants';


const App = () => {

    const usersJobApplications = jobData; // Replace with actual data fetching logic
    
    return (
        <JobApplicationProvider initialJobApplications={usersJobApplications}>
            <Dashboard />
        </JobApplicationProvider>
    );
};

export default App;
