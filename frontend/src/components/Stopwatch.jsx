import React, { useState, useEffect } from 'react';

const Stopwatch = ({ isRunning, onReset }) => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isRunning) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1016); 
        } else if (!isRunning && time !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        if (!isRunning) {
            setTime(0); 
        }
    }, [isRunning, onReset]);

    return (
        <div style={{ textAlign: 'center', marginBottom: '10px', backgroundColor:'rgb(180, 184, 191)',padding:'6px', borderRadius:'5px', color:'black' }}>
            <h2 style={{color:'black'}}>
                {Math.floor(time / 60)}:
                {time % 60 < 10 ? `0${time % 60}` : time % 60}
            </h2>
        </div>
    );
};

export default Stopwatch;
