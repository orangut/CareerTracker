
import { Routes, Route } from 'react-router-dom';

import Dashboard from '../components/dashboard/Dashboard';
import AddApplicationPage from '../pages/AddApplicationPage';
import EditApplicationPage from '../pages/EditApplicationPage';
import ViewApplicationPage from '../pages/ViewApplicationPage';
import NotificationPage from '../pages/NotificationPage';
import Layout from '../layout/Layout.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import ProtectedRoute from './ProtectedRoutes.tsx';

export default function AppRoutes() {
    return (<Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
            <Route element={<Layout />} >
                <Route path="/" element={<Dashboard />} />
                <Route path="/add" element={<AddApplicationPage />} />
                <Route path="/edit/:id" element={<EditApplicationPage />} />
                <Route path="/view/:id" element={<ViewApplicationPage />} />
                <Route path="/notifaction" element={<NotificationPage />} />
            </Route>
        </Route>
    </Routes>
    );
}