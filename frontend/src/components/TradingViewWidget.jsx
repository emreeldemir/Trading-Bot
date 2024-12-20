import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol = "BINANCE:BTCUSDT", activeStrategies = [] , frame = "D" }) {
  const container = useRef();

  useEffect(() => {
  
    while (container.current.firstChild) {
      container.current.removeChild(container.current.firstChild);
    }


    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "${frame}",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "calendar": false,
        "studies": ${JSON.stringify(activeStrategies)},
        "support_host": "https://www.tradingview.com"
      }`;

    container.current.appendChild(script);
  }, [symbol, activeStrategies]); 

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "calc(100% - 32px)", width: "100%" }}
      ></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        ></a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
