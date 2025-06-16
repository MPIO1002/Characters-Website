import { useState, useEffect } from 'react';
import VideoBg from '../../assets/video.mp4';
import VideoBgDesktop from '../../assets/video_banner.mp4';

interface VideoBannerProps {
  onTabChange: (tab: 'heroes' | 'artifact') => void;
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
    if (tab === 'heroes' || tab === 'artifact') {
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
        src="/cloud_left.PNG"
        alt="Cloud Left"
        className="absolute bottom-0 left-0 w-40 md:w-64 z-10 pointer-events-none select-none"
        draggable={false}
      />
      {/* Đám mây phải */}
      <img
        src="/cloud_right.PNG"
        alt="Cloud Right"
        className="absolute bottom-0 right-0 w-40 md:w-64 z-10 pointer-events-none select-none"
        draggable={false}
      />
      {/* Ba button nổi lên trên */}
      <div className="absolute left-1/2 -translate-x-1/2 flex justify-center gap-2 md:gap-20 z-20 bottom-4 md:bottom-20 shadow-lg">
        <img
          src="/vohiep_btn.PNG"
          alt="Võ Hiệp"
          onClick={() => handleClick('heroes')}
          className="cursor-pointer h-[35px] md:h-[60px] rounded-sm border border-black transition duration-300 hover:brightness-125 hover:scale-110"
        />
        <img
          src="/baovat_btn.PNG"
          alt="Bảo Vật"
          onClick={() => handleClick('artifact')}
          className="cursor-pointer h-[35px] md:h-[60px] rounded-sm border border-black transition duration-300 hover:brightness-125 hover:scale-110"
        />
        <img
          src="/linhthu_btn.PNG"
          alt="Linh Thú"
          onClick={() => handleClick('pet')}
          className="cursor-pointer h-[35px] md:h-[60px] rounded-sm border border-black transition duration-300 hover:brightness-125 hover:scale-110"
        />
      </div>
    </div>
  );
};

export default VideoBanner;