import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import EventsWidget from './EventsWidget';
import TimelineWidget from './TimelineWidget';
import CryptoHeatmapWidget from './CryptoHeatmapWidget';

const HomePage = () => {
  const navigate = useNavigate();

  const handleBacktestingClick = () => {
    navigate('/backtesting');
  };

  const handleLiveTradingClick = () => {
    navigate('/livetrading');
  };

  return (
    <div className={styles.container}>
   
      <div className={styles['widget-container']}>
        <EventsWidget />
      </div>
    
      <div className={styles['middle-container']}>
     
        <div className={styles['buttons-container']}>
          <button onClick={handleBacktestingClick} className={styles['option-button']}>
            Backtesting
          </button>
          <button onClick={handleLiveTradingClick} className={styles['option-button']}>
            Live Trading
          </button>
        </div>

        
        <div className={styles['heatmap-container']}>
          <CryptoHeatmapWidget />
        </div>
      </div>

    
      <div className={styles['timeline-container']}>
        <TimelineWidget />
      </div>
    </div>
  );
};

export default HomePage;
