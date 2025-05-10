import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function CardioCorrer() {
  const [subscription, setSubscription] = useState<any>(null);
  const [stepCount, setStepCount] = useState(0);
  const [prevAcceleration, setPrevAcceleration] = useState({ x: 0, y: 0, z: 0 });

  const THRESHOLD = 1.2;

  const _subscribe = () => {
    Accelerometer.setUpdateInterval(100); // actualiza cada 100ms
    const sub = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const delta =
        Math.abs(x - prevAcceleration.x) +
        Math.abs(y - prevAcceleration.y) +
        Math.abs(z - prevAcceleration.z);

      if (delta > THRESHOLD) {
        setStepCount(prev => prev + 1);
      }

      setPrevAcceleration({ x, y, z });
    });
    setSubscription(sub);
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
    setStepCount(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pasos estimados:</Text>
      <Text style={styles.count}>{stepCount}</Text>
      <Button title={subscription ? 'Detener' : 'Empezar'} onPress={subscription ? _unsubscribe : _subscribe} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5F75E4',
  },
  label: {
    fontSize: 24, color: 'white', marginBottom: 10,
  },
  count: {
    fontSize: 48, color: 'white', marginBottom: 20,
  },
});
