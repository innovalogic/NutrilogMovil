import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { auth, firestore } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface ReminderButtonProps {
  reminderTime?: string;
  fieldName: string; // Campo en Firestore (e.g., breakfastReminder, lunchReminder, dinnerReminder)
  label: string; // Etiqueta personalizada para el botón
}

export default function ReminderButton({ reminderTime, fieldName, label }: ReminderButtonProps) {
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const handleTimeConfirm = async (date: Date) => {
    if (!auth.currentUser) return;

    try {
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await setDoc(doc(firestore, 'users', auth.currentUser.uid), 
        { [fieldName]: timeString }, 
        { merge: true }
      );
      setTimePickerVisibility(false);
    } catch (error) {
      console.error(`Error al guardar recordatorio para ${fieldName}:`, error);
    }
  };

  return (
    <>
      <TouchableOpacity
        className="bg-purple-500 py-3 px-4 rounded-lg flex-1 ml-2"
        onPress={() => setTimePickerVisibility(true)}
      >
        <Text className="text-white text-center font-semibold">
          {reminderTime ? `${label}: ${reminderTime}` : label}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setTimePickerVisibility(false)}
        locale="es-ES"
      />
    </>
  );
}