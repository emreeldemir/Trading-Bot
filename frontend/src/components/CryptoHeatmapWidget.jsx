import React, { useEffect, useRef } from 'react';

const CryptoHeatmapWidget = () => {
  const containerRef = useRef();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "dataSource": "Crypto",
        "blockSize": "market_cap_calc",
        "blockColor": "change",
        "locale": "en",
        "symbolUrl": "",
        "colorTheme": "dark",
        "hasTopBar": false,
        "isDataSetEnabled": false,
        "isZoomEnabled": true,
        "hasSymbolTooltip": true,
        "isMonoSize": false,
        "width": 950,
        "height": 500
      }
    `;
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ width: '500px', height: '500px' }}>
      <div className="tradingview-widget-container__widget"></div>
      
    </div>
  );
};

export default CryptoHeatmapWidget;
