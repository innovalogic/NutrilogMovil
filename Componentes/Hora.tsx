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
            <View className='items-center'>
                <Text className='text-white text-lg'>
                    Notificacion diaria:
                </Text>
            </View>

            <View className='items-center bg-black rounded-2xl mx-16 mb-4'>
                <Text className='text-white text-2xl'>
                    {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
            </View>

            {/* <View className='items-center border border-white rounded-2xl'> */}
                <TouchableOpacity
                    onPress={
                        () => setMostrarPicker(true)
                    }
                className='items-center rounded-2xl mx-16 mb-4 border border-sky-300/25'
                // style={{ elevation: 10 }}
                >
                    <Text className='text-white text-lg'>
                        Cambiar hora
                    </Text>
                </TouchableOpacity>
            {/* </View> */}

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