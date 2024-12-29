from binance.client import Client
import pandas as pd
import datetime

# Binance API anahtarları
API_KEY = "YOUR_API_KEY"
API_SECRET = "YOUR_SECRET_KEY"

client = Client(API_KEY, API_SECRET)


def get_historical_data(symbol, interval, start_str, end_str=None):
    """
    Binance API'den tarihi veri çekmek için kullanıyoruz.

    Parametreler:
        symbol (str): Kripto para sembolü (ör. 'BTCUSDT')
        interval (str): Zaman aralığı (ör. '1h', '15m')
        start_str (str): Başlangıç tarihi (ör. '1 Jan 2023')
        end_str (str): Bitiş tarihi (ör. '1 May 2023'). Varsayılan olarak None, yani şu anki zamana kadar.

    Döndürür:
        df (DataFrame): Tarihi verileri içeren pandas DataFrame
    """

    # Tarih aralığını belirleme
    if end_str is None:
        end_str = datetime.datetime.utcnow().strftime("%d %b %Y %H:%M:%S")

    # Tarihi verileri çekme
    klines = client.get_historical_klines(symbol, interval, start_str, end_str)

    # DataFrame'e dönüştürme
    df = pd.DataFrame(
        klines,
        columns=[
            "open_time",
            "open",
            "high",
            "low",
            "close",
            "volume",
            "close_time",
            "quote_asset_volume",
            "number_of_trades",
            "taker_buy_base_asset_volume",
            "taker_buy_quote_asset_volume",
            "ignore",
        ],
    )

    # Sütunları doğru tipte dönüştürme
    df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")
    df["close_time"] = pd.to_datetime(df["close_time"], unit="ms")
    numeric_columns = [
        "open",
        "high",
        "low",
        "close",
        "volume",
        "quote_asset_volume",
        "number_of_trades",
        "taker_buy_base_asset_volume",
        "taker_buy_quote_asset_volume",
    ]
    df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric, axis=1)

    return df


def get_live_data(symbol, interval, limit):
    """
    En son veriyi çeker.

    Parametreler:
        symbol (str): Kripto para sembolü (ör. 'BTCUSDT')
        interval (str): Zaman aralığı (örn. '1m')
        limit (int): Çekilecek veri noktası sayısı

    Döndürür:
        df (DataFrame): En son verileri içeren DataFrame
    """

    try:
        # İstenilen sayıda kline verisini çekiyoruz
        klines = client.get_klines(symbol=symbol, interval=interval, limit=limit)

        if klines is None or len(klines) == 0:
            print("Klines verisi boş veya None döndü.")
            return None

        # DataFrame'e dönüştürme
        df = pd.DataFrame(
            klines,
            columns=[
                "open_time",
                "open",
                "high",
                "low",
                "close",
                "volume",
                "close_time",
                "quote_asset_volume",
                "number_of_trades",
                "taker_buy_base_asset_volume",
                "taker_buy_quote_asset_volume",
                "ignore",
            ],
        )

        # Sütunları doğru tipte dönüştürme
        df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")
        df["close_time"] = pd.to_datetime(df["close_time"], unit="ms")
        numeric_columns = [
            "open",
            "high",
            "low",
            "close",
            "volume",
            "quote_asset_volume",
            "number_of_trades",
            "taker_buy_base_asset_volume",
            "taker_buy_quote_asset_volume",
        ]
        df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric, axis=1)

        return df
    except Exception as e:
        print(f"get_live_data Hata oluştu: {e}")
        return None
