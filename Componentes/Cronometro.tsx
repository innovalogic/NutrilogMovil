import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Timer = ({ tiempoObjetivo = 30, onTimeUp = () => {} }) => {
    const [segundos, setSegundos] = useState(0);
    const [corriendo, setCorriendo] = useState(false);

    const activarTemporizador = () => {
        setCorriendo((si) => !si);
    };

    const reiniciarTemporizador = () => {
        setSegundos(0);
        setCorriendo(false);
    };

    useEffect(() => {
        let intervalo:  ReturnType<typeof setInterval> | null = null;
        if (corriendo) {
            intervalo = setInterval(() => {
                setSegundos((prev) => prev + 1);
            }, 1000);
        }

        if (segundos === tiempoObjetivo) {
            if (onTimeUp) {
                onTimeUp();
            }
            reiniciarTemporizador();
        }

        return () => {
            if (intervalo) clearInterval(intervalo);
        };
    }, [corriendo, segundos, onTimeUp]);

    const formatoTiempo = (sec: number) => {
        const minutos = Math.floor(sec / 60);
        const segundos = sec % 60;
        return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    };

    return (
        <View className="items-center justify-center p-5">
            {/* Botones */}
            <View className="flex-row justify-around w-full mb-6">
                <TouchableOpacity
                    onPress={activarTemporizador}
                    className="bg-[#fc6059] py-2 px-5 rounded-lg mx-2"
                >
                    <Text className="text-white text-lg font-semibold">
                        {corriendo ? 'Detener' : 'Iniciar'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={reiniciarTemporizador}
                    className="bg-[#fc6059] py-2 px-5 rounded-lg mx-2"
                >
                    <Text className="text-white text-lg font-semibold">Reiniciar</Text>
                </TouchableOpacity>
            </View>

            {/* Tiempo */}
            <Text className="text-white text-5xl font-bold">{formatoTiempo(segundos)}</Text>
        </View>
    );
};

export default Timer;
