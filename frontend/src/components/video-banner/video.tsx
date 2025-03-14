import { useState, useEffect } from 'react';
import VideoBg from '../../assets/video.mp4';

const VideoBanner = () => {
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

  return (
    <div className='video-container'>
      {isDesktop ? (
        <img src="/banner-img.png" alt="Banner" />
      ) : (
        <video src={VideoBg} autoPlay loop muted />
      )}
    </div>
  );
};

export default VideoBanner;