import React, { useEffect, useState } from 'react';
import styles from './BacktestingResults.module.css';


const BacktestResults = ({ result, activeStrategies }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loadingImage, setLoadingImage] = useState(true);

    useEffect(() => {
        if (result) {
            const filename = `${result.symbol}_${result.timeframe}_chart.png`;
            const timestamp = new Date().getTime();
            const imageUrl = `http://localhost:5000/photo/${filename}?t=${timestamp}`;

            setLoadingImage(true); 

            fetch(imageUrl)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Resim yüklenemedi');
                    }
                    return response.url;
                })
                .then((url) => {
                    setImageUrl(url);
                    setLoadingImage(false); 
                })
                .catch((error) => {
                    console.error('Resim yüklenirken hata:', error);
                    setLoadingImage(false); 
                });
        }
    }, [result]);

    if (!result) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.resultsContainer}>
            <div className={styles.resultsTitle}>
                <h4 style={{color:"black"}} >Backtest Results</h4>
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
                    <h6>Final Balance: {result.final_balance.toFixed(2)} USDT</h6>
                    <h6 style={{ color: result.profit > 0 ? 'green' : result.profit < 0 ? 'red' : 'black' }}>
                        Profit: {result.profit.toFixed(2)} USDT
                    </h6>
                    <h6>Trades: {result.number_of_trades}</h6>
                </div>
            </div>

           

            <div className={styles.imageContainer} key={result.symbol + result.timeframe}>
                {loadingImage ? (
                    <p>Resim yükleniyor...</p>
                ) : imageUrl ? (
                    <img src={imageUrl} alt="Backtest Chart" className={styles.chartImage} />
                ) : (
                    <p>Resim bulunamadı</p>
                )}
            </div>

            <table className={styles.resultsTable}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Indicators</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
                    {result.trades.map((trade, index) => (
                        <tr key={index}>
                            <td>{trade.time.split('.')[0]}</td>
                            <td style={{ textTransform: 'capitalize' }}>{trade.type}</td>

                            <td>
                                <div>
                                    {trade.indicators && (trade.indicators.RSI !== null && trade.indicators.RSI !== undefined && !isNaN(trade.indicators.RSI)) && (
                                        <p>RSI: {trade.indicators.RSI.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.BBL !== null && trade.indicators.BBL !== undefined && !isNaN(trade.indicators.BBL)) && (
                                        <p>BBL: {trade.indicators.BBL.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.BBM !== null && trade.indicators.BBM !== undefined && !isNaN(trade.indicators.BBM)) && (
                                        <p>BBM: {trade.indicators.BBM.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.BBU !== null && trade.indicators.BBU !== undefined && !isNaN(trade.indicators.BBU)) && (
                                        <p>BBU: {trade.indicators.BBU.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.MACD !== null && trade.indicators.MACD !== undefined && !isNaN(trade.indicators.MACD)) && (
                                        <p>MACD: {trade.indicators.MACD.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.MACDh !== null && trade.indicators.MACDh !== undefined && !isNaN(trade.indicators.MACDh)) && (
                                        <p>MACDh: {trade.indicators.MACDh.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.MACDs !== null && trade.indicators.MACDs !== undefined && !isNaN(trade.indicators.MACDs)) && (
                                        <p>MACDs: {trade.indicators.MACDs.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.SMA_long !== null && trade.indicators.SMA_long !== undefined && !isNaN(trade.indicators.SMA_long)) && (
                                        <p>SMA Long: {trade.indicators.SMA_long.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.SMA_short !== null && trade.indicators.SMA_short !== undefined && !isNaN(trade.indicators.SMA_short)) && (
                                        <p>SMA Short: {trade.indicators.SMA_short.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.SUPERT !== null && trade.indicators.SUPERT !== undefined && !isNaN(trade.indicators.SUPERT)) && (
                                        <p>SUPERT: {trade.indicators.SUPERT.toFixed(1)}</p>
                                    )}
                                    {trade.indicators && (trade.indicators.SUPERTd !== null && trade.indicators.SUPERTd !== undefined && !isNaN(trade.indicators.SUPERTd)) && (
                                        <p>SUPERTd: {trade.indicators.SUPERTd.toFixed(1)}</p>
                                    )}
                                </div>



                            </td>
                            <td
                                style={{
                                    color: trade.profit > 0 ? 'green' : trade.profit < 0 ? 'rgb(255, 15, 11)' : 'black',
                                    fontWeight: 'bold',
                                }}
                            >
                                {trade.profit ? trade.profit.toFixed(3) : '-'}
                            </td>
                        </tr>

                    ))}
                </tbody>

            </table>
        </div >
    );
};

export default BacktestResults;
