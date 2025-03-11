import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
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
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/heroes`);
                setCharacters(response.data.data);
                setFilteredCharacters(response.data.data);
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
    const currentCharacters = filteredCharacters.slice(indexOfFirstCharacter, indexOfLastCharacter);

    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    const handleSearch = debounce((value: string) => {
        setSearchTerm(value);
        const filtered = characters.filter(character =>
            character.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCharacters(filtered);
    }, 300);

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
                setFilteredCharacters(filteredCharacters.filter(character => character.id !== id));
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
                    className="mb-4 px-4 py-2 bg-red-400 text-white rounded cursor-pointer"
                    onClick={() => navigate('/admin/create')}
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Tạo tướng mới
                </button>
            </div>
            <div className="ml- mb-4 flex gap-5 items-center">
                <label className="block text-white font-bold text-lg">Tìm kiếm tướng:</label>
                <input
                    type="text"
                    placeholder="Tên tướng..."
                    className="p-2 pl-10 rounded-lg border border-gray-300 bg-white w-80"
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 font-bold text-center border-b border-gray-200 bg-gray-100 rounded-tl-lg">Ảnh</th>
                            <th className="py-2 px-4 font-bold text-center border-b border-gray-200 bg-gray-100">Tên</th>
                            <th className="py-2 px-4 font-bold text-center border-b border-gray-200 bg-gray-100">Biến thể</th>
                            <th className="py-2 px-4 font-bold text-center border-b border-gray-200 bg-gray-100 rounded-tr-lg">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCharacters.map((character) => (
                            <tr key={character.id}>
                                <td className="py-2 px-4 text-center border-b border-gray-200">
                                    <img
                                        src={character.img}
                                        alt={character.name}
                                        className="w-auto h-32 object-cover rounded-lg mx-auto"
                                    />
                                </td>
                                <td className="py-2 px-4 text-center border-b border-gray-200">{character.name}</td>
                                <td className="py-2 px-4 text-center border-b border-gray-200">
                                    <img
                                        src={character.transform}
                                        alt={character.transform}
                                        className="w-auto h-32 object-cover rounded-lg mx-auto"
                                    />
                                </td>
                                <td className="py-2 px-4 text-center border-b border-gray-200">
                                    <div className="flex space-x-2 justify-center">
                                        <button
                                            className="w-7 h-7 bg-yellow-500 text-white rounded cursor-pointer"
                                            onClick={() => navigate(`/admin/update/${character.id}`)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className="w-7 h-7 bg-red-500 text-white rounded cursor-pointer"
                                            onClick={() => handleDelete(character.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-4">
                <button
                    className={` cursor-pointer px-4 py-2 mx-1 rounded-lg ${currentPage === 1 ? 'bg-gray-200' : 'bg-red-400 text-white'}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <FontAwesomeIcon icon={faAngleLeft} />
                </button>
                {Array.from({ length: Math.ceil(filteredCharacters.length / charactersPerPage) }, (_, index) => (
                    <button
                        key={index + 1}
                        className={`cursor-pointer px-4 py-2 mx-1 rounded-lg ${currentPage === index + 1 ? 'bg-red-400 text-white' : 'bg-gray-200'}`}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    className={`cursor-pointer px-4 py-2 mx-1 rounded-lg ${currentPage === Math.ceil(filteredCharacters.length / charactersPerPage) ? 'bg-gray-200' : 'bg-red-400 text-white'}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredCharacters.length / charactersPerPage)}
                >
                    <FontAwesomeIcon icon={faAngleRight} />
                </button>
            </div>
        </div>
    );
};

export default AdminPage;