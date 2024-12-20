import React, { useState, useEffect } from 'react';

const LiveTradingWatcher = ({ sessionId }) => {
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("running");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`http://localhost:5000/live_trading/${sessionId}`);
        const data = await response.json();
        setResults(data);

        if (data.status === "completed") {
          setStatus("completed");
          clearInterval(fetchInterval);
        }
      } catch (error) {
        console.error("Hata oluştu:", error);
      }
    };

    const fetchInterval = setInterval(fetchResults, 60000);
    fetchResults(); 

    return () => clearInterval(fetchInterval); 
  }, [sessionId]);

  return (
    <div>
      <h3>Live Trading Results</h3>
      {status === "completed" ? (
        <div>
          <h4>Trading Completed</h4>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      ) : (
        <p>Trading is running... Sonuçlar güncelleniyor.</p>
      )}
    </div>
  );
};

export default LiveTradingWatcher;
