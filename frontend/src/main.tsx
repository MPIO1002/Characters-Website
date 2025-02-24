import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import AdminPage from './pages/admin';
import CreateCharacterPage from './pages/admin/create-character';
import UpdateCharacterPage from './pages/admin/update-character';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/create" element={<CreateCharacterPage />} />
        <Route path="/admin/update/:id" element={<UpdateCharacterPage />} />
      </Routes>
    </Router>
  </StrictMode>,
);