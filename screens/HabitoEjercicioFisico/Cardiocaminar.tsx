import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import { Text, View } from 'react-native';

export default function Cardiocaminar() {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Verificar disponibilidad
    Pedometer.isAvailableAsync().then(setIsAvailable);
    
    // Suscribirse a actualizaciones
    const subscription = Pedometer.watchStepCount(({ steps }) => {
      setSteps(steps);
    });

    return () => subscription && subscription.remove();
  }, []);

  if (!isAvailable) {
    return <Text>Podómetro no disponible en este dispositivo</Text>;
  }

  return <Text>Pasos en esta sesión: {steps}</Text>;
}