import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import config from "../api-config/api-config";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';

interface Pet {
    id: number;
    name: string;
    description: string;
    img: string;
    img_figure_1: string;
    img_figure_2: string;
}

const PetPart = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const petDetailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPets = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${config.apiBaseUrl}/pet_private`);
                setPets(response.data.data);
            } catch (error) {
                console.error("Error fetching pets:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

    const fetchPetDetails = async (id: number) => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}/pet_private/${id}`);
            setSelectedPet(response.data.data);
            petDetailsRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Error fetching pet:", error);
        }
    };

    const debounceSearch = useCallback((callback: (value: string) => void, delay: number) => {
        let timer: NodeJS.Timeout;
        return (value: string) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                callback(value);
            }, delay);
        };
    }, []);

    const handleSearch = debounceSearch((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, 300);

    const filteredPets = useMemo(() => {
        // Sắp xếp theo alphabet trước khi filter
        const sorted = [...pets].sort((a, b) =>
            a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
        );
        return sorted.filter(pet =>
            pet.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pets, searchTerm]);

    useEffect(() => {
        if (filteredPets.length > 0 && !selectedPet) {
            setSelectedPet(filteredPets[0]);
        }
    }, [filteredPets, selectedPet]);

    const [currentPage, setCurrentPage] = useState(1);
    const petsPerPage = 24;

    const indexOfLastPet = currentPage * petsPerPage;
    const indexOfFirstPet = indexOfLastPet - petsPerPage;
    const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);
    const totalPages = Math.ceil(filteredPets.length / petsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage: "url('new_bg.png')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
            }}
        >
            <div className="container mx-auto py-8 px-4 md:px-20 lg:px-40">
                <div className="mt-[30px] md:mt-[100px] backdrop-blur-md bg-white/10 p-4 rounded-lg">
                    <h1 className="mt-1 mb-4 flex justify-center items-center font-bold text-xl md:text-2xl text-white">
                        <img src="next.png" alt="icon" className="w-6 h-6 mr-2 transform rotate-180" />
                        DANH SÁCH LINH THÚ
                        <img src="next.png" alt="icon" className="w-6 h-6 ml-2" />
                    </h1>
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm linh thú..."
                                onChange={(e) => handleSearch(e.target.value)}
                                className="p-2 pl-10 rounded-2xl border border-gray-300 bg-white w-80"
                            />
                            <img src="magnifying-glass.png" alt="search icon" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <p className="text-white">Loading...</p>
                        </div>
                        ) : filteredPets.length === 0 ? (
                            <div className="flex flex-col justify-center items-center py-8">
                                <img src="404NotFound.png" alt="404 Not Found" className="w-32 h-auto mb-4" />
                                <p className="text-white text-center font-bold text-lg">Linh thú chưa được cập nhật hoặc không tồn tại</p>
                            </div>
                        ) : (
                        <div className="mt-2 grid md:grid-cols-8 grid-cols-4 gap-4">
                            {currentPets.map((pet, index) => {
                                const nameParts = pet.name.split(' ');
                                const displayName = nameParts.length > 2 ? `${nameParts[0]}...` : pet.name;
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center cursor-pointer"
                                        onClick={() => fetchPetDetails(pet.id)}
                                    >
                                        <img
                                            src={pet.img}
                                            alt={pet.name}
                                            className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-tr-lg rounded-bl-lg border-1 hover:border-amber-50 hover:scale-105 cursor-pointer transition-all"
                                            loading="lazy"
                                        />
                                        <p className="mt-1 text-xs text-white">
                                            <span className="block md:hidden">{displayName}</span>
                                            <span className="hidden md:block">{pet.name}</span>
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {/* Pagination - chỉ hiển thị khi có kết quả */}
                    {!loading && filteredPets.length > 0 && (
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
                            Trang <strong className="text-white">{currentPage}</strong> /&nbsp;
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
                    )}
                </div>
            </div>
            {selectedPet && (
                <div ref={petDetailsRef} className="flex flex-col items-center gap-4 relative p-4 md:px-20 lg:px-40">
                    <div className="backdrop-blur-md bg-black/30 p-4 rounded-lg md:px-20 lg:px-40">
                        <div className="w-full rounded-lg sticky top-4 z-10">
                            <div className="w-full h-full flex flex-col items-start p-4">
                                <h2 className="mt-2 text-xl font-extrabold text-white text-center w-full">{selectedPet.name}</h2>
                                <p className="text-white text-sm md:text-base mt-4 mb-2 text-left flex items-center justify-start gap-2 font-bold w-full">
                                    <FontAwesomeIcon icon={faShieldHalved} className="text-white flex-shrink-0" />
                                    <span className="inline">Mô tả: </span>
                                </p>
                                <p className="text-white text-sm md:text-base mb-4 text-left w-full">
                                    {selectedPet.description}
                                </p>

                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                                    <img
                                        src={selectedPet.img_figure_1}
                                        alt={`${selectedPet.name} figure 1`}
                                        className="w-54 h-auto md:w-76 object-contain rounded"
                                        loading="lazy"
                                    />
                                    <img
                                        src={selectedPet.img_figure_2}
                                        alt={`${selectedPet.name} figure 2`}
                                        className="w-54 h-auto md:w-76 object-contain rounded"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >

    );
};

export default PetPart;