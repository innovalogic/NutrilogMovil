import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STEP_COUNTER_TASK = 'STEP_COUNTER_BACKGROUND';
const STEP_UPDATE_INTERVAL = 100; // ms

interface StepData {
  steps: number;
  lastUpdate: number;
  isActive: boolean;
  startTime: number;
}

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

class StepCounterService {
  private static instance: StepCounterService;
  private subscription: any = null;
  private lastMagnitude = 0;
  private lastStepTime = Date.now();
  private stepThreshold = 0.4;
  private minStepInterval = 250; // ms

  static getInstance(): StepCounterService {
    if (!StepCounterService.instance) {
      StepCounterService.instance = new StepCounterService();
    }
    return StepCounterService.instance;
  }

  // Inicializar el servicio de segundo plano
  async initializeBackgroundService(): Promise<boolean> {
    try {
      // Registrar la tarea en segundo plano
      await this.registerBackgroundTask();
      
      // Iniciar el servicio
      await BackgroundFetch.registerTaskAsync(STEP_COUNTER_TASK, {
        minimumInterval: 1000, // 1 segundo
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('✅ Servicio de pasos en segundo plano inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error iniciando servicio de segundo plano:', error);
      return false;
    }
  }

  // Registrar la tarea que se ejecutará en segundo plano
  private async registerBackgroundTask() {
    TaskManager.defineTask(STEP_COUNTER_TASK, async () => {
      try {
        const stepData = await this.getStepData();
        if (stepData.isActive) {
          // Mantener el contador activo por un tiempo limitado
          await this.updateStepsInBackground();
        }
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error('Error en tarea de segundo plano:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  }

  // Iniciar el contador de pasos
  async startStepCounting(): Promise<void> {
    try {
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Acelerómetro no disponible');
      }

      // Guardar estado activo
      await this.saveStepData({
        steps: 0,
        lastUpdate: Date.now(),
        isActive: true,
        startTime: Date.now()
      });

      // Configurar acelerómetro
      Accelerometer.setUpdateInterval(STEP_UPDATE_INTERVAL);
      
      this.subscription = Accelerometer.addListener(this.handleAccelerometerData.bind(this));
      
      console.log('✅ Contador de pasos iniciado');
    } catch (error) {
      console.error('❌ Error iniciando contador de pasos:', error);
      throw error;
    }
  }

  // Detener el contador de pasos
  async stopStepCounting(): Promise<void> {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }

    // Marcar como inactivo pero mantener los datos
    const stepData = await this.getStepData();
    await this.saveStepData({
      ...stepData,
      isActive: false,
      lastUpdate: Date.now()
    });

    console.log('⏹️ Contador de pasos detenido');
  }

  // Pausar temporalmente (cuando la app va al segundo plano)
  async pauseStepCounting(): Promise<void> {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }

    // Mantener como activo para reanudar después
    const stepData = await this.getStepData();
    await this.saveStepData({
      ...stepData,
      lastUpdate: Date.now()
    });

    console.log('⏸️ Contador de pasos pausado');
  }

  // Reanudar contador (cuando la app vuelve al primer plano)
  async resumeStepCounting(): Promise<void> {
    const stepData = await this.getStepData();
    if (stepData.isActive) {
      Accelerometer.setUpdateInterval(STEP_UPDATE_INTERVAL);
      this.subscription = Accelerometer.addListener(this.handleAccelerometerData.bind(this));
      console.log('▶️ Contador de pasos reanudado');
    }
  }

  // Manejar datos del acelerómetro
  private async handleAccelerometerData(accel: { x: number; y: number; z: number }) {
    const { x, y, z } = accel;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const delta = magnitude - this.lastMagnitude;
    const now = Date.now();

    if (delta > this.stepThreshold && now - this.lastStepTime > this.minStepInterval) {
      await this.incrementStepCount();
      this.lastStepTime = now;
    }
    this.lastMagnitude = magnitude;
  }

  // Incrementar contador de pasos
  private async incrementStepCount(): Promise<void> {
    const stepData = await this.getStepData();
    const newStepData = {
      ...stepData,
      steps: stepData.steps + 1,
      lastUpdate: Date.now()
    };
    
    await this.saveStepData(newStepData);
    
    // Notificar logros importantes
    if (newStepData.steps % 1000 === 0) {
      await this.sendStepNotification(newStepData.steps);
    }
  }

  // Actualizar pasos en segundo plano (versión simplificada)
  private async updateStepsInBackground(): Promise<void> {
    const stepData = await this.getStepData();
    const timeSinceLastUpdate = Date.now() - stepData.lastUpdate;
    
    // Si ha pasado mucho tiempo, desactivar para ahorrar batería
    if (timeSinceLastUpdate > 30 * 60 * 1000) { // 30 minutos
      await this.saveStepData({
        ...stepData,
        isActive: false
      });
    }
  }

  // Obtener datos de pasos almacenados
  async getStepData(): Promise<StepData> {
    try {
      const data = await AsyncStorage.getItem('stepCounterData');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error obteniendo datos de pasos:', error);
    }

    return {
      steps: 0,
      lastUpdate: Date.now(),
      isActive: false,
      startTime: Date.now()
    };
  }

  // Guardar datos de pasos
  private async saveStepData(data: StepData): Promise<void> {
    try {
      await AsyncStorage.setItem('stepCounterData', JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando datos de pasos:', error);
    }
  }

  // Resetear contador diario
  async resetDailySteps(): Promise<void> {
    await this.saveStepData({
      steps: 0,
      lastUpdate: Date.now(),
      isActive: false,
      startTime: Date.now()
    });
  }

  // Enviar notificación de logro
  private async sendStepNotification(steps: number): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚶‍♂️ ¡Nuevo logro!',
          body: `Has caminado ${steps} pasos. ¡Sigue así!`,
          data: { steps }
        },
        trigger: null // Inmediata
      });
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  }

  // Obtener estadísticas del día
  async getDailyStats(): Promise<{
    steps: number;
    distance: number;
    activeTime: number;
    calories: number;
  }> {
    const stepData = await this.getStepData();
    const strideLength = 0.762; // metros
    const caloriesPerStep = 0.04; // aproximado
    
    return {
      steps: stepData.steps,
      distance: (stepData.steps * strideLength) / 1000, // km
      activeTime: Math.floor((stepData.lastUpdate - stepData.startTime) / 1000), // segundos
      calories: Math.round(stepData.steps * caloriesPerStep)
    };
  }
}

export default StepCounterService;