import React, { createContext, useContext, useState, useEffect } from 'react';
import GamificationService from '../services/gamificationService';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const [gamificationData, setGamificationData] = useState({
    achievements: [],
    points: { totalPoints: 0, level: 1, streak: { current: 0, longest: 0 } },
    challenges: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
