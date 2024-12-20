import React, { useState, useEffect } from 'react';
import styles from './BacktestingForm.module.css';
import LiveResults from './LiveResults';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import TradingViewWidget from './TradingViewWidget';
import TickerTape from './TickerTape';
import './trade.css';
import Stopwatch from './Stopwatch';


const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const LiveTrading = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [activeStrategies, setActiveStrategies] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [liveResult, setLiveResult] = useState(null);
    const [resultKey, setResultKey] = useState(0);

    const [duration, setDuration] = useState(null);
    const [scrollToResults, setScrollToResults] = useState(false);
    const [selectedIndicators, setSelectedIndicators] = useState([]);
    const [numericFields, setNumericFields] = useState({});
    const currencies = ['BTCUSDT', 'ETHUSDT', 'AVAXUSDT', 'RENDERUSDT', 'FETUSDT', 'SOLUSDT'];
    const bands = ['Lower', 'Middle', 'Upper'];
    const [snackbarOpen, setSnackbarOpen] = useState(false); 
    const [snackbarMessage, setSnackbarMessage] = useState(''); 

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };


    const [formData, setFormData] = useState({
        currency: 'USD',
        duration: '',
        amount: '',
        indicators: [],
        indicatorValues: {}
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setSelectedIndicators((prev) =>
                checked ? [...prev, value] : prev.filter((ind) => ind !== value)
            );
            if (checked) {
                setNumericFields((prev) => ({
                    ...prev,
                    [value]: {},
                }));
            } else {
                setNumericFields((prev) => {
                    const updatedFields = { ...prev };
                    delete updatedFields[value];
                    return updatedFields;
                });
            }
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };

    const handleNumericChange = (e, indicator, field) => {
        const value = parseFloat(e.target.value);
        setNumericFields((prev) => ({
            ...prev,
            [indicator]: {
                ...prev[indicator],
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsRunning(false); 
        setSessionId(null); 
        setLiveResult(null);
        const { currency, amount, duration } = formData;
        setDuration(duration);

        if (!currency || !amount || !duration) {
            alert("Please fill in all necessary fields.");
            return;
        }

        const indicatorsParams = {};
        const strategyParams = {
            use_rsi: selectedIndicators.includes('RSI'),
            use_bollinger_bands: selectedIndicators.includes('BB'),
            use_sma_cross: selectedIndicators.includes('SMA'),
            use_ema_cross: selectedIndicators.includes('EMA'),
            use_macd: selectedIndicators.includes('MACD'),
            use_supertrend: selectedIndicators.includes('ST'),
            rsi_buy_threshold: numericFields.RSI?.buy_threshold || undefined,
            rsi_sell_threshold: numericFields.RSI?.sell_threshold || undefined,
            bb_buy_band: formData.buy_band || undefined,
            bb_sell_band: formData.sell_band || undefined
        };

        const strategies = [];
        if (selectedIndicators.includes('RSI')) strategies.push('STD;RSI');
        if (selectedIndicators.includes('BB')) strategies.push('STD;Bollinger_Bands');
        if (selectedIndicators.includes('SMA')) strategies.push('STD;SMA'); 
        if (selectedIndicators.includes('EMA')) strategies.push('STD;EMA'); 
        if (selectedIndicators.includes('MACD')) strategies.push('STD;MACD');
        if (selectedIndicators.includes('ST')) strategies.push('STD;Supertrend');

        setActiveStrategies(strategies);

        if (numericFields.RSI) indicatorsParams.rsi_period = numericFields.RSI.period;
        if (numericFields.BB) {
            indicatorsParams.bb_period = numericFields.BB.period;
            indicatorsParams.bb_std = numericFields.BB.std;
        }
        if (numericFields.SMA) {
            indicatorsParams.sma_short_period = numericFields.SMA.short_period;
            indicatorsParams.sma_long_period = numericFields.SMA.long_period;
        }
        if (numericFields.EMA) {
            indicatorsParams.ema_short_period = numericFields.EMA.short_period;
            indicatorsParams.ema_long_period = numericFields.EMA.long_period;
        }
        if (numericFields.MACD) {
            indicatorsParams.macd_fast_period = numericFields.MACD.fast_period;
            indicatorsParams.macd_slow_period = numericFields.MACD.slow_period;
            indicatorsParams.macd_signal_period = numericFields.MACD.signal_period;
        }
        if (numericFields.ST) {
            indicatorsParams.st_period = numericFields.ST.period;
            indicatorsParams.st_multiplier = numericFields.ST.multiplier;
        }

        const requestBody = {
            symbol: currency,
            initial_balance: Number(amount),
            indicators_params: indicatorsParams,
            strategy_params: strategyParams,
            trading_duration: Number(duration),
        };

        setSymbol(currency || 'BTCUSDT');
        
        try {
            const response = await fetch('http://localhost:5000/live_trading', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                setSessionId(data.session_id);
                setLiveResult(null); 
                setResultKey((prevKey) => prevKey + 1); 
                setIsRunning(true);
                setSnackbarMessage('Live Trading has started!'); 
                setSnackbarOpen(true);             } else {
                const errorMessage = await response.text();
                console.error('Hata:', errorMessage);

                setSnackbarMessage('Başlatılamadı: ' + errorMessage); 
                setSnackbarOpen(true);             }
        } catch (error) {
            console.error('Hata:', error);
            setSnackbarMessage('Bir hata oluştu!'); 
            setSnackbarOpen(true);         }
    };

    useEffect(() => {
        if (!sessionId) return;

        let counter = 0;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:5000/live_trading/${sessionId}`);
                if (response.ok) {

                    const data = await response.json();
                    console.log('Canlı işlem sonucu:', data);
                    setLiveResult(data);

                    if (data.status === 'completed' || data.status === 'stopped') {
                        clearInterval(interval);
                        setIsRunning(false);
                        setSnackbarMessage('Live trading simulation completed!');
                        setSnackbarOpen(true); 
                    } else {
                        counter += 1;
                        if (counter >= duration) {
                            clearInterval(interval);
                            setIsRunning(false);
                            setSnackbarMessage('Live trading simulation completed!');
                            setSnackbarOpen(true); 
                        } else {


                        }
                    }
                }

            } catch (error) {
                console.error('GET hatası:', error);
                clearInterval(interval);
                setSnackbarMessage('Bir hata oluştu!');
                setSnackbarOpen(true); 
            }
        }, 61000);

        return () => {
            clearInterval(interval);
        };
    }, [sessionId, duration]);





    return (
        <div>
            <TickerTape />

            <div className="container">

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000} 
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
                >
                    <Alert onClose={handleSnackbarClose} severity="success">
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

                <form onSubmit={handleSubmit} className={styles.formContainer}  >
                    <h2 style={{ marginBottom: "30px", marginBottom: "22px" }} >Live Trading</h2>
                    <label >
                        Crypto currency:
                        <select name="currency" value={formData.currency} onChange={handleChange}>
                            <option value="">Crypto currency</option>
                            {currencies.map((currency) => (
                                <option key={currency} value={currency}>
                                    {currency}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label >
                        Initial balance:
                        <input
                            type="number"
                            name="amount"
                            placeholder="Balance"
                            min="0"
                            onChange={handleChange}
                            value={formData.amount}
                        />
                    </label>
                    <label >
                        Trading duration:
                        <input
                            type="number"
                            name="duration"
                            placeholder="Trading duration"
                            min="0"
                            onChange={handleChange}
                            value={formData.duration}
                        />
                    </label>
                    <fieldset className={styles.radioGroup} style={{ marginTop: "20px" }}>
                        <legend>Indicators</legend>
                        <div className="radioGroup">
                            <label style={{ marginTop: "11px" }}>
                                <input
                                    type="checkbox"
                                    value="RSI"
                                    onChange={handleChange}
                                />
                                RSI
                                {selectedIndicators.includes("RSI") && (
                                    <div className="indicator-fields">
                                        <input
                                            type="number"
                                            placeholder="RSI Period"
                                            onChange={(e) => handleNumericChange(e, 'RSI', 'period')}
                                        />
                                        <input
                                            type="number"
                                            placeholder="RSI Buy Threshold"
                                            onChange={(e) => handleNumericChange(e, 'RSI', 'buy_threshold')}
                                        />
                                        <input
                                            type="number"
                                            placeholder="RSI Sell Threshold"
                                            onChange={(e) => handleNumericChange(e, 'RSI', 'sell_threshold')}
                                        />
                                    </div>
                                )}
                            </label>

                            <label style={{ marginTop: "11px" }}>
                                <input
                                    type="checkbox"
                                    value="BB"
                                    onChange={handleChange}
                                />

                                BB
                                {selectedIndicators.includes("BB") && (
                                    <div className="indicator-fields">
                                        <input
                                            type="number"
                                            placeholder="BB Period"
                                            onChange={(e) => handleNumericChange(e, 'BB', 'period')}
                                        />
                                        <input
                                            type="number"
                                            placeholder="BB Std Dev"
                                            onChange={(e) => handleNumericChange(e, 'BB', 'std')}
                                        />
                                        <select style={{ width: "110px", marginLeft: "10px" }} name="buy_band" value={formData.band} onChange={handleChange}>
                                            <option value="">Buy Band</option>
                                            {bands.map((band) => (
                                                <option key={band} value={band}>
                                                    {band}
                                                </option>
                                            ))}
                                        </select>
                                        <select style={{ width: "110px", marginLeft: "10px" }} name="sell_band" value={formData.band} onChange={handleChange}>
                                            <option value="">Sell Band</option>
                                            {bands.map((band) => (
                                                <option key={band} value={band}>
                                                    {band}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </label>

                            <label style={{ marginTop: "11px" }}>
                                <input
                                    type="checkbox"
                                    value="SMA"
                                    onChange={handleChange}
                                />
                                SMA
                                {selectedIndicators.includes("SMA") && (
                                    <div className="indicator-fields">
                                        <input
                                            type="number"
                                            placeholder="SMA Short Period"
                                            onChange={(e) => handleNumericChange(e, 'SMA', 'short_period')}
                                        />
                                        <input
                                            type="number"
                                            placeholder="SMA Long Period"
                                            onChange={(e) => handleNumericChange(e, 'SMA', 'long_period')}
                                        />
                                    </div>
                                )}
                            </label>

                            <label style={{ marginTop: "11px" }}>
                                <input
                                    type="checkbox"
                                    value="EMA"
                                    onChange={handleChange}
                                />
                                EMA
                                {selectedIndicators.includes("EMA") && (
                                    <div className="indicator-fields">
                                        <input
                                            type="number"
                                            placeholder="EMA Short Period"
                                            onChange={(e) => handleNumericChange(e, 'EMA', 'short_period')}
                                        />
                                        <input
                                            type="number"
                                            placeholder="EMA Long Period"
                                            onChange={(e) => handleNumericChange(e, 'EMA', 'long_period')}
                                        />
                                    </div>
                                )}
                            </label>

                            <label style={{ marginTop: "11px" }}>
                                <input
                                    type="checkbox"
                                    value="MACD"
                                    onChange={handleChange}
                                />
                                MACD
                                {selectedIndicators.includes("MACD") && (
                                    <div className="indicator-fields">
                                        <input
                                            type="number"
                                            placeholder="MACD Fast Period"
                                            onChange={(e) => handleNumericChange(e, 'MACD', 'fast_period')}
                                        />
                                        <input
                                            type="number"
                                            placeholder="MACD Slow Period"
                                            onChange={(e) => handleNumericChange(e, 'MACD', 'slow_period')}
                                        />
                                        <input
                                            type="number"
                                            placeholder="MACD Signal Period"
                                            onChange={(e) => handleNumericChange(e, 'MACD', 'signal_period')}
                                        />
                                    </div>
                                )}
                            </label>

                            <label style={{ marginTop: "11px", marginBottom: "15px" }}>
                                <input
                                    type="checkbox"
                                    value="ST"
                                    onChange={handleChange}
                                />
                                SuperTrend
                                {selectedIndicators.includes("ST") && (
                                    <div className="indicator-fields">
                                        <input
                                            type="number"
                                            placeholder="ST Period"
                                            onChange={(e) => handleNumericChange(e, 'ST', 'period')}
                                        />
                                        <input
                                            type="number"
                                            placeholder="ST Multiplier"
                                            onChange={(e) => handleNumericChange(e, 'ST', 'multiplier')}
                                        />
                                    </div>
                                )}
                            </label>

                        </div>

                    </fieldset>
                    <div className={styles.buttonStopwatchContainer}>
                        <Stopwatch className="stopwatch" isRunning={isRunning} onReset={!isRunning} />
                        <button id="backtest" type="submit" className={styles.button}>
                            Save
                        </button>
                    </div>


                </form>
                <div className='widget-container'>
                    <TradingViewWidget
                        frame={'1'}
                        symbol={`BINANCE:${symbol}`}
                        activeStrategies={activeStrategies}
                    />
                </div>

            </div>
            {liveResult && <LiveResults key={resultKey} result={liveResult} />}
        </div>
    );
};

export default LiveTrading;
