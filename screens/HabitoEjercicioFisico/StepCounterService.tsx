import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { AppState, AppStateStatus } from 'react-native';

export interface StepData {
  stepCount: number;
  time: number;
  lastUpdate: number;
  isActive: boolean;
}

class StepCounterService {
  private static instance: StepCounterService;
  private subscription: any = null;
  private isRunning: boolean = false;
  private stepCount: number = 0;
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private lastMagnitude: number = 0;
  private lastStepTime: number = Date.now();
  private syncTimer: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private lastSyncTime: number = 0;

  private readonly STEP_THRESHOLD = 0.4;
  private readonly MIN_STEP_INTERVAL = 250; 
  private readonly UPDATE_INTERVAL = 100;
  private readonly SYNC_INTERVAL = 30000; 
  private readonly STORAGE_KEY = 'stepCounterData';

  private constructor() {
    this.initializeAppStateListener();
  }

  public static getInstance(): StepCounterService {
    if (!StepCounterService.instance) {
      StepCounterService.instance = new StepCounterService();
    }
    return StepCounterService.instance;
  }

  private initializeAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      this.loadStoredData();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.saveDataToStorage();
      this.syncToFirebase();
    }
  };

  public async startCounting(): Promise<void> {
    if (this.isRunning) return;
    try {
      await this.loadStoredData();
      this.isRunning = true;
      this.startTime = Date.now() - this.elapsedTime * 1000;     
      Accelerometer.setUpdateInterval(this.UPDATE_INTERVAL);
      this.subscription = Accelerometer.addListener(this.handleAccelerometerData);
      this.startAutoSync();
      console.log('StepCounter: Conteo iniciado');
    } catch (error) {
      console.error('Error iniciando contador de pasos:', error);
    }
  }

  public async stopCounting(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    
    this.stopAutoSync();
    await this.saveDataToStorage();
    await this.syncToFirebase();
    
    console.log('StepCounter: Conteo detenido');
  }

  private handleAccelerometerData = (accel: { x: number; y: number; z: number }) => {
    if (!this.isRunning) return;

    const { x, y, z } = accel;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const delta = magnitude - this.lastMagnitude;
    const now = Date.now();
    if (delta > this.STEP_THRESHOLD && now - this.lastStepTime > this.MIN_STEP_INTERVAL) {
      this.stepCount++;
      this.lastStepTime = now;
      if (this.stepCount % 10 === 0) {
        this.saveDataToStorage();
      }
    }
    this.lastMagnitude = magnitude;
    this.elapsedTime = Math.floor((now - this.startTime) / 1000);
  };

  private startAutoSync() {
    this.syncTimer = setInterval(() => {
      this.syncToFirebase();
    }, this.SYNC_INTERVAL);
  }

  private stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private async saveDataToStorage(): Promise<void> {
    try {
      const data: StepData = {
        stepCount: this.stepCount,
        time: this.elapsedTime,
        lastUpdate: Date.now(),
        isActive: this.isRunning
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando datos en storage:', error);
    }
  }

  private async loadStoredData(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        const data: StepData = JSON.parse(storedData);
        this.stepCount = data.stepCount || 0;
        this.elapsedTime = data.time || 0;
        const lastUpdate = new Date(data.lastUpdate);
        const today = new Date();
        if (lastUpdate.toDateString() !== today.toDateString()) {
          this.resetDailyData();
        }
      }
    } catch (error) {
      console.error('Error cargando datos del storage:', error);
    }
  }

  private async syncToFirebase(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user || this.stepCount === 0) return false;
    const now = Date.now();
    if (now - this.lastSyncTime < 10000) return false;
    try {
      const hoy = new Date();
      const fechaId = hoy.toISOString().split('T')[0];
      const pasosRef = doc(firestore, 'users', user.uid, 'pasosDiarios', fechaId);
      const docSnap = await getDoc(pasosRef);
      if (docSnap.exists()) {
        await updateDoc(pasosRef, {
          totalPasos: this.stepCount,
          tiempo: this.elapsedTime,
          ultimaActualizacion: new Date().toISOString(),
          sincronizadoDesdeServicio: true
        });
      } else {
        await setDoc(pasosRef, {
          totalPasos: this.stepCount,
          tiempo: this.elapsedTime,
          fecha: fechaId,
          fechaCompleta: new Date().toISOString(),
          creadoEl: new Date().toISOString(),
          ultimaActualizacion: new Date().toISOString(),
          sincronizadoDesdeServicio: true
        });
      }
      this.lastSyncTime = now;
      console.log(`StepCounter: Sincronizado - ${this.stepCount} pasos, ${this.elapsedTime}s`);
      return true;
    } catch (error) {
      console.error('Error sincronizando con Firebase:', error);
      return false;
    }
  }
  private resetDailyData(): void {
    this.stepCount = 0;
    this.elapsedTime = 0;
    this.startTime = Date.now();
    this.saveDataToStorage();
  }
  public getCurrentSteps(): number {
    return this.stepCount;
  }

  public getCurrentTime(): number {
    return this.elapsedTime;
  }

  public isCountingActive(): boolean {
    return this.isRunning;
  }

  public getDistance(): number {
    const strideLength = 0.762; 
    const stepsPerKm = 1000 / strideLength;
    return this.stepCount / stepsPerKm;
  }

  public getSpeed(): number {
    if (this.elapsedTime === 0) return 0;
    const distance = this.getDistance();
    return distance / (this.elapsedTime / 3600); 
  }

  public async forceSyncToFirebase(): Promise<boolean> {
    this.lastSyncTime = 0; 
    return await this.syncToFirebase();
  }

  public cleanup(): void {
    this.stopCounting();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

export default StepCounterService;