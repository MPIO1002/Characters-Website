import { useEffect, useState, useRef } from "react";
import axios from "axios";
import config from "../api-config/api-config";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';

interface Artifact {
    id: number;
    name: string;
    description: string;
    img: string;
    img_figure_1: string;
    img_figure_2: string;
}

const ArtifactPart = () => {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const artifactDetailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchArtifacts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${config.apiBaseUrl}/artifact_private`);
                setArtifacts(response.data.data);
            } catch (error) {
                console.error("Error fetching artifacts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtifacts();
    }, []);

    const fetchArtifactDetails = async (id: number) => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}/artifact_private/${id}`);
            setSelectedArtifact(response.data.data);
            artifactDetailsRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Error fetching artifact:", error);
        }
    };

    const filteredArtifacts = artifacts.filter(artifact =>
        artifact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage: "url('/new_bg.png')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
            }}
        >
            <div className="container mx-auto py-8 px-4 md:px-20 lg:px-40">
                <h1 className="mt-1 mb-4 flex justify-center items-center font-bold text-2xl text-white">
                    <img src="/next.png" alt="icon" className="w-6 h-6 mr-2 transform rotate-180" />
                    DANH SÁCH BẢO VẬT
                    <img src="/next.png" alt="icon" className="w-6 h-6 ml-2" />
                </h1>
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm bảo vật..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 pl-10 rounded-2xl border border-gray-300 bg-white w-80"
                        />
                        <img src="/magnifying-glass.png" alt="search icon" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center">
                        <p className="text-white">Loading...</p>
                    </div>
                ) : (
                    <div className="mt-2 grid md:grid-cols-8 grid-cols-4 gap-4">
                        {filteredArtifacts.map((artifact, index) => {
                            const nameParts = artifact.name.split(' ');
                            const displayName = nameParts.length > 2 ? `${nameParts[0]}...` : artifact.name;
                            return (
                                <div
                                    key={index}
                                    className="flex flex-col items-center cursor-pointer"
                                    onClick={() => fetchArtifactDetails(artifact.id)}
                                >
                                    <img
                                        src={artifact.img}
                                        alt={artifact.name}
                                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-tr-lg rounded-bl-lg border-1 hover:border-amber-50 hover:scale-105 cursor-pointer transition-all"
                                        loading="lazy"
                                    />
                                    <p className="mt-1 text-xs text-white">
                                        <span className="block md:hidden">{displayName}</span>
                                        <span className="hidden md:block">{artifact.name}</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {selectedArtifact && (
                <div ref={artifactDetailsRef} className="flex flex-col items-center gap-4 relative p-4 md:px-20 lg:px-40">
                    <div className="w-full rounded-lg sticky top-4 z-10 backdrop-blur-md bg-white/10">
                        <div className="w-full h-full flex flex-col items-start p-4">
                            <h2 className="mt-2 text-xl font-extrabold text-white text-center w-full">{selectedArtifact.name}</h2>
                            <p className="text-white text-sm md:text-base mt-4 mb-2 text-left flex items-center justify-start gap-2 font-bold w-full">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-white flex-shrink-0" />
                                <span className="inline">Mô tả: </span>
                            </p>
                            <p className="text-white text-sm md:text-base mb-4 text-left w-full">
                                {selectedArtifact.description}
                            </p>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                                <img
                                    src={selectedArtifact.img_figure_1}
                                    alt={`${selectedArtifact.name} figure 1`}
                                    className="w-54 h-auto md:w-76 object-contain rounded"
                                    loading="lazy"
                                />
                                <img
                                    src={selectedArtifact.img_figure_2}
                                    alt={`${selectedArtifact.name} figure 2`}
                                    className="w-54 h-auto md:w-76 object-contain rounded"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default ArtifactPart;