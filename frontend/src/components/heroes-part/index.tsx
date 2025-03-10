import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import config from "../api-config/api-config";

const Heroes = () => {
  interface Hero {
    id: number;
    name: string;
    img: string;
    story: string;
    transform: string;
    skills: { id: number; name: string; star: string; description: string; hero_id: number }[];
    fates: { id: number; name: string; description: string; hero_id: number }[];
    pets: { id: number; name: string; description: string; hero_id: number }[];
    artifacts: { id: number; name: string; description: string; hero_id: number }[];
  }

  const [heroes_api, setHeroesAPI] = useState<Hero[]>([]);
  const [selectedHero_api, setSelectedHeroAPI] = useState<Hero | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('skills');
  const heroDetailsRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchHeroes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.apiBaseUrl}/heroes`);
        setHeroesAPI(response.data.data);
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroes();
  }, []);

  const fetchHeroDetails = async (id: number) => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/heroes/${id}`);
      setSelectedHeroAPI(response.data.data);
      heroDetailsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching character:', error);
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
  }, 300);

  const filteredHeroes = useMemo(() => {
    return heroes_api.filter(hero =>
      hero.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [heroes_api, searchTerm]);

  return (
    <div>
      <div className="container mx-auto p-4 bg-red px-4 md:px-20 lg:px-40">
        <h1 className="mt-1 mb-4 flex justify-center items-center font-bold text-2xl text-white">
          <img src="/next.png" alt="icon" className="w-6 h-6 mr-2 transform rotate-180" />
          DANH SÁCH TƯỚNG
          <img src="/next.png" alt="icon" className="w-6 h-6 ml-2" />
        </h1>
        <div className="flex justify-center mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm tướng..."
              onChange={(e) => handleSearch(e.target.value)}
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
            {filteredHeroes.map((hero, index) => {
              const nameParts = hero.name.split(' ');
              const displayName = nameParts.length > 2 ? `${nameParts[0]}...` : hero.name;

              return (
                <div key={index} className="flex flex-col items-center" onClick={() => fetchHeroDetails(hero.id)}>
                  <img
                    src={hero.img}
                    alt={hero.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-tr-lg rounded-bl-lg border-1 hover:border-amber-50 hover:scale-105 cursor-pointer transition-all"
                    loading="lazy"
                  />
                  <p className="mt-1 text-xs text-white">
                    <span className="block md:hidden">{displayName}</span>
                    <span className="hidden md:block">{hero.name}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedHero_api && (
        <div ref={heroDetailsRef} className="flex flex-col items-center gap-4 relative bg-amber-100 md:px-20 lg:px-40">
          <div className="w-full rounded-lg sticky top-4 z-10">
            <div className="w-full h-full flex flex-col items-center p-4">
              <img src={selectedHero_api.transform} className='object-cover w-full h-auto mb-4' loading="lazy"></img>
              <div className="flex flex-col mb-4 w-full">
                <h2 className="mt-2 text-xl font-bold text-black">Tiểu sử:</h2>
                <p className="text-black text-sm md:text-base">{selectedHero_api.story}</p>
              </div>

              <div className="w-full">
                <div className="flex justify-around mb-0">
                  <button onClick={() => setActiveTab('skills')} className={`w-1/4 px-4 py-2 rounded-t-lg font-bold ${activeTab === 'skills' ? 'bg-amber-200 border-t-1 border-l-1 border-r-1' : 'bg-gray-200 border-1'}`}>Kỹ năng</button>
                  <button onClick={() => setActiveTab('fates')} className={`w-1/4 px-4 py-2 rounded-t-lg font-bold ${activeTab === 'fates' ? 'bg-amber-200 border-t-1 border-l-1 border-r-1' : 'bg-gray-200 border-1'}`}>Duyên tướng</button>
                  <button onClick={() => setActiveTab('pets')} className={`w-1/4 px-4 py-2 rounded-t-lg font-bold ${activeTab === 'pets' ? 'bg-amber-200 border-t-1 border-l-1 border-r-1' : 'bg-gray-200 border-1'}`}>Duyên linh thú</button>
                  <button onClick={() => setActiveTab('artifacts')} className={`w-1/4 px-4 py-2 rounded-t-lg font-bold ${activeTab === 'artifacts' ? 'bg-amber-200 border-t-1 border-l-1 border-r-1' : 'bg-gray-200 border-1'}`}>Duyên bảo vật</button>
                </div>

                <div className="relative w-full h-[500px] flex flex-col items-start justify-center transition-transform duration-500">
                  {activeTab === 'skills' && (
                    <div className="absolute top-0 flex flex-col items-start w-full z-10 transition-transform duration-500">
                      <div className='bg-amber-200 border-b-1 border-l-1 border-r-1 mb-4 p-4 rounded-lg rounded-tl-none rounded-tr-none w-full'>
                        <div className="flex flex-col gap-4 mb-4 w-full">
                          {selectedHero_api.skills && selectedHero_api.skills.map((skill, index) => (
                            <div key={index} className="flex flex-col items-start w-full">
                              <h3 className="font-bold">{skill.name}</h3>
                              <div className="flex items-center">
                                <p className="text-sm">{skill.star}</p>
                                <img src="/5-Point-Star.png" alt="star" className="w-4 h-4" />
                              </div>
                              <p className="mb-2">{skill.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'fates' && (
                    <div className="absolute top-0 flex flex-col items-start w-full z-20 transition-transform duration-500">
                      <div className='bg-amber-200 border-b-1 border-l-1 border-r-1 mb-4 p-4 rounded-lg rounded-tl-none rounded-tr-none w-full'>
                        <div className="flex flex-col gap-4 mb-4 w-full">
                          {selectedHero_api.fates && selectedHero_api.fates.map((fate, index) => (
                            <div key={index} className="flex flex-col items-start w-full">
                              <h3 className="font-bold">{fate.name}</h3>
                              <p className="mb-2">{fate.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pets' && (
                    <div className="absolute top-0 flex flex-col items-start w-full z-30 transition-transform duration-500">
                      <div className='bg-amber-200 border-b-1 border-l-1 border-r-1 mb-4 p-4 rounded-lg rounded-tl-none rounded-tr-none w-full'>
                        <div className="flex flex-col gap-4 mb-4 w-full">
                          {selectedHero_api.pets && selectedHero_api.pets.map((pet, index) => (
                            <div key={index} className="flex flex-col items-start w-full">
                              <h3 className="font-bold">{pet.name}</h3>
                              <p className="mb-2">{pet.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'artifacts' && (
                    <div className="absolute top-0 flex flex-col items-start w-full z-40 transition-transform duration-500">
                      <div className='bg-amber-200 border-b-1 border-l-1 border-r-1 mb-4 p-4 rounded-lg rounded-tl-none rounded-tr-none w-full'>
                        <div className="flex flex-col gap-4 mb-4 w-full">
                          {selectedHero_api.artifacts && selectedHero_api.artifacts.map((artifact, index) => (
                            <div key={index} className="flex flex-col items-start w-full">
                              <h3 className="font-bold">{artifact.name}</h3>
                              <p className="mb-2">{artifact.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Heroes;