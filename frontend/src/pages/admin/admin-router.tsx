import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AdminPage from './index';
import CreateCharacterPage from './create-character';
import UpdateCharacterPage from './update-character';
import LoginPage from './login-page';
import AdminSidebar from '../../components/admin-sidebar';
import '../../index.css'
import PetAdminPage from './pet';
import CreatePetPage from './create-pet';
import UpdatePetPage from './update-pet';
import ArtifactAdminPage from './artifact';
import CreateArtifactPage from './create-artifact';
import UpdateArtifactPage from './update-artifact';

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="w-full h-screen bg-red overflow-y-auto scrollbar-hide">
        <Routes>
          <Route path="/" element={<AdminPage />} />
          <Route path="/create" element={<CreateCharacterPage />} />
          <Route path="/update/:id" element={<UpdateCharacterPage />} />
          <Route path="/pet" element={<PetAdminPage />} />
          <Route path="/pet/create" element={<CreatePetPage />} />
          <Route path="/pet/update/:id" element={<UpdatePetPage />} />
          <Route path="/artifact" element={<ArtifactAdminPage />} />
          <Route path="/artifact/create" element={<CreateArtifactPage />} />
          <Route path="/artifact/update/:id" element={<UpdateArtifactPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;