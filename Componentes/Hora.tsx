import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, firestore } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';

type CambiarHoraProps = {
    onHoraSeleccionada: (hora: number, minutos: number) => void;
    horaInicial?: number,
    minutosIniciales?: number,
    tituloLibro?: string,
    paginaLibro?: number,
};

const CambiarHora = ({ onHoraSeleccionada, horaInicial, minutosIniciales, tituloLibro, paginaLibro }: CambiarHoraProps) => {
    const [hora, setHora] = useState<Date>(() => {
        if (horaInicial !== undefined && minutosIniciales !== undefined) {
            const date = new Date();
            date.setHours(horaInicial);
            date.setMinutes(minutosIniciales);
            return date;
        }
        return new Date();
    });

    const [mostrarPicker, setMostrarPicker] = useState(false);
    useEffect(() => {
        const solicitarPermisos = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Se requieren permisos de notificación para activar los recordatorios.');
            }
        };

        solicitarPermisos();

        if (horaInicial !== undefined && minutosIniciales !== undefined) {
            onHoraSeleccionada(horaInicial, minutosIniciales);
        }
    }, []);

    const programarNotificacion = async (hora: number, minutos: number) => {

        const ahora = new Date();
        const fechaNotificacion = new Date();
        fechaNotificacion.setHours(hora);
        fechaNotificacion.setMinutes(minutos);
        fechaNotificacion.setSeconds(0);

        if (fechaNotificacion <= ahora) {
            fechaNotificacion.setDate(fechaNotificacion.getDate() + 1);
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `¡Hora de leer ${tituloLibro}!`,
                body: `Te quedaste en la pagina ${paginaLibro}`,
                sound: true,
            },
            trigger: {
                hour: fechaNotificacion.getHours(),
                minute: fechaNotificacion.getMinutes(),
                repeats: true,
            },
        });
    };

    const cambiarHoraPicker = (event: any, selectedDate?: Date) => {
        setMostrarPicker(false);
        if (selectedDate) {
            setHora(selectedDate);
            const h = selectedDate.getHours();
            const m = selectedDate.getMinutes();
            onHoraSeleccionada(h, m);
            programarNotificacion(h, m);
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

            <TouchableOpacity
                onPress={
                    () => setMostrarPicker(true)
                }
                className='items-center rounded-2xl mx-16 mb-4 border border-sky-300/25'

            >
                <Text className='text-white text-lg'>
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