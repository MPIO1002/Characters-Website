import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/notification';
import config from '../../components/api-config/api-config';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.apiBaseUrl}/auth/login`, { username, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      setNotification({ message: 'Đăng nhập thành công', type: 'success' });
      setTimeout(() => {
        navigate('/admin');
      }, 500);
    } catch (err) {
      setNotification({ message: 'Đăng nhập thất bại', type: 'error' });
    }
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col justify-center items-center bg-red">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <div className='w-4/5 bg-white p-4 rounded'>
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded w-full">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;