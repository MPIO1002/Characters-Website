import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import config from "../api-config/api-config";
import '../../index.css';
import { faBookSkull, faHeartCirclePlus, faPaw, faShieldHalved, faCaretRight } from '@fortawesome/free-solid-svg-icons';

const ItemTypes = {
  TAB: 'tab',
};

interface TabProps {
  id: string;
  text: string;
  icon: any;
  index: number;
  moveTab: (dragIndex: number, hoverIndex: number) => void;
  setActiveTab: (id: string) => void;
  activeTab: string;
}

const Tab: React.FC<TabProps> = ({ id, text, icon, index, moveTab, setActiveTab, activeTab }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.TAB,
    hover(item: { id: string; index: number }) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveTab(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TAB,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <button
      ref={ref}
      onClick={() => setActiveTab(id)}
      className={`w-1/4 px-4 py-2 text-sm cursor-pointer rounded-t-lg font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${activeTab === id ? 'bg-amber-100 border-t-1 border-l-1 border-r-1' : 'bg-gray-200 border-1'
        }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <FontAwesomeIcon icon={icon} className="mb-1 md:mb-0" />
      <span className="text-xs md:text-sm">{text}</span>
    </button>
  );
};

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
  const [tabs, setTabs] = useState([
    { id: 'skills', text: 'Kỹ năng', icon: faBookSkull },
    { id: 'fates', text: 'Duyên tướng', icon: faHeartCirclePlus },
    { id: 'pets', text: 'Duyên linh thú', icon: faPaw },
    { id: 'artifacts', text: 'Duyên bảo vật', icon: faShieldHalved },
  ]);
  const heroDetailsRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const heroesPerPage = 24;
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  useEffect(() => {
    const fetchHeroes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.apiBaseUrl}/heroes`);
        setHeroesAPI(response.data.data);
        if (response.data.data && response.data.data.length > 0) {
          // Gọi tiếp API lấy chi tiết tướng đầu tiên
          const firstHeroId = response.data.data[0].id;
          const detailRes = await axios.get(`${config.apiBaseUrl}/heroes/${firstHeroId}`);
          setSelectedHeroAPI(detailRes.data.data);
        }
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

  const indexOfLastHero = currentPage * heroesPerPage;
  const indexOfFirstHero = indexOfLastHero - heroesPerPage;
  const currentHeroes = filteredHeroes.slice(indexOfFirstHero, indexOfLastHero);
  const totalPages = Math.ceil(filteredHeroes.length / heroesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    if (selectedHero_api) {
      setIsFlipped(true);
      const timeout = setTimeout(() => {
        setIsFlipped(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [selectedHero_api]);

  const moveTab = (dragIndex: number, hoverIndex: number) => {
    const draggedTab = tabs[dragIndex];
    const updatedTabs = [...tabs];
    updatedTabs.splice(dragIndex, 1);
    updatedTabs.splice(hoverIndex, 0, draggedTab);
    setTabs(updatedTabs);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="min-h-screen"
        style={{
          backgroundImage: "url('/new_bg.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto py-8 px-4 md:px-20 lg:px-40">
          <div className="backdrop-blur-md bg-white/10 p-4 rounded-lg">
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
                {currentHeroes.map((hero, index) => {
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
            {/* Pagination */}
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
        </div>
        {selectedHero_api && (
          <div ref={heroDetailsRef} className="flex flex-col items-center gap-4 px-4 py-4 relative md:px-20 lg:px-40">
            <div className="backdrop-blur-md bg-black/30 p-4 rounded-lg md:px-20 lg:px-40">
              <div className="w-full rounded-lg sticky top-4 z-10">
                <div className="w-full h-full flex flex-col items-center p-4">
                  <img
                    src={selectedHero_api.transform}
                    className={`object-cover w-full h-auto mb-4 cursor-pointer ${isFlipped ? 'flip-in' : ''}`}
                    loading="lazy"
                  />
                  <div className="flex flex-col mb-4 w-full">
                    <h2 className="mt-2 text-xl font-bold text-white">Tiểu sử:</h2>
                    <p className="text-white text-sm md:text-base">{selectedHero_api.story}</p>
                  </div>

                  <div className="w-full">
                    <div className="flex justify-around mb-0">
                      {tabs.map((tab, index) => (
                        <Tab
                          key={tab.id}
                          id={tab.id}
                          text={tab.text}
                          icon={tab.icon}
                          index={index}
                          moveTab={moveTab}
                          setActiveTab={setActiveTab}
                          activeTab={activeTab}
                        />
                      ))}
                    </div>

                    <div className="relative w-full h-[510px] flex flex-col items-start justify-center transition-transform duration-500">
                      {activeTab === 'skills' && (
                        <div className="absolute top-0 flex flex-col items-start w-full z-10 transition-transform duration-500">
                          <div className='bg-amber-100 border-b-1 border-l-1 border-r-1 mb-4 p-4 rounded-lg rounded-tl-none rounded-tr-none w-full'>
                            <div className="flex flex-col gap-4 mb-4 w-full">
                              {selectedHero_api.skills && selectedHero_api.skills.map((skill, index) => (
                                <div key={index} className="flex flex-col items-start w-full">
                                  <h3 className="font-bold flex items-center">
                                    <FontAwesomeIcon icon={faCaretRight} className="mr-2 text-black" />
                                    {skill.name}
                                  </h3>
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
                          <div className='bg-amber-100 border-b-1 border-l-1 border-r-1 mb-4 p-4 rounded-lg rounded-tl-none rounded-tr-none w-full'>
                            <div className="flex flex-col gap-4 mb-4 w-full">
                              {selectedHero_api.fates && selectedHero_api.fates.map((fate, index) => (
                                <div key={index} className="flex flex-col items-start w-full">
                                  <h3 className="font-bold flex items-center">
                                    <FontAwesomeIcon icon={faCaretRight} className="mr-2 text-black" />
                                    {fate.name}
                                  </h3>
                                  <p className="mb-2">{fate.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'pets' && (
                        <div className="absolute top-0 flex flex-col items-start w-full z-30 transition-transform duration-500">
                          <div className='bg-amber-100 border-b-1 border-l-1 border-r-1 mb-4 p-4 rounded-lg rounded-tl-none rounded-tr-none w-full'>
                            <div className="flex flex-col gap-4 mb-4 w-full">
                              {selectedHero_api.pets && selectedHero_api.pets.map((pet, index) => (
                                <div key={index} className="flex flex-col items-start w-full">
                                  <h3 className="font-bold flex items-center">
                                    <FontAwesomeIcon icon={faCaretRight} className="mr-2 text-black" />
                                    {pet.name}
                                  </h3>
                                  <p className="mb-2">{pet.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'artifacts' && (
                        <div className="absolute top-0 flex flex-col items-start w-full z-40 transition-transform duration-500">
                          <div className='bg-amber-100 border-b-1 border-l-1 border-r-1 mb-4 p-4 rounded-lg rounded-tl-none rounded-tr-none w-full'>
                            <div className="flex flex-col gap-4 mb-4 w-full">
                              {selectedHero_api.artifacts && selectedHero_api.artifacts.map((artifact, index) => (
                                <div key={index} className="flex flex-col items-start w-full">
                                  <h3 className="font-bold flex items-center">
                                    <FontAwesomeIcon icon={faCaretRight} className="mr-2 text-black" />
                                    {artifact.name}
                                  </h3>
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
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Heroes;
