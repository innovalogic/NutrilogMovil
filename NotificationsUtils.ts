import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el manejador de notificaciones al inicio
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Configurar canal de notificaciones para Android
async function configureNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }
}

// Solicitar permisos para notificaciones
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    await configureNotificationChannel();
    return true;
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return false;
  }
}

// Programar notificación diaria
export async function scheduleDailyNotification(
    identifier: string,
    title: string,
    body: string,
    hour: number,
    minute: number
  ): Promise<boolean> {
    try {
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        console.error('Hora o minuto inválido:', { hour, minute });
        return false;
      }
  
      // Cancelar notificaciones existentes con este identificador
      await cancelScheduledNotification(identifier);
  
      // Usar trigger de hora/minuto para repetición DIARIA
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: { type: identifier },
        },
        trigger: {
          hour,
          minute,
          repeats: true, // Esto se repetirá DIARIAMENTE a la misma hora
        },
      });
  
      console.log(`Notificación programada: ${identifier} para las ${hour}:${minute.toString().padStart(2, '0')}`);
      return true;
    } catch (error) {
      console.error(`Error al programar notificación ${identifier}:`, error);
      return false;
    }
  }

// Cancelar notificación programada
export async function cancelScheduledNotification(identifier: string): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const notificationsToCancel = scheduledNotifications.filter(
      notification => notification.content.data?.type === identifier
    );

    for (const notification of notificationsToCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    if (notificationsToCancel.length > 0) {
      console.log(`Canceladas ${notificationsToCancel.length} notificaciones de ${identifier}`);
    }
  } catch (error) {
    console.error(`Error al cancelar notificación ${identifier}:`, error);
  }
}

// Obtener notificaciones programadas
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Total de notificaciones programadas: ${notifications.length}`);
    return notifications;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
}

// Limpiar todas las notificaciones
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas las notificaciones canceladas');
  } catch (error) {
    console.error('Error al cancelar todas las notificaciones:', error);
  }
}

// Función para debugging
export async function debugNotificationState(): Promise<void> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    const notifications = await getScheduledNotifications();
    
    console.log('=== DEBUG NOTIFICACIONES ===');
    console.log(`Permisos: ${permissions.status}`);
    console.log(`Notificaciones activas: ${notifications.length}`);
    
    notifications.forEach((notification, index) => {
      const trigger = notification.trigger as any;
      console.log(`${index + 1}. ${notification.content.title} - Tipo: ${notification.content.data?.type}`);
      if (trigger.hour !== undefined) {
        console.log(`   Hora: ${trigger.hour}:${trigger.minute?.toString().padStart(2, '0')}`);
      }
    });
    console.log('=============================');
  } catch (error) {
    console.error('Error en debug:', error);
  }
}