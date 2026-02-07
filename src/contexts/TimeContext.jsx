import { createContext, useContext, useState, useEffect } from 'react';

const TimeContext = createContext();

export const TimeProvider = ({ children }) => {
    const [isDay, setIsDay] = useState(true);

    useEffect(() => {
        const checkTime = () => {
            const hour = new Date().getHours();
            setIsDay(hour >= 6 && hour < 18); // Simple 6am-6pm day cycle
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <TimeContext.Provider value={{ isDay }}>
            {children}
        </TimeContext.Provider>
    );
};

export const useTime = () => useContext(TimeContext);
