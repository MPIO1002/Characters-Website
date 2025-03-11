import React, { useState } from 'react';
import '../../index.css';

const SideAd: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleAd = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            className={`fixed z-50 top-1/2 transform -translate-y-1/2 transition-transform duration-1000 ease-in-out ${isExpanded ? '-right-[18px] slide-in' : '-right-[174px]'
                }`}
            style={{ width: '200px' }}
        >
            <div
                className="w-[183px] h-[447px] bg-cover bg-center cursor-pointer"
                style={{ backgroundImage: 'url(/bg-side-1.png)' }}
                onClick={toggleAd}
            >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                    <div className="">
                        <a href="https://play.google.com/store/apps/details?id=mobi.mgh.mong.daihiep" target="_blank" rel="noreferrer">
                            <button className="w-32 h-10 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(/android.png)' }} /></a>
                    </div>
                    <div className="">
                        <a href="https://legensign.com/download/173470725916765883b31c0b" target="_blank" rel="noreferrer">
                            <button className="w-32 h-10 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(/ios.png)' }} /></a>
                    </div>
                    <div className="">
                        <a href="https://play.google.com/store/apps/details?id=mobi.mgh.mong.daihiep" target="_blank" rel="noreferrer">
                            <button className="w-32 h-10 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(/apk.png)' }} /></a>
                    </div>
                    <div className="">
                        <a href="https://mhgh.ggo.vn/huong-dan-nap-the/" target="_blank" rel="noreferrer">
                            <button className="w-32 h-32 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(/nap-the-vuong.png)' }} /></a>
                    </div>
                    <div className="">
                        <a href="https://mhgh.ggo.vn/huong-dan-xoa-tai-khoan/" target="_blank" rel="noreferrer">
                            <button className="w-32 h-32 bg-cover ml-[37px] cursor-pointer" style={{ backgroundImage: 'url(/nhap-code-vuong.png)' }} /></a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SideAd;