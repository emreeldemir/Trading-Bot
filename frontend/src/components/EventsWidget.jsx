import React, { useEffect, useRef } from 'react';

const EventsWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';

    script.innerHTML = `
      {
        "colorTheme": "dark",
        "isTransparent": false,
        "width": "300",
        "height": "710",
        "locale": "en",
        "importanceFilter": "-1,0,1",
        "countryFilter": "tr,us"
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

export default EventsWidget;
