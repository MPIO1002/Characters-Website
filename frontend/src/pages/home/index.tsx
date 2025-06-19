import { useState, useRef, useEffect } from 'react';
import Heroes from '../../components/heroes-part';
import ArtifactPart from '../../components/artifact-part';
import PetPart from '../../components/pet-part';
import Video from '../../components/video-banner/video';
import SideAd from '../../components/side-ad/side-ad';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesUp } from '@fortawesome/free-solid-svg-icons';

const Index = () => {
    const [activeTab, setActiveTab] = useState<'heroes' | 'artifact' | 'pet' >('heroes');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const belowVideoRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);

    // Hàm scroll xuống dưới video
    const handleScrollToContent = () => {
        belowVideoRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Hàm scroll lên đầu trang
    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll lên đỉnh trang
    };

    // Hiện button khi cuộn tới đáy
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            // Kiểm tra nếu đã tới đáy (cách đáy <= 10px)
            setShowScrollTop(scrollY + windowHeight >= docHeight - 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div>
            <div ref={topRef}></div>
            <SideAd />
            <Video onTabChange={setActiveTab} onScrollToContent={handleScrollToContent} />
            <div ref={belowVideoRef}>
                {activeTab === 'heroes' && <Heroes />}
                {activeTab === 'artifact' && <ArtifactPart />}
                {activeTab === 'pet' && <PetPart />}
            </div>
            {/* Button lên đầu trang nhỏ, chỉ hiện khi ở đáy */}
            {showScrollTop && (
                <button
                    onClick={handleScrollToTop}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-100 transition animate-bounce cursor-pointer"
                    aria-label="Lên đầu trang"
                >
                    <FontAwesomeIcon icon={faAnglesUp} className="h-6 w-6 text-gray-700" />
                </button>
            )}
        </div>
    );
};

export default Index;