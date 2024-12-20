import React, { useEffect } from 'react';

const TickerTape = () => {
  useEffect(() => {
   
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { description: "", proName: "BINANCE:FETUSDT" },
        { description: "", proName: "BINANCE:RENDERUSDT" },
        { description: "", proName: "BINANCE:AVAXUSDT" },
        { description: "", proName: "BINANCE:ETHUSDT" },
        { description: "", proName: "BINANCE:BTCUSDT" },
        { description: "", proName: "BINANCE:SOLUSDT" },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });
    document.querySelector('.tradingview-widget-container__widget').appendChild(script);

    
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="tradingview-widget-container">
      <div className="tradingview-widget-container__widget"></div>
     
    </div>
  );
};

export default TickerTape;
