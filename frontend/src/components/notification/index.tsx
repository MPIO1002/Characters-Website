import React, { useEffect, useState } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    const notificationStyles = type === 'success' 
        ? 'bg-green-700 border text-white'
        : 'bg-red-700 border text-white';

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 mb-4 rounded ${notificationStyles} ${show ? 'slide-in' : ''}`}>
            {message}
        </div>
    );
};

export default Notification;