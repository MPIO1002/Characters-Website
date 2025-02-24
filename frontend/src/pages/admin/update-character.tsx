import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateCharacterPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [story, setStory] = useState('');
    const [stat, setStat] = useState('');
    const [image, setImage] = useState('');
    const [fate, setFate] = useState('');
    const [category, setCategory] = useState('');
    const [origin, setOrigin] = useState('');
    const [skills, setSkills] = useState([{ id: 0, name: '', description: '' }]);
    const [skins, setSkins] = useState([{ id: 0, name: '', img_url: '' }]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/characters/${id}`);
                const character = response.data.data;
                setName(character.name);
                setStory(character.story);
                setStat(character.stat);
                setImage(character.image);
                setFate(character.fate);
                setCategory(character.category);
                setOrigin(character.origin);
                setSkills(character.skills);
                setSkins(character.skins);
            } catch (err) {
                setError('Failed to fetch character');
            }
        };

        fetchCharacter();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const characterData = {
            name,
            story,
            stat,
            image,
            fate,
            category,
            origin,
            skills: skills.map(skill => ({
                id: skill.id,
                name: skill.name,
                description: skill.description,
            })),
            skins: skins.map(skin => ({
                id: skin.id,
                name: skin.name,
                img_url: skin.img_url,
            })),
        };
        console.log('Updating character with data:', characterData);
        try {
            await axios.put(`http://localhost:3000/characters/${id}`, characterData);
            navigate('/admin');
        } catch (err) {
            console.error('Failed to update character:', err);
            setError('Failed to update character');
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
        setSkills([...skills, { id: 0, name: '', description: '' }]);
    };

    const handleSkinChange = (index: number, field: string, value: string) => {
        setSkins((prevSkins) =>
            prevSkins.map((skin, i) =>
                i === index ? { ...skin, [field]: value } : skin
            )
        );
    };

    const handleAddSkin = () => {
        setSkins([...skins, { id: 0, name: '', img_url: '' }]);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Update Character</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit}>
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
                <div className="mb-4">
                    <label className="block text-gray-700">Skills</label>
                    {skills.map((skill, index) => (
                        <div key={index} className="mb-2">
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
                        </div>
                    ))}
                    <button type="button" onClick={handleAddSkin} className="px-4 py-2 bg-green-500 text-white rounded">
                        Add Skin
                    </button>
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                    Update
                </button>
            </form>
        </div>
    );
};

export default UpdateCharacterPage;