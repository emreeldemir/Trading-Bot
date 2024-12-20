import pandas as pd
from data_fetcher import get_historical_data
from indicators import add_indicators
import os
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mplfinance.original_flavor import candlestick_ohlc
import matplotlib.dates as mdates


def generate_backtest_chart(df, trades, start_date, end_date, output_path):
    """
    Backtest sonuçları için alım ve satım noktalarını içeren bir mum grafik oluşturur ve kaydeder.

    Parametreler:
        df (DataFrame): Fiyat verilerini içeren DataFrame
        trades (list): İşlem verilerini içeren liste
        start_date (str): Başlangıç tarihi
        end_date (str): Bitiş tarihi
        output_path (str): Grafiğin kaydedileceği dosya yolu
    """

    # Tarih formatını matplotlib için dönüştürme
    df["plot_time"] = mdates.date2num(df["close_time"])
    ohlc = df[["plot_time", "open", "high", "low", "close"]].values

    buy_signals = [trade for trade in trades if trade["type"] == "buy"]
    sell_signals = [trade for trade in trades if trade["type"] == "sell"]

    # Grafik oluşturma
    fig, ax = plt.subplots(figsize=(15, 7))

    # Mum grafik çizme
    candlestick_ohlc(ax, ohlc, width=0.6, colorup="green", colordown="red", alpha=0.8)

    # Alım noktalarını ekleme
    if buy_signals:
        buy_times = [
            mdates.date2num(pd.to_datetime(trade["time"])) for trade in buy_signals
        ]
        buy_prices = [trade["price"] for trade in buy_signals]
        ax.scatter(
            buy_times,
            buy_prices,
            marker="^",
            color="blue",
            s=200,
            label="Buy Signal",
        )

    # Satım noktalarını ekleme
    if sell_signals:
        sell_times = [
            mdates.date2num(pd.to_datetime(trade["time"])) for trade in sell_signals
        ]
        sell_prices = [trade["price"] for trade in sell_signals]
        ax.scatter(
            sell_times,
            sell_prices,
            marker="v",
            color="purple",
            s=200,
            label="Sell Signal",
        )

    # Başlık ve diğer ayarlar
    ax.set_title(f"Backtest Results: {start_date} - {end_date}")
    ax.set_xlabel("Date")
    ax.set_ylabel("Price (USDT)")
    ax.legend(fontsize="x-large")
    ax.grid(True)

    # Tarih formatını formatting
    ax.xaxis_date()
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m-%d"))

    # Grafiği kaydetme
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path)
    plt.close()


def perform_backtest(
    symbol,
    timeframe,
    initial_balance,
    indicators_params,
    strategy_params,
    start_str,
    end_str=None,
):
    """
    Backtest işlemini gerçekleştirir.

    Parametreler:
        symbol (str): Kripto para sembolü
        timeframe (str): Zaman aralığı
        initial_balance (float): Başlangıç bakiyesi
        indicators_params (dict): İndikatör parametreleri
        strategy_params (dict): Strateji parametreleri
        start_str (str): Başlangıç tarihi
        end_str (str): Bitiş tarihi

    Döndürür:
        results (dict): Backtest sonuçları
    """

    # Veri çekme
    df = get_historical_data(symbol, timeframe, start_str, end_str)

    # Teknik indikatörleri ekleme
    df = add_indicators(df, indicators_params)

    # Strateji parametrelerini al
    use_rsi = strategy_params.get("use_rsi", False)
    use_bollinger_bands = strategy_params.get("use_bollinger_bands", False)
    use_sma_cross = strategy_params.get("use_sma_cross", False)
    use_ema_cross = strategy_params.get("use_ema_cross", False)
    use_macd = strategy_params.get("use_macd", False)
    use_supertrend = strategy_params.get("use_supertrend", False)

    # RSI parametreleri
    rsi_buy_threshold = strategy_params.get("rsi_buy_threshold", 30)
    rsi_sell_threshold = strategy_params.get("rsi_sell_threshold", 70)

    # Bollinger Bands parametreleri
    bb_buy_band = strategy_params.get(
        "bb_buy_band", "lower"
    )  # 'lower', 'middle', 'upper'
    bb_sell_band = strategy_params.get("bb_sell_band", "upper")

    # SMA parametreleri
    sma_short_period = indicators_params.get("sma_short_period", 50)
    sma_long_period = indicators_params.get("sma_long_period", 200)

    # EMA parametreleri
    ema_short_period = indicators_params.get("ema_short_period", 50)
    ema_long_period = indicators_params.get("ema_long_period", 200)

    # MACD parametreleri
    macd_fast_period = indicators_params.get("macd_fast_period", 12)
    macd_slow_period = indicators_params.get("macd_slow_period", 26)
    macd_signal_period = indicators_params.get("macd_signal_period", 9)

    # SuperTrend parametreleri
    st_period = indicators_params.get("st_period", 10)
    st_multiplier = indicators_params.get("st_multiplier", 3.0)

    # Başlangıç bakiyesi ve pozisyon durumunu ayarlama
    balance = initial_balance
    position = 0  # 0: pozisyon yok, 1: long pozisyon
    entry_price = 0
    trades = []

    # Veri üzerinden iterasyon yapma
    for index, row in df.iterrows():
        if index == 0:
            previous_row = row
            continue

        buy_signal = False
        sell_signal = False

        # RSI Stratejisi
        if use_rsi:
            if row["RSI"] < rsi_buy_threshold:
                buy_signal = True
            elif row["RSI"] > rsi_sell_threshold:
                sell_signal = True

        # Bollinger Bands Stratejisi
        if use_bollinger_bands:
            if bb_buy_band == "lower" and row["close"] < row["BBL"]:
                buy_signal = True
            elif bb_buy_band == "middle" and row["close"] < row["BBM"]:
                buy_signal = True
            elif bb_buy_band == "upper" and row["close"] < row["BBU"]:
                buy_signal = True

            if bb_sell_band == "upper" and row["close"] > row["BBU"]:
                sell_signal = True
            elif bb_sell_band == "middle" and row["close"] > row["BBM"]:
                sell_signal = True
            elif bb_sell_band == "lower" and row["close"] > row["BBL"]:
                sell_signal = True

        # SMA Cross Stratejisi
        if use_sma_cross:
            if (
                row["SMA_short"] > row["SMA_long"]
                and previous_row["SMA_short"] <= previous_row["SMA_long"]
            ):
                buy_signal = True
            elif (
                row["SMA_short"] < row["SMA_long"]
                and previous_row["SMA_short"] >= previous_row["SMA_long"]
            ):
                sell_signal = True

        # EMA Cross Stratejisi
        if use_ema_cross:
            if (
                row["EMA_short"] > row["EMA_long"]
                and previous_row["EMA_short"] <= previous_row["EMA_long"]
            ):
                buy_signal = True
            elif (
                row["EMA_short"] < row["EMA_long"]
                and previous_row["EMA_short"] >= previous_row["EMA_long"]
            ):
                sell_signal = True

        # MACD Stratejisi
        if use_macd:
            if (
                row["MACD"] > row["MACDs"]
                and previous_row["MACD"] <= previous_row["MACDs"]
            ):
                buy_signal = True
            elif (
                row["MACD"] < row["MACDs"]
                and previous_row["MACD"] >= previous_row["MACDs"]
            ):
                sell_signal = True

        # SuperTrend Stratejisi
        if use_supertrend:
            if row["SUPERTd"] == 1 and previous_row["SUPERTd"] == -1:
                buy_signal = True
            elif row["SUPERTd"] == -1 and previous_row["SUPERTd"] == 1:
                sell_signal = True

        # Alım işlemi
        if buy_signal and position == 0:
            position = 1
            entry_price = row["close"]

            # Kullanılan indikatörleri ekle
            indicators_values = {}
            if use_sma_cross:
                indicators_values["SMA_short"] = row["SMA_short"]
                indicators_values["SMA_long"] = row["SMA_long"]
            if use_rsi:
                indicators_values["RSI"] = row["RSI"]
            if use_bollinger_bands:
                indicators_values["BBL"] = row["BBL"]
                indicators_values["BBM"] = row["BBM"]
                indicators_values["BBU"] = row["BBU"]
            if use_macd:
                indicators_values["MACD"] = row["MACD"]
                indicators_values["MACDs"] = row["MACDs"]
                indicators_values["MACDh"] = row["MACDh"]
            if use_supertrend:
                indicators_values["SUPERT"] = row["SUPERT"]
                indicators_values["SUPERTd"] = row["SUPERTd"]

            trades.append(
                {
                    "type": "buy",
                    "price": entry_price,
                    "time": str(row["close_time"]),
                    "indicators": indicators_values,
                }
            )

        # Satım işlemi
        elif sell_signal and position == 1:
            exit_price = row["close"]
            profit = (exit_price - entry_price) / entry_price * balance
            balance += profit
            position = 0

            # Kullanılan indikatörleri ekle
            indicators_values = {}
            if use_sma_cross:
                indicators_values["SMA_short"] = row["SMA_short"]
                indicators_values["SMA_long"] = row["SMA_long"]
            if use_rsi:
                indicators_values["RSI"] = row["RSI"]
            if use_bollinger_bands:
                indicators_values["BBL"] = row["BBL"]
                indicators_values["BBM"] = row["BBM"]
                indicators_values["BBU"] = row["BBU"]
            if use_macd:
                indicators_values["MACD"] = row["MACD"]
                indicators_values["MACDs"] = row["MACDs"]
                indicators_values["MACDh"] = row["MACDh"]
            if use_supertrend:
                indicators_values["SUPERT"] = row["SUPERT"]
                indicators_values["SUPERTd"] = row["SUPERTd"]

            trades.append(
                {
                    "type": "sell",
                    "price": exit_price,
                    "time": str(row["close_time"]),
                    "profit": profit,
                    "indicators": indicators_values,
                }
            )

        previous_row = row

    # Pozisyon açık ise kapanış fiyatından sat
    if position == 1:
        exit_price = df.iloc[-1]["close"]
        profit = (exit_price - entry_price) / entry_price * balance
        balance += profit
        position = 0
        trades.append(
            {
                "type": "sell",
                "price": exit_price,
                "time": str(df.iloc[-1]["close_time"]),
                "profit": profit,
            }
        )

    # Grafik oluşturma
    chart_path = f"C:/Users/Emre/Documents/Trading-Bot/backend/charts/{symbol}_{timeframe}_chart.png"
    generate_backtest_chart(df, trades, start_str, end_str or "Şu an", chart_path)

    # Sonuçları hazırlama
    results = {
        "symbol": symbol,
        "timeframe": timeframe,
        "initial_balance": initial_balance,
        "final_balance": balance,
        "profit": balance - initial_balance,
        "trades": trades,
        "number_of_trades": len(trades),
    }

    return results
