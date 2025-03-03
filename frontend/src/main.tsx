import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import Admin from './pages/admin/admin-router';
import Layout from './components/layout';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  </StrictMode>,
);