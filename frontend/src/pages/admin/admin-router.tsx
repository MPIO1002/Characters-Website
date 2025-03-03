import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AdminPage from './index';
import CreateCharacterPage from './create-character';
import UpdateCharacterPage from './update-character';
import LoginPage from './login-page';

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<AdminPage />} />
      <Route path="/create" element={<CreateCharacterPage />} />
      <Route path="/update/:id" element={<UpdateCharacterPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};

export default Admin;