import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, firestore } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';

type CambiarHoraProps = {
    onHoraSeleccionada: (hora: number, minutos: number) => void;
};

const CambiarHora = ({ onHoraSeleccionada }: CambiarHoraProps) => {
    const [hora, setHora] = useState(new Date())
    const [mostrarPicker, setMostrarPicker] = useState(false);

    useEffect(() => {
        const solicitarPermisos = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Se requieren permisos de notificación para activar los recordatorios.');
            }
        };

        solicitarPermisos();
    }, []);

    const cambiarHoraPicker = (event: any, selectedDate?: Date) => {
        setMostrarPicker(false);
        if (selectedDate) {
            setHora(selectedDate);
            onHoraSeleccionada(selectedDate.getHours(), selectedDate.getMinutes());
            // programarNotificacion(selectedDate);
        }
    };

    return (
        <View>
            <Text>
                Hora seleccionada:
            </Text>

            <Text>
                {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </Text>

            <TouchableOpacity
                onPress={
                    () => setMostrarPicker(true)
                }
            >
                <Text>
                    Cambiar hora
                </Text>
            </TouchableOpacity>

            {mostrarPicker && (
                <DateTimePicker
                    value={hora}
                    mode="time"
                    is24Hour={true}
                    display='spinner'
                    onChange={cambiarHoraPicker}
                    themeVariant="dark"
                />)
            }
        </View>
    );
};

export default CambiarHora;