import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/notification';
import config from '../../components/api-config/api-config';
import Loader from '../../components/loader/loader';

const CreateArtifactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [img, setImg] = useState<File | null>(null);
  const [imgFigure1, setImgFigure1] = useState<File | null>(null);
  const [imgFigure2, setImgFigure2] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!name || !description || !img || !imgFigure1 || !imgFigure2) {
      setError('Vui lòng nhập đầy đủ thông tin và chọn đủ ảnh.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('img', img);
    formData.append('img_figure_1', imgFigure1);
    formData.append('img_figure_2', imgFigure2);

    setLoading(true);
    try {
      await axios.post(`${config.apiBaseUrl}/artifact_private`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNotification({ message: 'Tạo bảo vật thành công', type: 'success' });
      setTimeout(() => {
        navigate('/admin/artifact');
      }, 1000);
    } catch (err) {
      setNotification({ message: 'Không thể tạo bảo vật', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <h1 className="text-2xl font-bold mb-4">Tạo bảo vật mới</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Tên bảo vật</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Mô tả</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Ảnh bảo vật</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImg(e.target.files ? e.target.files[0] : null)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          {img && <img src={URL.createObjectURL(img)} alt="Artifact" className="mt-2 h-24" />}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Hình 1</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImgFigure1(e.target.files ? e.target.files[0] : null)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          {imgFigure1 && <img src={URL.createObjectURL(imgFigure1)} alt="Figure 1" className="mt-2 h-16" />}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Hình 2</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImgFigure2(e.target.files ? e.target.files[0] : null)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          {imgFigure2 && <img src={URL.createObjectURL(imgFigure2)} alt="Figure 2" className="mt-2 h-16" />}
        </div>
        <button type="submit" className="px-4 py-2 bg-red-400 text-white rounded w-full">
          Tạo bảo vật
        </button>
      </form>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default CreateArtifactPage;