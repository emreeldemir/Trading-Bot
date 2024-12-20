import React, { useState, useEffect } from 'react';
import styles from './BacktestingForm.module.css';
import BacktestingResults from './BacktestResults';
import TradingViewMiniWidget from './TradingViewMiniWidget';
import TradingViewWidget from './TradingViewWidget';
import './trade.css';

const BacktestingForm = () => {
    const [frame, setFrame] = useState('D');
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [indicators, setIndicators] = useState([]);
    const [activeStrategies, setActiveStrategies] = useState([]);

    const [result, setResult] = useState(null);
    const [scrollToResults, setScrollToResults] = useState(false);
    const [selectedIndicators, setSelectedIndicators] = useState([]);
    const [numericFields, setNumericFields] = useState({});
    const currencies = ['BTCUSDT', 'ETHUSDT', 'AVAXUSDT', 'RENDERUSDT', 'FETUSDT', 'SOLUSDT'];
    const times = ['15m', '1h', '4h', '1d'];
    const bands = ['Lower', 'Middle', 'Upper'];
    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const years = Array.from({ length: 15 }, (_, i) => (2010 + i).toString());
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const [formData, setFormData] = useState({
        currency: 'USD',
        startDay: '',
        startMonth: '',
        startYear: '',
        endDay: '',
        endMonth: '',
        endYear: '',
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

        const { currency, time, amount, startDay, startMonth, startYear, endDay, endMonth, endYear } = formData;

        if (!currency || !time || !amount || !startDay || !startMonth || !startYear || !endDay || !endMonth || !endYear) {
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
        if (selectedIndicators.includes('SMA')) strategies.push('STD;SMA'); // SMA
        if (selectedIndicators.includes('EMA')) strategies.push('STD;EMA'); // EMA
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

        const start_str = `${startDay} ${months.find(m => m.value === startMonth).label} ${startYear}`;
        const end_str = `${endDay} ${months.find(m => m.value === endMonth).label} ${endYear}`;

        const requestBody = {
            symbol: currency,
            timeframe: formData.time,
            initial_balance: Number(amount),
            indicators_params: indicatorsParams,
            strategy_params: strategyParams,
            start_str,
            end_str
        };

        setSymbol(currency || 'BTCUSDT');

        if (formData.time === '15m') {
            setFrame('15');
          } else if (formData.time === '1h') {
            setFrame(60) ; 
          } else if (formData.time === '4h') {
            setFrame(240) ; 
          } else if (formData.time === '1d') {
            setFrame('D') ; 
          }


        try {
            const response = await fetch('http://localhost:5000/backtest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const rawText = await response.text();

            const sanitizedText = rawText.replace(/NaN/g, "null");

            try {
                const result = JSON.parse(sanitizedText);
                console.log('Backtest sonucu:', result);
                setResult(result);
                setScrollToResults(true);
            } catch (error) {
                console.error("JSON parse error:", error);
            }

        } catch (error) {
            console.error('Backtest sırasında hata:', error);
        };
    };

    const scrollToResultsHandler = () => {
        const element = document.getElementById('backtestResults');
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 50, 
                behavior: 'smooth',
            });
        }
    };


    React.useEffect(() => {
        if (scrollToResults) {
            scrollToResultsHandler();
        }
    }, [scrollToResults]);


    return (
        <body class="backtesting-form">
            <TradingViewMiniWidget/>
            <div className="container">
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <label>
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

                <label>
                    Time frame:
                    <select name="time" value={formData.time} onChange={handleChange}>
                        <option value="">Time frame</option>
                        {times.map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
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

                <label>
                    Start date:
                    <div className={styles.dateContainer}>
                        <select name="startDay" value={formData.startDay} onChange={handleChange}>
                            <option value="">Day</option>
                            {days.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>

                        <select name="startMonth" value={formData.startMonth} onChange={handleChange}>
                            <option value="">Month</option>
                            {months.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>

                        <select name="startYear" value={formData.startYear} onChange={handleChange}>
                            <option value="">Year</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </label>



                <label >
                    End date:
                    <div className={styles.dateContainer}>
                        <select name="endDay" value={formData.endDay} onChange={handleChange}>
                            <option value="">Day</option>
                            {days.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>

                        <select name="endMonth" value={formData.endMonth} onChange={handleChange}>
                            <option value="">Month</option>
                            {months.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>

                        <select  name="endYear" value={formData.endYear} onChange={handleChange}>
                            <option value="">Year</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </label>
                <fieldset className={styles.radioGroup} >
                    <legend>Indicators</legend>
                    <div className="radioGroup">
                        <label>
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

                        <label>
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

                        <label>
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

                        <label>
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

                        <label>
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

                        <label>
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

                <button id="backtest" type="submit" className={styles.button}>
                Start
                </button>
            </form>

            <div className='widget-container'>
                <TradingViewWidget
                    frame={frame}
                    symbol={`BINANCE:${symbol}`}
                    activeStrategies={activeStrategies}
                />
            </div>
            </div>
            {scrollToResults && result && (
                <div id="backtestResults" style={{ marginTop: '20px' }}>
                    <BacktestingResults result={result} activeStrategies={activeStrategies} />
                </div>
            )}

        </body>

    );
};

export default BacktestingForm;
