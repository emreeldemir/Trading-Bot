import time
from datetime import datetime, timedelta
from data_fetcher import get_live_data
from indicators import add_indicators
import traceback
from threading import Lock
from shared import live_trading_results, results_lock  # Burada güncelleme yaptık


def perform_live_trading(
    symbol,
    timeframe,
    initial_balance,
    indicators_params,
    strategy_params,
    trading_duration,
    session_id,
):
    """
    Gerçek zamanlı verilerle canlı işlem simülasyonu yapıyoruz.

    Parametreler:
        symbol (str): Kripto para sembolü (ör. 'BTCUSDT')
        timeframe (str): Zaman aralığı ('1m' kullanılacak)
        initial_balance (float): Başlangıç bakiyesi
        indicators_params (dict): İndikatör parametreleri
        strategy_params (dict): Strateji parametreleri
        trading_duration (int): İşlem süresi (dakika)
        session_id (str): İşlem oturumu ID'si

    """

    # Başlangıç değişkenlerini ayarlama
    balance = initial_balance
    position = 0  # 0: pozisyon yok, 1: long pozisyon
    entry_price = 0
    trades = []

    # İşlem bitiş zamanını hesaplama
    start_time = datetime.utcnow()
    end_time = start_time + timedelta(minutes=trading_duration)

    print(
        f"Canlı işlem simülasyonu {start_time.strftime('%Y-%m-%d %H:%M:%S')} UTC'de başladı."
    )

    # Başlangıçta live_trading_results[session_id] sözlüğünü oluşturma
    with results_lock:
        live_trading_results[session_id] = {
            "symbol": symbol,
            "timeframe": timeframe,
            "initial_balance": initial_balance,
            "current_balance": balance,
            "trades": [],
            "status": "running",
        }

    # İndikatörler için gereken maksimum periyodu hesaplama
    periods = []

    # RSI periyodu
    rsi_period = indicators_params.get("rsi_period", 14)
    periods.append(rsi_period)

    # Bollinger Bands periyodu
    bb_period = indicators_params.get("bb_period", 20)
    periods.append(bb_period)

    # SMA periyotları
    sma_short_period = indicators_params.get("sma_short_period", 50)
    sma_long_period = indicators_params.get("sma_long_period", 200)
    periods.extend([sma_short_period, sma_long_period])

    # EMA periyotları
    ema_short_period = indicators_params.get("ema_short_period", 50)
    ema_long_period = indicators_params.get("ema_long_period", 200)
    periods.extend([ema_short_period, ema_long_period])

    # MACD periyotları
    macd_fast = indicators_params.get("macd_fast_period", 12)
    macd_slow = indicators_params.get("macd_slow_period", 26)
    macd_signal = indicators_params.get("macd_signal_period", 9)
    macd_max_period = max(macd_fast, macd_slow)
    periods.append(macd_max_period)

    # SuperTrend periyodu
    st_period = indicators_params.get("st_period", 10)
    periods.append(st_period)

    # Maksimum periyodu belirleme
    max_period = max(periods)
    required_data_points = max_period + 1  # Bir fazla alıyoruz

    while datetime.utcnow() < end_time:
        try:
            # En son veriyi çekme
            df = get_live_data(symbol, timeframe, limit=required_data_points)
            if df is None or len(df) < required_data_points:
                print("Yeterli veri çekilemedi, bekleniyor...")
                time.sleep(60)
                continue  # Bir sonraki döngüye geç

            # Teknik indikatörleri ekleme
            df = add_indicators(df, indicators_params)

            # En son satırı alıyoruz
            row = df.iloc[-1]

            # Önceki satırı alıyoruz
            previous_row = df.iloc[-2]

            # Strateji bayrakları ve parametreleri
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

            # Alım ve satım sinyalleri
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

            # İşlemleri gerçekleştirme
            current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            if buy_signal and position == 0:
                position = 1
                entry_price = row["close"]

                # Kullanılan indikatörlerin değerlerini ekle
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

                trade = {
                    "type": "buy",
                    "price": entry_price,
                    "time": current_time,
                    "indicators": indicators_values,
                }
                trades.append(trade)

                print(f"{current_time} - Alım yapıldı: {entry_price}")

                # live_trading_results sözlüğünü güncelleme
                with results_lock:
                    live_trading_results[session_id]["trades"].append(trade)
                    live_trading_results[session_id]["current_balance"] = balance

            elif sell_signal and position == 1:
                exit_price = row["close"]
                profit = (exit_price - entry_price) / entry_price * balance
                balance += profit
                position = 0

                # Kullanılan indikatörlerin değerlerini ekle
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

                trade = {
                    "type": "sell",
                    "price": exit_price,
                    "time": current_time,
                    "profit": profit,
                    "indicators": indicators_values,
                }
                trades.append(trade)

                print(f"{current_time} - Satış yapıldı: {exit_price} | Kar: {profit}")

                # live_trading_results sözlüğünü güncelleme
                with results_lock:
                    live_trading_results[session_id]["trades"].append(trade)
                    live_trading_results[session_id]["current_balance"] = balance

            # Bir sonraki dakika için bekleme
            time.sleep(60)
        except Exception as e:
            print(f"Hata oluştu: {e}")
            time.sleep(60)

    # Pozisyon açık ise kapatma
    if position == 1:
        exit_price = df.iloc[-1]["close"]
        profit = (exit_price - entry_price) / entry_price * balance
        balance += profit
        position = 0
        trade = {
            "type": "sell",
            "price": exit_price,
            "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "profit": profit,
        }
        trades.append(trade)
        print(f"Son satış yapıldı: {exit_price} | Kar: {profit}")

        # live_trading_results sözlüğünü güncelleme
        with results_lock:
            live_trading_results[session_id]["trades"].append(trade)
            live_trading_results[session_id]["current_balance"] = balance

    # İşlem tamamlandı, status'u 'completed' yapma
    with results_lock:
        live_trading_results[session_id]["status"] = "completed"
        live_trading_results[session_id]["final_balance"] = balance
        live_trading_results[session_id]["profit"] = balance - initial_balance
        live_trading_results[session_id]["number_of_trades"] = len(trades)

    print(
        f"Canlı işlem simülasyonu {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC'de sona erdi."
    )
