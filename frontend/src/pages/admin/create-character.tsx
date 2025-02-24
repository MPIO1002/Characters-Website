import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateCharacterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [story, setStory] = useState('');
  const [stat, setStat] = useState('');
  const [image, setImage] = useState('');
  const [fate, setFate] = useState('');
  const [category, setCategory] = useState('');
  const [origin, setOrigin] = useState('');
  const [skills, setSkills] = useState([{ name: '', description: '', img_url: '' }]);
  const [skins, setSkins] = useState([{ name: '', img_url: '' }]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/characters', {
        name,
        story,
        stat,
        image,
        fate,
        category,
        origin,
        skills,
        skins,
      });
      navigate('/admin');
    } catch (err) {
      setError('Failed to create character');
    }
  };

  const handleSkillChange = (index: number, field: string, value: string) => {
    setSkills((prevSkills) =>
      prevSkills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
    );
  };

  const handleAddSkill = () => {
    setSkills([...skills, { name: '', description: '', img_url: '' }]);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkinChange = (index: number, field: string, value: string) => {
    setSkins((prevSkins) =>
      prevSkins.map((skin, i) =>
        i === index ? { ...skin, [field]: value } : skin
      )
    );
  };

  const handleAddSkin = () => {
    setSkins([...skins, { name: '', img_url: '' }]);
  };

  const handleRemoveSkin = (index: number) => {
    setSkins(skins.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Character</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Story</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Stat</label>
            <input
              type="text"
              value={stat}
              onChange={(e) => setStat(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Image URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            {image && <img src={image} alt="Character" className="mt-2 w-full h-auto" />}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Fate</label>
            <input
              type="text"
              value={fate}
              onChange={(e) => setFate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Skills</label>
          {skills.map((skill, index) => (
            <div key={index} className="mb-2">
              <label className="block text-gray-700">Skill {index + 1}</label>
              <input
                type="text"
                placeholder="Skill Name"
                value={skill.name}
                onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                required
              />
              <textarea
                placeholder="Skill Description"
                value={skill.description}
                onChange={(e) => handleSkillChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Skill Image URL"
                value={skill.img_url}
                onChange={(e) => handleSkillChange(index, 'img_url', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
              {skill.img_url && <img src={skill.img_url} alt={`Skin ${index + 1}`} className="mt-2 w-20 h-auto" />}
              <button type="button" onClick={() => handleRemoveSkill(index)} className="px-4 py-2 bg-red-500 text-white rounded mt-2">
                Remove Skill
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-green-500 text-white rounded">
            Add Skill
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Skins</label>
          {skins.map((skin, index) => (
            <div key={index} className="mb-2">
              <label className="block text-gray-700">Skin {index + 1}</label>
              <input
                type="text"
                placeholder="Skin Name"
                value={skin.name}
                onChange={(e) => handleSkinChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Skin Image URL"
                value={skin.img_url}
                onChange={(e) => handleSkinChange(index, 'img_url', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
              {skin.img_url && <img src={skin.img_url} alt={`Skin ${index + 1}`} className="mt-2 w-full h-auto" />}
              <button type="button" onClick={() => handleRemoveSkin(index)} className="px-4 py-2 bg-red-500 text-white rounded mt-2">
                Remove Skin
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddSkin} className="px-4 py-2 bg-green-500 text-white rounded">
            Add Skin
          </button>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateCharacterPage;