import Dashboard from "./components/dashboard/Dashboard.tsx";
import type JobApplication from "./models/JobApplication.ts";


const App = ({jobData}: { jobData: JobApplication[] }) => {
    return (
        <Dashboard jobData={jobData}/>
    );
};

export default App;
