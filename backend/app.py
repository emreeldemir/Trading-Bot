from flask import Flask, request, jsonify, send_from_directory
from backtest import perform_backtest
from live_trading import perform_live_trading
from threading import Thread, Lock
import uuid
from shared import live_trading_results, results_lock  # Burada güncelleme yaptık
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/backtest", methods=["POST"])
def backtest():
    """
    İstekten gelen parametrelerle backtest işlemini gerçekleştirir ve sonucu JSON olarak döndürür.
    """

    data = request.get_json()

    # İstekten parametreleri alma
    symbol = data.get("symbol", "BTCUSDT")
    timeframe = data.get("timeframe", "1h")
    initial_balance = data.get("initial_balance", 10000)
    indicators_params = data.get("indicators_params", {})
    strategy_params = data.get("strategy_params", {})
    start_str = data.get("start_str", "4 months ago")
    end_str = data.get("end_str", None)

    # Backtest fonksiyonunu çağır
    result = perform_backtest(
        symbol,
        timeframe,
        initial_balance,
        indicators_params,
        strategy_params,
        start_str,
        end_str,
    )

    return jsonify(result)


@app.route("/live_trading", methods=["POST"])
def live_trading():
    data = request.get_json()

    symbol = data.get("symbol", "BTCUSDT")
    timeframe = "1m"
    initial_balance = data.get("initial_balance", 10000)
    indicators_params = data.get("indicators_params", {})
    strategy_params = data.get("strategy_params", {})
    trading_duration = data.get("trading_duration", 5)

    session_id = str(uuid.uuid4())

    def run_live_trading(session_id):
        perform_live_trading(
            symbol,
            timeframe,
            initial_balance,
            indicators_params,
            strategy_params,
            trading_duration,
            session_id,
        )

    thread = Thread(target=run_live_trading, args=(session_id,))
    thread.start()

    return jsonify({"status": "started", "session_id": session_id})


@app.route("/live_trading/<session_id>", methods=["GET"])
def get_live_trading_result(session_id):
    with results_lock:
        if session_id in live_trading_results:
            result = live_trading_results[session_id]
            return jsonify(result)
        else:
            return jsonify({"status": "not_found"}), 404


@app.route("/photo/<filename>", methods=["GET"])
def serve_photo(filename):
    return send_from_directory("charts/", filename)


if __name__ == "__main__":
    app.run(debug=True, threaded=True)
