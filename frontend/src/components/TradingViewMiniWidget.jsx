import React, { useEffect, useRef } from 'react';

function TradingViewMiniWidgets() {
    const widgetRefs = useRef([]);

    const widgetConfigs = [
        {
            symbol: 'BINANCE:ETHUSDT',
            width: '250',
            height: '150',
        },
        {
            symbol: 'BINANCE:AVAXUSDT',
            width: '250',
            height: '150',
        },
        {
            symbol: 'BINANCE:RENDERUSDT',
            width: '250',
            height: '150',
        },
        {
            symbol: 'BINANCE:BTCUSDT',
            width: '250',
            height: '150',
        },
        {
            symbol: 'BINANCE:FETUSDT',
            width: '250',
            height: '150',
        },
        {
            symbol: 'BINANCE:SOLUSDT',
            width: '250',
            height: '150',
        },
    ];

    useEffect(() => {
        widgetConfigs.forEach((config, index) => {
            const container = widgetRefs.current[index];
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                ...config,
                locale: 'en',
                dateRange: '12M',
                colorTheme: 'dark',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.6)', 
            borderRadius: '10px', 
            
                isTransparent: false,
                autosize: false,
                largeChartUrl: '',
            });
            container.appendChild(script);
        });
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '2px' }}>
            {widgetConfigs.map((_, index) => (
                <div
                    key={index}
                    className="tradingview-widget-container"
                    ref={(el) => (widgetRefs.current[index] = el)}
                    style={{ flex: '0 1 auto', minWidth: '250px', height: '200px' }}
                >
                    <div className="tradingview-widget-container__widget"></div>
                </div>
            ))}
        </div>
    );
}

export default TradingViewMiniWidgets;
