import React, { useEffect, useState } from 'react';
import styles from './BacktestingResults.module.css';


const LiveResults = ({ result }) => {
    const [displayTrades, setDisplayTrades] = useState([]); 

    useEffect(() => {
        if (result && result.trades) {
            console.log('1:');
            const lastTradeTime = displayTrades.length
                ? displayTrades[displayTrades.length - 1].time
                : null;

            if (result.trades.length > 0) {
                console.log('2:');
                const newTrades = result.trades.filter(
                    (trade) => !lastTradeTime || new Date(trade.time) > new Date(lastTradeTime)
                );

                if (newTrades.length > 0) {
                    console.log('3:', result);
                    setDisplayTrades((prev) => [...prev, ...newTrades]);
                } else {
                    console.log('4:');
                   
                    setDisplayTrades((prev) => [
                        ...prev,
                        { time: 'No new trade', type: '-', price: '-', indicators: {}, profit: null },
                    ]);
                }
            } else {
                console.log('5:');
              
                setDisplayTrades((prev) => [
                    ...prev,
                    { time: 'No new trade', type: '-', price: '-', indicators: {}, profit: null },
                ]);
            }
        }
    }, [result]);
    
    
    

    return (
        <div className={styles.resultsContainer}>
            <div className={styles.resultsTitle}>
                <h4 style={{color:"black", fontFamily:"sans-serif"}}>Live Trading Results</h4>
                <div>
                    <h5>
                        <img
                            src={`../../${result.symbol}.png`}
                            alt={result.symbol}
                            style={{ width: '30px', height: '30px', marginRight: '8px' }}
                        />
                        {result.symbol} 
                    </h5>
                    <h6>Time Frame: {result.timeframe}</h6>
                    <h6>Initial Balance: {result.initial_balance.toFixed(2)} USDT</h6>
                    <h6>Final Balance: {result.current_balance ? result.current_balance.toFixed(2) +" USDT": '-'} </h6>
                    <h6 style={{ color: result.profit > 0 ? 'green' : result.profit < 0 ? 'red' : 'rgb(85, 85, 85)' }}>
                        Profit: {result.profit ? result.profit.toFixed(2) +" USDT": '-'} 
                    </h6>
                </div>
            </div>

            <table className={styles.resultsTable}>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
                    {displayTrades.map((trade, index) => (
                        <tr key={index}>
                            <td>{trade.time.split('.')[0]}</td>
                            <td style={{ textTransform: 'capitalize' }}>{trade.type}</td>
                            <td>{trade.price}</td>
                            
                            <td
                                style={{
                                    color:
                                        trade.profit > 0
                                            ? 'green'
                                            : trade.profit < 0
                                            ? 'rgb(255, 15, 11)'
                                            : 'black',
                                    fontWeight: 'bold',
                                }}
                            >
                                {trade.profit ? trade.profit.toFixed(3) : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LiveResults;
