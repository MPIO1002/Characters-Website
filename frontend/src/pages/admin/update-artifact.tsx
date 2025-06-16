import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Notification from '../../components/notification';
import config from '../../components/api-config/api-config';
import Loader from '../../components/loader/loader';

const UpdateArtifactPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [img, setImg] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgFigure1, setImgFigure1] = useState<File | null>(null);
  const [imgFigure1Url, setImgFigure1Url] = useState<string | null>(null);
  const [imgFigure2, setImgFigure2] = useState<File | null>(null);
  const [imgFigure2Url, setImgFigure2Url] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.apiBaseUrl}/artifact_private/${id}`);
        const artifact = response.data.data;
        setName(artifact.name);
        setDescription(artifact.description);
        setImgUrl(artifact.img);
        setImgFigure1Url(artifact.img_figure_1);
        setImgFigure2Url(artifact.img_figure_2);
      } catch (err) {
        setError('Không thể tải dữ liệu bảo vật');
      } finally {
        setLoading(false);
      }
    };
    fetchArtifact();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!name || !description) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (img) formData.append('img', img);
    if (imgFigure1) formData.append('img_figure_1', imgFigure1);
    if (imgFigure2) formData.append('img_figure_2', imgFigure2);

    setLoading(true);
    try {
      await axios.put(`${config.apiBaseUrl}/artifact_private/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNotification({ message: 'Cập nhật bảo vật thành công', type: 'success' });
      setTimeout(() => {
        navigate('/admin/artifact');
      }, 1000);
    } catch (err) {
      setNotification({ message: 'Cập nhật bảo vật thất bại', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <h1 className="text-2xl font-bold mb-4">Cập nhật bảo vật</h1>
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
            onChange={e => {
              const file = e.target.files ? e.target.files[0] : null;
              setImg(file);
              setImgUrl(file ? URL.createObjectURL(file) : imgUrl);
            }}
            className="w-full px-3 py-2 border rounded"
          />
          {imgUrl && <img src={imgUrl} alt="Artifact" className="mt-2 h-24" />}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Hình 1</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files ? e.target.files[0] : null;
              setImgFigure1(file);
              setImgFigure1Url(file ? URL.createObjectURL(file) : imgFigure1Url);
            }}
            className="w-full px-3 py-2 border rounded"
          />
          {imgFigure1Url && <img src={imgFigure1Url} alt="Figure 1" className="mt-2 h-16" />}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Hình 2</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files ? e.target.files[0] : null;
              setImgFigure2(file);
              setImgFigure2Url(file ? URL.createObjectURL(file) : imgFigure2Url);
            }}
            className="w-full px-3 py-2 border rounded"
          />
          {imgFigure2Url && <img src={imgFigure2Url} alt="Figure 2" className="mt-2 h-16" />}
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded w-full">
          Cập nhật bảo vật
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

export default UpdateArtifactPage;