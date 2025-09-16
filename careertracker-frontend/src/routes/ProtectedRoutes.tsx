import { useUser } from '../context/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user } = useUser();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;