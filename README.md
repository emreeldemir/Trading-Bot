# Crypto Trading Bot



## Project Overview

This project is an Automated Trading Bot application designed to test and simulate automatic buying and selling strategies in cryptocurrency markets. The project supports backtesting on historical data and live trading simulations using real-time data. Users can evaluate their trading algorithms by leveraging various technical indicators and strategies.

<br>

<table>
<tr>
<td>For more detailed information, charts and images, examine the file named "ProjectReport.pdf". When you open the PDF file, do not forget to click the "More pages" button at the bottom of the page.</td>
</tr>
</table>

---

## General Features

### Backtesting
- **Purpose**: Test the performance of specific strategies on historical data.
- **Capabilities**:
  - Test various technical indicators and strategy parameters.
  - Graphically display results, including price data and buy/sell points.

### Live Trading Simulation
- **Purpose**: Simulate trading strategies with real-time data.
- **Features**:
  - Monitor trades and query balances instantly via API.
  - Make buy/sell decisions based on predefined strategies.

### Technical Indicators
- Supported indicators include:
  - **RSI (Relative Strength Index)**: Detect overbought/oversold conditions.
  - **MACD (Moving Average Convergence Divergence)**: Analyze momentum and trend reversals.
  - **Bollinger Bands**: Identify price volatility and reversal points.
  - **EMA/SMA (Exponential and Simple Moving Averages)**: Track trends and movements.
  - **SuperTrend**: Indicate trend direction and buy/sell opportunities.
- Users can customize indicator parameters to suit specific needs.

### Multi-Session Support
- Simultaneously run multiple backtests or live trading simulations.
- Assign unique `session_id` to each session.

### Graph Generation
- Visualize trade results with price charts and strategy points.
- Save charts in the `charts` directory for analysis.

### API Endpoints
- Interact with the bot using a Flask-based API:
  - Start backtesting and live trading sessions.
  - Retrieve session results and trading statuses.

---

## File Structure and Functions

### `app.py`
- **Purpose**: Main Flask web server.
- **Key Endpoints**:
  - `/backtest`: Start a backtest session.
  - `/live_trading`: Initiate live trading simulation.
  - `/live_trading/<session_id>`: Fetch results for a specific session.
- **Features**:
  - Manages processes using unique `session_id`.
  - Executes operations in separate threads.

### `backtest.py`
- **Purpose**: Executes backtesting operations.
- **Functions**:
  - `perform_backtest`: Conducts backtesting with strategy parameters.
  - Generates trade signals and returns results in dictionary format.
- **Outputs**:
  - Graphs illustrating buy/sell points and trade outcomes.

### `live_trading.py`
- **Purpose**: Simulates live trading.
- **Functions**:
  - `perform_live_trading`: Operates with real-time data to make trade decisions.
  - Stores results in `live_trading_results`.
- **Key Details**:
  - Thread-safe operations using locks.
  - Continuous updates on trades and balances.

### `data_fetcher.py`
- **Purpose**: Fetches price data from Binance API.
- **Functions**:
  - `get_historical_data`: Retrieve historical price data.
  - `get_live_data`: Fetch real-time price data.
- **Outputs**:
  - Data in pandas DataFrame format.
  - Handles errors during data retrieval.

### `indicators.py`
- **Purpose**: Calculates technical indicators.
- **Supported Indicators**:
  - RSI, MACD, Bollinger Bands, EMA, SMA, SuperTrend.
- **Functionality**:
  - Adds calculated indicators to DataFrames for strategy evaluation.

### `shared.py`
- **Purpose**: Centralized storage for shared variables and thread locks.
- **Features**:
  - Manages `live_trading_results` dictionary.
  - Ensures thread safety.

### `requirements.txt`
- **Purpose**: Lists all Python packages required for project setup.

---

## Project Workflow

### Backtesting Process
- **Input Parameters**:
  - Symbol, timeframe, initial balance, and strategy configurations.
- **Workflow**:
  1. Fetch historical data via `data_fetcher.py`.
  2. Calculate indicators using `indicators.py`.
  3. Evaluate buy/sell signals iteratively.
  4. Generate graphs and summarize results.
- **Outputs**:
  - Initial and final balances.
  - Total profit/loss.
  - List and count of executed trades.

### Live Trading Process
- **Input Parameters**:
  - Symbol, trading duration, initial balance, and strategy configurations.
- **Workflow**:
  1. Start a session using `perform_live_trading`.
  2. Fetch real-time data periodically.
  3. Evaluate and execute trades based on strategy.
  4. Continuously update results in `live_trading_results`.
- **Monitoring**:
  - Query trading status and balance via session-specific API calls.

---

## Installation and Setup

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the application:
   ```bash
   python app.py
   ```

---

## Technologies Used
- **Backend**:
  - Python (v3.11.3), Flask (v3.1.0)
- **Frontend**:
  - React (Node v20.11.1)
- **Libraries**:
  - TA-Lib, pandas, matplotlib, mplfinance
- **APIs**:
  - Binance API, TradingView Widgets

---

## Resources
- [Binance API Client Libraries](https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#client-libraries)
- [Python Binance Library](https://github.com/sammchardy/python-binance)
- [TradingView Widgets](https://www.tradingview.com/widget-docs/widgets/tickers/)
- [TA-Lib](https://ta-lib.org/functions/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Matplotlib](https://pypi.org/project/matplotlib/)
- [Python Threading Documentation](https://docs.python.org/3/library/threading.html)

---

