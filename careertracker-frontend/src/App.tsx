import {useState} from 'react';
import Dashboard from "./components/dashboard/Dashboard";
import {jobData as initialJobData} from "./Constants";
import JobApplication from "./models/JobApplication";
import {v4 as uuidv4} from 'uuid';
import AddApplicationPage from "./components/addApplication/AddApplication";


const App = () => {
    const [jobData, setJobData] = useState<JobApplication[]>(initialJobData);
    const [page, setPage] = useState<'dashboard' | 'addApplication'>('dashboard');

    const handleAddApplication = (newJob: Omit<JobApplication, 'id' | 'isEdit'>) => {
        const newJobWithId: JobApplication = {
            ...newJob,
            id: uuidv4(),
            isEdit: true,
        };
        setJobData([...jobData, newJobWithId]);
    };

    const navigateToDashboard = () => {
        setPage('dashboard');
    };

    const navigateToAddApplication = () => {
        setPage('addApplication');
    };

    if (page === 'addApplication') {
        return <AddApplicationPage onGoBack={navigateToDashboard} onSubmit={handleAddApplication}/>;
    }

    return <Dashboard jobData={jobData} setJobData={setJobData} onNavigateToAddApplication={navigateToAddApplication}/>;
};

export default App;
