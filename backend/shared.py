from threading import Lock

# Canlı işlem sonuçlarını saklamak için global bir sözlük ve kilit, circular loop sorununu çözmek için böyle kullandık.
live_trading_results = {}
results_lock = Lock()
