import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { auth, firestore } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleDailyNotification,
  cancelScheduledNotification,
} from '../NotificationsUtils';

interface ReminderButtonProps {
  reminderTime?: string;
  fieldName: string;
  label: string;
}

const getNotificationConfig = (fieldName: string) => {
  const configs = {
    breakfastReminder: {
      identifier: 'breakfast-reminder',
      title: '¡Hora del desayuno! 🍳',
      body: 'No olvides tu desayuno saludable para alcanzar tus metas',
    },
    lunchReminder: {
      identifier: 'lunch-reminder',
      title: '¡Hora del almuerzo! 🥗',
      body: 'Es momento de tu almuerzo saludable',
    },
    dinnerReminder: {
      identifier: 'dinner-reminder',
      title: '¡Hora de la cena! 🍽️',
      body: 'No te saltes tu cena saludable',
    },
  };

  return configs[fieldName as keyof typeof configs] || null;
};

export default function ReminderButton({ reminderTime, fieldName, label }: ReminderButtonProps) {
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const subscriptions: Notifications.Subscription[] = [];
    let isMounted = true;
  
    const initializeNotifications = async () => {
      if (!isMounted) return;
      
      const granted = await requestNotificationPermissions();
      if (!granted && isMounted) {
        Alert.alert(
          'Permisos requeridos',
          'Por favor, habilita los permisos de notificación en la configuración de tu dispositivo.'
        );
      }
    };
  
    initializeNotifications();
  
    // Usar debounce para evitar múltiples registros
    const debouncedListeners = setTimeout(() => {
      if (isMounted) {
        subscriptions.push(
          Notifications.addNotificationReceivedListener(notification => {
            console.log('Notificación recibida:', notification.request.content.title);
          })
        );
  
        subscriptions.push(
          Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Usuario interactuó con notificación:', response.notification.request.content.title);
          })
        );
      }
    }, 300); // Pequeño delay para evitar registros duplicados en renders consecutivos
  
    return () => {
      isMounted = false;
      clearTimeout(debouncedListeners);
      subscriptions.forEach(sub => sub.remove());
    };
  }, []);

  const showTimePicker = () => {
    if (isProcessing) return;
    setTimePickerVisibility(true);
  };

  const handleTimeConfirm = async (date: Date) => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'Debes estar autenticado para programar un recordatorio.');
      setTimePickerVisibility(false);
      return;
    }

    setIsProcessing(true);

    try {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const permissionsGranted = await requestNotificationPermissions();
      if (!permissionsGranted) {
        Alert.alert('Error', 'No se pueden programar notificaciones sin permisos.');
        setIsProcessing(false);
        setTimePickerVisibility(false);
        return;
      }

      const notificationConfig = getNotificationConfig(fieldName);
      if (!notificationConfig) {
        Alert.alert('Error', 'Configuración de notificación no encontrada.');
        setIsProcessing(false);
        setTimePickerVisibility(false);
        return;
      }

      const success = await scheduleDailyNotification(
        notificationConfig.identifier,
        notificationConfig.title,
        notificationConfig.body,
        hours,
        minutes
      );

      if (!success) {
        Alert.alert('Error', 'No se pudo programar la notificación.');
        setIsProcessing(false);
        setTimePickerVisibility(false);
        return;
      }

      // Guardar en Firestore
      await setDoc(
        doc(firestore, 'users', auth.currentUser.uid),
        { [fieldName]: timeString },
        { merge: true }
      );

      Alert.alert(
        'Recordatorio programado ✅',
        `Tu recordatorio se activará todos los días a las ${timeString}`
      );
    } catch (error) {
      console.error(`Error al guardar recordatorio para ${fieldName}:`, error);
      Alert.alert('Error', 'No se pudo guardar el recordatorio');
    } finally {
      setIsProcessing(false);
      setTimePickerVisibility(false);
    }
  };

  const handleRemoveReminder = async () => {
    if (!auth.currentUser || !reminderTime || isProcessing) return;

    Alert.alert(
      'Eliminar recordatorio',
      '¿Estás seguro de que quieres eliminar este recordatorio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);

            try {
              const notificationConfig = getNotificationConfig(fieldName);
              if (notificationConfig) {
                await cancelScheduledNotification(notificationConfig.identifier);
              }

              await setDoc(
                doc(firestore, 'users', auth.currentUser!.uid),
                { [fieldName]: null },
                { merge: true }
              );

              Alert.alert('Recordatorio eliminado', 'El recordatorio ha sido eliminado exitosamente.');
            } catch (error) {
              console.error(`Error al eliminar recordatorio para ${fieldName}:`, error);
              Alert.alert('Error', 'No se pudo eliminar el recordatorio');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        className={`py-3 px-4 rounded-lg flex-1 ml-2 ${
          reminderTime ? 'bg-purple-600' : 'bg-purple-500'
        } ${isProcessing ? 'opacity-50' : ''}`}
        onPress={showTimePicker}
        onLongPress={reminderTime ? handleRemoveReminder : undefined}
        disabled={isProcessing}
      >
        <Text className="text-white text-center font-semibold">
          {isProcessing
            ? 'Procesando...'
            : reminderTime
              ? `${label}: ${reminderTime}`
              : `+ ${label}`
          }
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => {
          if (!isProcessing) {
            setTimePickerVisibility(false);
          }
        }}
        is24Hour={true}
        locale="es_ES"
      />
    </>
  );
}