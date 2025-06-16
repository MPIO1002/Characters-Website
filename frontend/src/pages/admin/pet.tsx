import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Notification from "../../components/notification";
import config from "../../components/api-config/api-config";
import Loader from "../../components/loader/loader";

interface Pet {
    id: number;
    img: string;
    name: string;
    description: string;
    img_figure_1: string;
    img_figure_2: string;
}

const PetPage: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const petsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/pet_private`);
                if (res.data.succeed) {
                    setPets(res.data.data);
                    setFilteredPets(res.data.data);
                }
                setLoading(false);
            } catch (err) {
                setError("Không thể tải dữ liệu pet");
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

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
        const filtered = pets.filter(pet =>
            pet.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredPets(filtered);
        setCurrentPage(1);
    }, 300);

    const handleDelete = async (id: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa pet này không?")) {
            try {
                await axios.delete(`${config.apiBaseUrl}/pet_private/${id}`);
                setPets(pets.filter(pet => pet.id !== id));
                setFilteredPets(filteredPets.filter(pet => pet.id !== id));
                setNotification({ message: "Xóa pet thành công", type: "success" });
            } catch (err) {
                setError("Không thể xóa pet");
                setNotification({ message: "Không thể xóa pet", type: "error" });
            }
        }
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastPet = currentPage * petsPerPage;
    const indexOfFirstPet = indexOfLastPet - petsPerPage;
    const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);
    const totalPages = Math.ceil(filteredPets.length / petsPerPage);

    if (loading) return <Loader />;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto p-4 bg-red">
            {notification && <Notification message={notification.message} type={notification.type} />}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-sm font-bold mb-2 text-white md:text-2xl">Quản lý linh thú</h1>
                <button
                    className="mb-4 px-4 py-2 bg-red-400 text-white rounded cursor-pointer"
                    onClick={() => navigate('/admin/pet/create')}
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Thêm linh thú mới
                </button>
            </div>
            <div className="mb-4 flex gap-5 items-center">
                <label className="block text-white font-bold text-sm md:text-lg">Tìm kiếm linh thú:</label>
                <input
                    type="text"
                    placeholder="Tên pet..."
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
                            <th className="py-2 px-4 font-bold text-center border-b border-gray-200 bg-gray-100">Mô tả</th>
                            <th className="py-2 px-4 font-bold text-center border-b border-gray-200 bg-gray-100">Hình 1</th>
                            <th className="py-2 px-4 font-bold text-center border-b border-gray-200 bg-gray-100">Hình 2</th>
                            <th className="py-2 px-4 font-bold text-center border-b border-gray-200 bg-gray-100 rounded-tr-lg">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPets.map((pet) => (
                            <tr key={pet.id}>
                                <td className="py-2 px-4 text-center border-b border-gray-200">
                                    <img src={pet.img} alt={pet.name} className="w-auto h-24 object-cover rounded-lg mx-auto" />
                                </td>
                                <td className="py-2 px-4 text-center border-b border-gray-200">{pet.name}</td>
                                <td className="py-2 px-4 text-center border-b border-gray-200">{pet.description}</td>
                                <td className="py-2 px-4 text-center border-b border-gray-200">
                                    <img src={pet.img_figure_1} alt="Figure 1" className="w-auto h-16 object-cover rounded-lg mx-auto" />
                                </td>
                                <td className="py-2 px-4 text-center border-b border-gray-200">
                                    <img src={pet.img_figure_2} alt="Figure 2" className="w-auto h-16 object-cover rounded-lg mx-auto" />
                                </td>
                                <td className="py-2 px-4 text-center border-b border-gray-200">
                                    <div className="flex space-x-2 justify-center">
                                        <button
                                            className="w-7 h-7 bg-yellow-500 text-white rounded cursor-pointer"
                                            onClick={() => navigate(`/admin/pet/update/${pet.id}`)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className="w-7 h-7 bg-red-500 text-white rounded cursor-pointer"
                                            onClick={() => handleDelete(pet.id)}
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
                    &lt;
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
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default PetPage;