import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import BacktestingForm from './components/BacktestingForm';
import LiveTrading from './components/LiveTrading';
import Test from './components/Test';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/backtesting" element={<BacktestingForm />} />
        <Route path="/livetrading" element={<LiveTrading />} />
        <Route path="/test" element={<Test />} />
      
      </Routes>
    </Router>
  );
};

export default App;
