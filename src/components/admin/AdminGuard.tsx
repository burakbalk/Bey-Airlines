import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken || adminToken !== 'admin-authenticated') {
      navigate('/admin/login', { replace: true, state: { from: location } });
    }
  }, [navigate, location]);

  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken || adminToken !== 'admin-authenticated') {
    return null;
  }

  return <>{children}</>;
}