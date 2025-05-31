import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import StepCounterService from 'StepCounterService';

interface UseStepCounterReturn {
  steps: number;
  isActive: boolean;
  dailyStats: {
    steps: number;
    distance: number;
    activeTime: number;
    calories: number;
  };
  startCounting: () => Promise<void>;
  stopCounting: () => Promise<void>;
  resetDaily: () => Promise<void>;
}

export const useStepCounter = (): UseStepCounterReturn => {
  const [steps, setSteps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [dailyStats, setDailyStats] = useState({
    steps: 0,
    distance: 0,
    activeTime: 0,
    calories: 0
  });

  const stepService = useRef(StepCounterService.getInstance());
  const appState = useRef(AppState.currentState);

  // Actualizar estado cada segundo
  useEffect(() => {
    const interval = setInterval(async () => {
      const stepData = await stepService.current.getStepData();
      const stats = await stepService.current.getDailyStats();
      
      setSteps(stepData.steps);
      setIsActive(stepData.isActive);
      setDailyStats(stats);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Manejar cambios de estado de la app
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App vuelve al primer plano
        console.log('📱 App en primer plano - reanudando contador');
        await stepService.current.resumeStepCounting();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App va al segundo plano
        console.log('📱 App en segundo plano - pausando contador');
        await stepService.current.pauseStepCounting();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Inicializar servicio
  useEffect(() => {
    const initService = async () => {
      await stepService.current.initializeBackgroundService();
    };
    initService();
  }, []);

  const startCounting = async () => {
    try {
      await stepService.current.startStepCounting();
      setIsActive(true);
    } catch (error) {
      console.error('Error iniciando contador:', error);
    }
  };

  const stopCounting = async () => {
    await stepService.current.stopStepCounting();
    setIsActive(false);
  };

  const resetDaily = async () => {
    await stepService.current.resetDailySteps();
    setSteps(0);
    setDailyStats({
      steps: 0,
      distance: 0,
      activeTime: 0,
      calories: 0
    });
  };

  return {
    steps,
    isActive,
    dailyStats,
    startCounting,
    stopCounting,
    resetDaily
  };
};