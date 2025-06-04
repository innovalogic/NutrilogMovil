import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const STEP_COUNTER_TASK = 'step-counter-background';
const STORAGE_KEYS = {
  DAILY_STEPS: 'daily_steps_',
  LAST_SYNC: 'last_sync_date',
  STEP_BUFFER: 'step_buffer',
  CALIBRATION: 'step_calibration'
};

class StepCounterService {
  constructor() {
    this.isActive = false;
    this.subscription = null;
    this.stepBuffer = [];
    this.lastMagnitude = 0;
    this.lastStepTime = 0;
    this.stepThreshold = 1.2; 
    this.minStepInterval = 200; 
    this.maxStepInterval = 2000; 
    this.calibrationData = {
      averageMagnitude: 0,
      stepPattern: [],
      sensitivity: 1.0
    };

    this.accelerometerData = [];
    this.windowSize = 50; 
    this.peakThreshold = 0.5;
    this.valleyThreshold = -0.5;
    this.lastPeakTime = 0;
    this.lastValleyTime = 0;
  }

  async initialize() {
    try {
      await this.loadCalibrationData();
      await this.setupBackgroundTask();
      await this.syncPendingSteps();
      return true;
    } catch (error) {
      console.error('Error inicializando StepCounterService:', error);
      return false;
    }
  }

  async loadCalibrationData() {
    try {
      const calibrationStr = await AsyncStorage.getItem(STORAGE_KEYS.CALIBRATION);
      if (calibrationStr) {
        this.calibrationData = JSON.parse(calibrationStr);
        this.stepThreshold = this.calibrationData.sensitivity || 1.2;
      }
    } catch (error) {
      console.error('Error cargando calibración:', error);
    }
  }

  async saveCalibrationData() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CALIBRATION, 
        JSON.stringify(this.calibrationData)
      );
    } catch (error) {
      console.error('Error guardando calibración:', error);
    }
  }

  detectStep(accelData) {
    const { x, y, z } = accelData;

    const magnitude = Math.sqrt(x * x + y * y + z * z) - 9.81; 
    const timestamp = Date.now();

    this.accelerometerData.push({ magnitude, timestamp });
    if (this.accelerometerData.length > this.windowSize) {
      this.accelerometerData.shift();
    }
    
    if (this.accelerometerData.length < 10) return false;
    
    const smoothedMagnitude = this.applySmoothingFilter(magnitude);

    const isPeak = this.detectPeak(smoothedMagnitude, timestamp);
    const isValidStep = this.validateStep(isPeak, timestamp);

    if (isValidStep) {
      this.updateCalibration(smoothedMagnitude);
    }
    
    return isValidStep;
  }

  applySmoothingFilter(currentMagnitude) {
    const alpha = 0.1; 
    this.lastMagnitude = alpha * currentMagnitude + (1 - alpha) * this.lastMagnitude;
    return this.lastMagnitude;
  }

  detectPeak(magnitude, timestamp) {
    const recentData = this.accelerometerData.slice(-5);
    if (recentData.length < 5) return false;
    
    const current = magnitude;
    const prev2 = recentData[recentData.length - 3].magnitude;
    const prev1 = recentData[recentData.length - 2].magnitude;
    const next1 = recentData[recentData.length - 1].magnitude;
    
    const isPeak = (current > prev2 && current > prev1 && current > next1 && 
                   current > this.peakThreshold * this.stepThreshold);
    
    return isPeak;
  }

  validateStep(isPeak, timestamp) {
    if (!isPeak) return false;

    if (timestamp - this.lastStepTime < this.minStepInterval) {
      return false;
    }

    if (timestamp - this.lastStepTime > this.maxStepInterval) {
      this.calibrationData.sensitivity *= 0.95;
    }
    
    this.lastStepTime = timestamp;
    return true;
  }

  updateCalibration(magnitude) {
    const alpha = 0.05;
    this.calibrationData.averageMagnitude = 
      alpha * Math.abs(magnitude) + (1 - alpha) * this.calibrationData.averageMagnitude;

    if (this.calibrationData.averageMagnitude > 2.0) {
      this.calibrationData.sensitivity = Math.max(0.8, this.calibrationData.sensitivity * 0.98);
    } else if (this.calibrationData.averageMagnitude < 0.5) {
      this.calibrationData.sensitivity = Math.min(1.5, this.calibrationData.sensitivity * 1.02);
    }
    
    this.stepThreshold = this.calibrationData.sensitivity;
  }

  async startCounting() {
    if (this.isActive) return;
    
    this.isActive = true;
    await this.loadTodaySteps();

    Accelerometer.setUpdateInterval(50); 
    
    this.subscription = Accelerometer.addListener((accelData) => {
      if (this.detectStep(accelData)) {
        this.addStep();
      }
    });
    
    this.saveInterval = setInterval(() => {
      this.saveTodaySteps();
    }, 30000); 
    
    console.log('Contador de pasos iniciado');
  }

  async stopCounting() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    await this.saveTodaySteps();
    await this.saveCalibrationData();
    
    console.log('Contador de pasos detenido');
  }

  addStep() {
    const today = this.getTodayDateString();
    const stepData = {
      timestamp: Date.now(),
      date: today
    };
    
    this.stepBuffer.push(stepData);

    if (this.onStepDetected) {
      this.onStepDetected(this.getTodayStepCount());
    }
  }

  getTodayStepCount() {
    const today = this.getTodayDateString();
    return this.stepBuffer.filter(step => step.date === today).length;
  }

  getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  async loadTodaySteps() {
    try {
      const today = this.getTodayDateString();
      const stepsStr = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STEPS + today);
      if (stepsStr) {
        this.stepBuffer = JSON.parse(stepsStr);
      } else {
        this.stepBuffer = [];
      }
    } catch (error) {
      console.error('Error cargando pasos:', error);
      this.stepBuffer = [];
    }
  }

  async saveTodaySteps() {
    try {
      const today = this.getTodayDateString();
      const todaySteps = this.stepBuffer.filter(step => step.date === today);
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_STEPS + today, 
        JSON.stringify(todaySteps)
      );
    } catch (error) {
      console.error('Error guardando pasos:', error);
    }
  }

  async syncWithFirebase() {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      const today = this.getTodayDateString();
      const todaySteps = this.stepBuffer.filter(step => step.date === today);
      const stepCount = todaySteps.length;
      
      if (stepCount === 0) return true;

      const docRef = doc(firestore, 'users', user.uid, 'pasosDiarios', today);
      const docSnap = await getDoc(docRef);
      
      const stepData = {
        totalPasos: stepCount,
        fecha: today,
        fechaCompleta: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString(),
        detallesPasos: todaySteps.map(step => ({
          timestamp: step.timestamp,
          hora: new Date(step.timestamp).toTimeString().split(' ')[0]
        }))
      };
      
      if (docSnap.exists()) {
        await updateDoc(docRef, stepData);
      } else {
        await setDoc(docRef, {
          ...stepData,
          creadoEl: new Date().toISOString()
        });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, today);
      console.log(`Sincronizados ${stepCount} pasos con Firebase`);
      return true;
      
    } catch (error) {
      console.error('Error sincronizando con Firebase:', error);
      return false;
    }
  }

  async syncPendingSteps() {
    try {
      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      const today = this.getTodayDateString();
      
      if (lastSync !== today) {
        await this.syncWithFirebase();
      }
    } catch (error) {
      console.error('Error sincronizando pasos pendientes:', error);
    }
  }

  async setupBackgroundTask() {
    try {
      TaskManager.defineTask(STEP_COUNTER_TASK, async () => {
        try {
          await this.syncWithFirebase();
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('Error en tarea background:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      const isRegistered = await TaskManager.isTaskRegisteredAsync(STEP_COUNTER_TASK);
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(STEP_COUNTER_TASK, {
          minimumInterval: 15 * 60, 
          stopOnTerminate: false,
          startOnBoot: true,
        });
      }
    } catch (error) {
      console.error('Error configurando tarea background:', error);
    }
  }

  async getStepStatistics(days = 7) {
    const stats = {
      totalSteps: 0,
      averageDaily: 0,
      maxDaily: 0,
      dailyData: []
    };

    try {
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const stepsStr = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STEPS + dateStr);
        const steps = stepsStr ? JSON.parse(stepsStr).length : 0;
        
        stats.dailyData.push({ date: dateStr, steps });
        stats.totalSteps += steps;
        stats.maxDaily = Math.max(stats.maxDaily, steps);
      }
      
      stats.averageDaily = Math.round(stats.totalSteps / days);
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }

    return stats;
  }

  async cleanOldData(daysToKeep = 30) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stepKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.DAILY_STEPS));
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      for (const key of stepKeys) {
        const dateStr = key.replace(STORAGE_KEYS.DAILY_STEPS, '');
        const keyDate = new Date(dateStr);
        
        if (keyDate < cutoffDate) {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error limpiando datos antiguos:', error);
    }
  }

  setStepDetectedCallback(callback) {
    this.onStepDetected = callback;
  }

  async calibrateManually(knownSteps, recordedSteps) {
    if (recordedSteps > 0) {
      const accuracy = knownSteps / recordedSteps;
      this.calibrationData.sensitivity *= accuracy;
      this.calibrationData.sensitivity = Math.max(0.5, Math.min(2.0, this.calibrationData.sensitivity));
      await this.saveCalibrationData();
      return true;
    }
    return false;
  }
}

export const stepCounterService = new StepCounterService();

export const useStepCounter = () => {
  const [stepCount, setStepCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const initService = async () => {
      await stepCounterService.initialize();
      setStepCount(stepCounterService.getTodayStepCount());
    };

    initService();

    stepCounterService.setStepDetectedCallback((count) => {
      setStepCount(count);
    });

    return () => {
      stepCounterService.stopCounting();
    };
  }, []);

  const startCounting = async () => {
    await stepCounterService.startCounting();
    setIsActive(true);
  };

  const stopCounting = async () => {
    await stepCounterService.stopCounting();
    setIsActive(false);
  };

  const syncSteps = async () => {
    return await stepCounterService.syncWithFirebase();
  };

  return {
    stepCount,
    isActive,
    startCounting,
    stopCounting,
    syncSteps,
    getStatistics: stepCounterService.getStepStatistics.bind(stepCounterService),
    calibrate: stepCounterService.calibrateManually.bind(stepCounterService)
  };
};