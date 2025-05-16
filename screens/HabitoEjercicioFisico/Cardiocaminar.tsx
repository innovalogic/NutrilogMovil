// StepCounter.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pedometer } from 'expo-sensors';

export default function StepCounter() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  useEffect(() => {
    // Verifica si está disponible
    Pedometer.isAvailableAsync().then(
      (result) => setIsPedometerAvailable(String(result)),
      (error) => setIsPedometerAvailable('Could not get isPedometerAvailable: ' + error)
    );

    // Contador en tiempo real
    const subscription = Pedometer.watchStepCount((result) => {
      setCurrentStepCount(prev => prev + result.steps);
    });

    // Opcional: Obtener pasos dados hoy
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0); // inicio del día

    Pedometer.getStepCountAsync(start, end).then(
      (result) => setPastStepCount(result.steps),
      (error) => console.log('Error al obtener pasos del día', error)
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>¿Podómetro disponible? {isPedometerAvailable}</Text>
      <Text>Pasos hoy: {pastStepCount + currentStepCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
