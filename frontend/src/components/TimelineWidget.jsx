import React, { useEffect, useRef } from 'react';

const TimelineWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';

  
    script.innerHTML = `
      {
        "feedMode": "all_symbols",
        "isTransparent": false,
        "displayMode": "regular",
        "width": "350",
        "height": "710",
        "colorTheme": "dark",
        "locale": "en"
      }
    `;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
     
    </div>
  );
};

export default TimelineWidget;
