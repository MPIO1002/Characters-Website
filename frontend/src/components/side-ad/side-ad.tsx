import React, { useState, useEffect, useRef } from 'react';
import '../../index.css';

const SideAd: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(() => window.innerWidth >= 1024);
  const adRef = useRef<HTMLDivElement>(null);

  const toggleAd = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (adRef.current && !adRef.current.contains(event.target as Node)) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={adRef}
      className={`fixed z-50 top-1/2 transform -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]`}
      style={{
        width: '200px',
        right: isExpanded ? '-18px' : '-174px',
      }}
    >
      <div
        className="w-[183px] h-[447px] bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: 'url(bg-side-1.png)' }}
        onClick={toggleAd}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-1">
          <div>
            <a href="https://play.google.com/store/apps/details?id=mobi.mgh.mong.daihiep" target="_blank" rel="noreferrer">
              <button className="w-32 h-10 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(android.png)' }} />
            </a>
          </div>
          <div>
            <a href="https://mhgh.ggo.vn/huong-dan-su-dung-testflight-de-cai-dat-mong-huyen-giang-ho/" target="_blank" rel="noreferrer">
              <button className="w-32 h-10 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(ios.png)' }} />
            </a>
          </div>
          <div>
            <a href="https://play.google.com/store/apps/details?id=mobi.mgh.mong.daihiep" target="_blank" rel="noreferrer">
              <button className="w-32 h-10 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(apk.png)' }} />
            </a>
          </div>
          <div>
            <a href="https://mhgh.ggo.vn/huong-dan-nap-the/" target="_blank" rel="noreferrer">
              <button className="w-32 h-32 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(nap-the-vuong.png)' }} />
            </a>
          </div>
          <div>
            <a href="https://mhgh.ggo.vn/huong-dan-xoa-tai-khoan/" target="_blank" rel="noreferrer">
              <button className="w-32 h-32 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(nhap-code-vuong.png)' }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideAd;