import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getOwnerCurrentUser } from '../redux/slices/ownerAuthSlice';


const OwnerProtectedRoute = ({ children, allowedRoles = [] }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.ownerAuth);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    if (isAuthenticated) return;
    if (isLoading) return;

    if (!isAuthenticated && !isLoading && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(getOwnerCurrentUser());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
        Loading admin portal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/ownerLogin" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default OwnerProtectedRoute;