import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/notification';
import config from '../../components/api-config/api-config';
import Loader from '../../components/loader/loader';

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
    const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);

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

    if (loading) return <Loader />;

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
                <h1 className="text-sm font-bold mb-2 text-white md:text-2xl">Cập nhật thông tin tướng</h1>
                <button
                    className="mb-4 px-4 py-2 bg-red-400 text-white rounded cursor-pointer"
                    onClick={() => navigate('/admin/create')}
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Tạo tướng mới
                </button>
            </div>
            <div className="mb-4 flex gap-5 items-center">
                <label className="block text-white font-bold text-sm md:text-lg">Tìm kiếm tướng:</label>
                <input
                    type="text"
                    placeholder="Tên tướng..."
                    className="p-2 pl-10 rounded-lg border border-gray-300 bg-white w-64 md:w-80"
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
            <div className="flex items-center gap-8 mt-6 justify-center">
                <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="rounded-md border border-slate-300 p-2.5 text-center text-sm transition-all shadow-sm hover:shadow-lg text-white hover:bg-black hover:border-black focus:bg-black focus:border-black active:border-black disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none cursor-pointer"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                        <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                    </svg>
                </button>

                <p className="text-white">
                    Page <strong className="text-white">{currentPage}</strong> of&nbsp;
                    <strong className="text-white">{totalPages}</strong>
                </p>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="rounded-md border border-slate-300 p-2.5 text-center text-sm transition-all shadow-sm hover:shadow-lg text-white hover:bg-black hover:border-black focus:bg-black focus:border-black active:border-black disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none cursor-pointer"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                        <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default AdminPage;