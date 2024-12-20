import pandas_ta as ta


def add_indicators(df, indicators_params={}):
    """
    Verilen DataFrame'e teknik indikatörleri eklioyruz.

    Parametreler:
        df (DataFrame): Fiyat verilerini içeren DataFrame
        indicators_params (dict): İndikatörlerin parametrelerini içeren sözlük

    Döndürür:
        df (DataFrame): İndikatörleri eklenmiş DataFrame
    """

    # Bollinger Bands
    bb_period = indicators_params.get("bb_period", 20)
    bb_std = indicators_params.get("bb_std", 2)
    bb = ta.bbands(df["close"], length=bb_period, std=bb_std)
    df = df.join(bb)

    # Sütun adlarını belirleme
    bb_columns = bb.columns.tolist()
    bbl_name = bb_columns[0]  # Lower Band
    bbm_name = bb_columns[1]  # Middle Band
    bbu_name = bb_columns[2]  # Upper Band

    # Sütun adlarını yeniden adlandırma
    df.rename(columns={bbl_name: "BBL", bbm_name: "BBM", bbu_name: "BBU"}, inplace=True)

    # RSI
    rsi_period = indicators_params.get("rsi_period", 14)
    df["RSI"] = ta.rsi(df["close"], length=rsi_period)

    # SMA
    sma_short_period = indicators_params.get("sma_short_period", 50)
    sma_long_period = indicators_params.get("sma_long_period", 200)
    df["SMA_short"] = ta.sma(df["close"], length=sma_short_period)
    df["SMA_long"] = ta.sma(df["close"], length=sma_long_period)

    # EMA
    ema_short_period = indicators_params.get("ema_short_period", 50)
    ema_long_period = indicators_params.get("ema_long_period", 200)
    df["EMA_short"] = ta.ema(df["close"], length=ema_short_period)
    df["EMA_long"] = ta.ema(df["close"], length=ema_long_period)

    # MACD
    macd_fast = indicators_params.get("macd_fast_period", 12)
    macd_slow = indicators_params.get("macd_slow_period", 26)
    macd_signal = indicators_params.get("macd_signal_period", 9)
    macd = ta.macd(df["close"], fast=macd_fast, slow=macd_slow, signal=macd_signal)
    df = df.join(macd)

    # MACD sütunlarını yeniden adlandırma
    macd_columns = macd.columns.tolist()
    macd_name = macd_columns[0]
    macdh_name = macd_columns[1]
    macds_name = macd_columns[2]

    df.rename(
        columns={macd_name: "MACD", macdh_name: "MACDh", macds_name: "MACDs"},
        inplace=True,
    )

    # SuperTrend
    st_period = indicators_params.get("st_period", 10)
    st_multiplier = indicators_params.get("st_multiplier", 3.0)
    supertrend = ta.supertrend(
        df["high"], df["low"], df["close"], length=st_period, multiplier=st_multiplier
    )
    df = df.join(supertrend)

    # SuperTrend sütunlarını yeniden adlandırma
    st_columns = supertrend.columns.tolist()
    supert_name = st_columns[0]
    supertd_name = st_columns[1]

    df.rename(columns={supert_name: "SUPERT", supertd_name: "SUPERTd"}, inplace=True)

    return df
