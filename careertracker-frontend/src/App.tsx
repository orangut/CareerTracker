import { JobApplicationProvider } from './context/JobApplicationContext';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.tsx';
import { UserProvider } from './context/UserContext.tsx';


const App = () => {
    return (
        <UserProvider>
            <JobApplicationProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </JobApplicationProvider>
        </UserProvider>
    );
};

export default App;