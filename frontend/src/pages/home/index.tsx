import { useState, useRef, useEffect } from 'react';
import Heroes from '../../components/heroes-part';
import ArtifactPart from '../../components/artifact-part';
import PetPart from '../../components/pet-part';
import Video from '../../components/video-banner/video';
import SideAd from '../../components/side-ad/side-ad';

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
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default Index;