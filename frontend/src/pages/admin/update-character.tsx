import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Notification from '../../components/notification';

const UpdateCharacterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [story, setStory] = useState('');
  const [img, setImg] = useState('');
  const [transform, setTransform] = useState('');
  const [skills, setSkills] = useState([
    { id: 0, name: '', star: '', description: '' },
    { id: 0, name: '', star: '', description: '' }
  ]);
  const [fates, setFates] = useState([
    { id: 0, name: '', description: '' },
    { id: 0, name: '', description: '' },
    { id: 0, name: '', description: '' }
  ]);
  const [pets, setPets] = useState([{ id: 0, name: '', description: '' }]);
  const [artifacts, setArtifacts] = useState([
    { id: 0, name: '', description: '' },
    { id: 0, name: '', description: '' },
    { id: 0, name: '', description: '' },
    { id: 0, name: '', description: '' },
    { id: 0, name: '', description: '' }
  ]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/heroes/${id}`);
        const character = response.data.data;
        setName(character.name);
        setStory(character.story);
        setImg(character.img);
        setTransform(character.transform);
        setSkills(character.skills);
        setFates(character.fates);
        setPets(character.pets);
        setArtifacts(character.artifacts);
      } catch (err) {
        setError('Failed to fetch character');
      }
    };

    fetchCharacter();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!name || !story || !img || !transform) {
      setError('All fields must be filled');
      return;
    }

    for (const skill of skills) {
      if (!skill.name || !skill.star || !skill.description) {
        setError('All skill fields must be filled');
        return;
      }
    }

    for (const fate of fates) {
      if (!fate.name || !fate.description) {
        setError('All fate fields must be filled');
        return;
      }
    }

    for (const pet of pets) {
      if (!pet.name || !pet.description) {
        setError('All pet fields must be filled');
        return;
      }
    }

    for (const artifact of artifacts) {
      if (!artifact.name || !artifact.description) {
        setError('All artifact fields must be filled');
        return;
      }
    }

    const characterData = {
      name,
      story,
      img,
      transform,
      skills,
      fates,
      pets,
      artifacts,
    };

    console.log('Updating character with data:', characterData);
    try {
      await axios.put(`http://localhost:3000/heroes/${id}`, characterData);
      setNotification({ message: 'Cập nhật tướng thành công', type: 'success' });
        setTimeout(() => {
            navigate('/admin');
        }, 1000);
    } catch (err) {
      console.error('Failed to update character:', err);
      setError('Failed to update character');
      setNotification({ message: 'Cập nhật tướng thất bại', type: 'error' });
    }
  };

  const handleSkillChange = (index: number, field: string, value: string) => {
    setSkills((prevSkills) =>
      prevSkills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
    );
  };

  const handleFateChange = (index: number, field: string, value: string) => {
    setFates((prevFates) =>
      prevFates.map((fate, i) =>
        i === index ? { ...fate, [field]: value } : fate
      )
    );
  };

  const handlePetChange = (index: number, field: string, value: string) => {
    setPets((prevPets) =>
      prevPets.map((pet, i) =>
        i === index ? { ...pet, [field]: value } : pet
      )
    );
  };

  const handleArtifactChange = (index: number, field: string, value: string) => {
    setArtifacts((prevArtifacts) =>
      prevArtifacts.map((artifact, i) =>
        i === index ? { ...artifact, [field]: value } : artifact
      )
    );
  };

  return (
    <div className="container mx-auto p-4">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <h1 className="text-2xl font-bold mb-4">Cập nhật thông tin tướng</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className=" gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold">Tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold">Tiểu sử</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold">Đường dẫn ảnh tướng</label>
            <input
              type="text"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            {img && <img src={img} alt="Character" className="mt-2 h-auto" />}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold">Đường dẫn ảnh biến thể</label>
            <input
              type="text"
              value={transform}
              onChange={(e) => setTransform(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            {transform && <img src={transform} alt="Transform" className="mt-2 w-full h-auto" />}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Kỹ năng</label>
          {skills.map((skill, index) => (
            <div key={index} className="mb-2 flex flex-col">
              <label className="block text-gray-700 font-medium mb-2 mt-2">Kỹ năng {index + 1}</label>
              <input
                type="text"
                placeholder="Tên kỹ năng"
                value={skill.name}
                onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Chỉ số sao"
                value={skill.star}
                onChange={(e) => handleSkillChange(index, 'star', e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                required
              />
              <textarea
                placeholder="Mô tả hiệu ứng kỹ năng"
                value={skill.description}
                onChange={(e) => handleSkillChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Duyên tướng</label>
          {fates.map((fate, index) => (
            <div key={index} className="mb-2 flex flex-col">
              <label className="block text-gray-700 font-medium mt-2 mb-2">Duyên tướng {index + 1}</label>
              <input
                type="text"
                placeholder="Tên duyên tướng"
                value={fate.name}
                onChange={(e) => handleFateChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                required
              />
              <textarea
                placeholder="Mô tả hiệu ứng duyên tướng"
                value={fate.description}
                onChange={(e) => handleFateChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Duyên linh thú</label>
          {pets.map((pet, index) => (
            <div key={index} className="mb-2 flex flex-col">
              <label className="block text-gray-700 font-medium mt-2 mb-2">Linh thú {index + 1}</label>
              <input
                type="text"
                placeholder="Tên linh thú"
                value={pet.name}
                onChange={(e) => handlePetChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                required
              />
              <textarea
                placeholder="Mô tả hiệu ứng duyên linh thú"
                value={pet.description}
                onChange={(e) => handlePetChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Duyên bảo vật</label>
          {artifacts.map((artifact, index) => (
            <div key={index} className="mb-2 flex flex-col">
              <label className="block text-gray-700 font-medium mt-2 mb-2">Bảo vật {index + 1}</label>
              <input
                type="text"
                placeholder="Tên bảo vật"
                value={artifact.name}
                onChange={(e) => handleArtifactChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                required
              />
              <textarea
                placeholder="Mô tả hiệu ứng duyên bảo vật"
                value={artifact.description}
                onChange={(e) => handleArtifactChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          ))}
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded w-full">
          Cập nhật tướng
        </button>
      </form>
    </div>
  );
};

export default UpdateCharacterPage;