import { useState, useEffect } from 'react';
import VideoBg from '../../assets/video.mp4';
import VideoBgDesktop from '../../assets/video_banner.mp4';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesDown } from '@fortawesome/free-solid-svg-icons';

interface VideoBannerProps {
  onTabChange: (tab: 'heroes' | 'artifact' | 'pet' ) => void;
  onScrollToContent: () => void;
}

const VideoBanner = ({ onTabChange, onScrollToContent }: VideoBannerProps) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Hàm xử lý khi bấm nút: đổi tab và scroll xuống
  const handleClick = (tab: 'heroes' | 'artifact' | 'pet') => {
    if (tab === 'heroes' || tab === 'artifact' || tab === 'pet') {
      onTabChange(tab);
    }
    onScrollToContent();
  };

  return (
    <div className="relative w-full">
      {isDesktop ? (
        <video src={VideoBgDesktop} autoPlay loop muted className="w-full video-container" />
      ) : (
        <video src={VideoBg} autoPlay loop muted className="w-full" />
      )}
      {/* Đám mây trái */}
      <img
        src="cloud_left.PNG"
        alt="Cloud Left"
        className="absolute bottom-0 left-0 w-40 md:w-64 z-10 pointer-events-none select-none"
        draggable={false}
      />
      {/* Đám mây phải */}
      <img
        src="cloud_right.PNG"
        alt="Cloud Right"
        className="absolute bottom-0 right-0 w-40 md:w-64 z-10 pointer-events-none select-none"
        draggable={false}
      />
      {/* Ba button nổi lên trên */}
      <div className="absolute left-1/2 -translate-x-1/2 flex justify-center gap-2 md:gap-20 z-20 bottom-[-50px] md:bottom-[-100px] shadow-lg">
        <img
          src="vohiep_btn.PNG"
          alt="Võ Hiệp"
          onClick={() => handleClick('heroes')}
          className="cursor-pointer h-[35px] md:h-[60px] rounded-sm border border-black transition duration-300 hover:brightness-125 hover:scale-110"
        />
        <img
          src="baovat_btn.PNG"
          alt="Bảo Vật"
          onClick={() => handleClick('artifact')}
          className="cursor-pointer h-[35px] md:h-[60px] rounded-sm border border-black transition duration-300 hover:brightness-125 hover:scale-110"
        />
        <img
          src="linhthu_btn.PNG"
          alt="Linh Thú"
          onClick={() => handleClick('pet')}
          className="cursor-pointer h-[35px] md:h-[60px] rounded-sm border border-black transition duration-300 hover:brightness-125 hover:scale-110"
        />
      </div>
      {/* Icon scroll xuống */}
      <button
        onClick={onScrollToContent}
        className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-6 z-20 border-2 border-white rounded-full p-2 shadow-lg transition animate-bounce cursor-pointer"
        aria-label="Xuống dưới"
      >
        <FontAwesomeIcon icon={faAnglesDown} className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};

export default VideoBanner;