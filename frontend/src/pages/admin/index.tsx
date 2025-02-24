import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

interface Character {
    id: number;
    name: string;
    story: string;
    stat: string;
    image: string;
    fate: string;
    category: string;
}

const AdminPage: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const response = await axios.get('http://localhost:3000/characters');
                setCharacters(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch characters');
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-4">Character Management</h1>
                <button
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => navigate('/admin/create')}
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Create
                </button>
            </div>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-[1fr_0.5fr_2fr_0.5fr_0.5fr_0.5fr_0.5fr] gap-4 bg-white border border-gray-200">
                    <div className="py-2 px-4 border-b font-bold">Image</div>
                    <div className="py-2 px-4 border-b font-bold">Name</div>
                    <div className="py-2 px-4 border-b font-bold">Story</div>
                    <div className="py-2 px-4 border-b font-bold">Stat</div>
                    <div className="py-2 px-4 border-b font-bold">Fate</div>
                    <div className="py-2 px-4 border-b font-bold">Category</div>
                    <div className="py-2 px-4 border-b font-bold">Actions</div>
                    {characters.map((character) => (
                        <React.Fragment key={character.id}>
                            <div className="py-2 px-4 border-b">
                                <img src={character.image} alt={character.name} className="w-full h-auto object-cover" />
                            </div>
                            <div className="py-2 px-4 border-b">{character.name}</div>
                            <div className="py-2 px-4 border-b">{character.story}</div>
                            <div className="py-2 px-4 border-b">{character.stat}</div>
                            <div className="py-2 px-4 border-b">{character.fate}</div>
                            <div className="py-2 px-4 border-b">{character.category}</div>
                            <div className="py-2 px-4 border-b flex space-x-2">
                                <button className="w-7 h-7 bg-yellow-500 text-white rounded"
                                    onClick={() => navigate(`/admin/update/${character.id}`)}
                                >
                                    <FontAwesomeIcon icon={faEdit} />

                                </button>
                                <button className="w-7 h-7 bg-red-500 text-white rounded">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;