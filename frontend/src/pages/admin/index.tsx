import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/notification';
import config from '../../components/api-config/api-config';

interface Character {
    id: number;
    name: string;
    story: string;
    img: string;
    transform: string;
}

const AdminPage: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const charactersPerPage = 10;
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/heroes`);
                setCharacters(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch characters');
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastCharacter = currentPage * charactersPerPage;
    const indexOfFirstCharacter = indexOfLastCharacter - charactersPerPage;
    const currentCharacters = characters.slice(indexOfFirstCharacter, indexOfLastCharacter);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tướng này không?')) {
            try {
                await axios.delete(`${config.apiBaseUrl}/heroes/${id}`);
                setCharacters(characters.filter(character => character.id !== id));
                setNotification({ message: 'Xóa tướng thành công', type: 'success' });
            } catch (err) {
                setError('Failed to delete heroes');
                setNotification({ message: 'Failed to delete heroes', type: 'error' });
            }
        }
    };

    return (
        <div className="container mx-auto p-4 bg-red">
            {notification && <Notification message={notification.message} type={notification.type} />}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-2 text-white">Cập nhật thông tin tướng</h1>
                <button
                    className="mb-4 px-4 py-2 bg-red-400 text-white rounded"
                    onClick={() => navigate('/admin/create')}
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Tạo tướng mới
                </button>
            </div>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-[1fr_0.5fr_2.5fr_3fr_1fr] gap-4 bg-white border border-gray-200 rounded-lg">
                    <div className="py-2 px-4 border-b font-bold">Ảnh</div>
                    <div className="py-2 px-4 border-b font-bold">Tên</div>
                    <div className="py-2 px-4 border-b font-bold">Tiểu sử</div>
                    <div className="py-2 px-4 border-b font-bold">Biến thể</div>
                    <div className="py-2 px-4 border-b font-bold">Hành động</div>
                    {currentCharacters.map((character) => (
                        <React.Fragment key={character.id}>
                            <div className="py-2 px-4 border-b">
                                <img src={character.img} alt={character.name} className="w-full h-auto object-cover" />
                            </div>
                            <div className="py-2 px-4 border-b">{character.name}</div>
                            <div className="py-2 px-4 border-b text-sm">{character.story}</div>
                            <div className="py-2 px-4 border-b">
                                <img src={character.transform} alt={character.transform} className="w-full h-auto object-cover" />
                            </div>
                            <div className="py-2 px-4 border-b flex space-x-2">
                                <button className="w-7 h-7 bg-yellow-500 text-white rounded"
                                    onClick={() => navigate(`/admin/update/${character.id}`)}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button className="w-7 h-7 bg-red-500 text-white rounded" onClick={() => handleDelete(character.id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(characters.length / charactersPerPage) }, (_, index) => (
                    <button
                        key={index + 1}
                        className={`px-4 py-2 mx-1 rounded-lg ${currentPage === index + 1 ? 'bg-red-400 text-white' : 'bg-gray-200'}`}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminPage;