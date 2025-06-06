import { View, Text, Image } from 'react-native'
import { collection, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import React, { useState, useEffect } from 'react';

const ProgresoYoga = ({ }) => {
    const [niveles, setNiveles] = useState<any[]>([]);

    const ObtenerNivelesYoga = async () => {

        const usuario = auth.currentUser;
        if (!usuario) {
            console.log("Usuario no autenticado")
            return;
        }

        try {
            const leerNiveles = await getDocs(collection(firestore, 'users', usuario.uid, 'ejerciciosYoga'));
            const datosNiveles = leerNiveles.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    minutos: data.minutos,
                    segundos: data.segundos,
                    nivel: data.nivel,
                };
            });
            setNiveles(datosNiveles);
        } catch (error) {
            console.error('Error al obtener los documentos:', error);
        }
    };
    useEffect(() => {
        ObtenerNivelesYoga();
    }, []);

    const formatearTiempo = (minutos: number, segundos: number) => {
        const totalSegundos = (minutos * 60) + segundos;

        const horas = Math.floor(totalSegundos / 3600);
        const mins = Math.floor((totalSegundos % 3600) / 60);
        const segs = totalSegundos % 60;

        return [
            horas.toString().padStart(2, '0'),
            mins.toString().padStart(2, '0'),
            segs.toString().padStart(2, '0')
        ].join(':');
    };


    return (
        <>
            <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
                <View className=" items-center justify-between mb-4">
                    <Text className="text-white text-2xl font-bold">Progreso Yoga</Text>
                    <View>
                        {niveles.map((item) => (
                            <View key={item.nivel} className="bg-purple-500 p-4 rounded-2xl mb-4 w-full mt-3">
                                <View className="flex-row items-center">

                                    <View>
                                        <Image
                                            source={require('../../assets/yoga1.png')}
                                            className="w-[45] h-[45] mt-5 rounded-full"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-white text-lg font-bold">{item.nivel}</Text>
                                        <Text className="text-gray-300 text-sm">Tiempo Total</Text>

                                        <Text className="text-white text-lg font-mono">  {formatearTiempo(item.minutos, item.segundos)}</Text>
                                        {/* <Text className="text-white text-lg font-mono">{formatearTiempo(item.totalSegundos)}</Text> */}
                                        <Text className="text-gray-300 text-sm mt-1">Sesiones{item.sesiones}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                </View>
            </View>

        </>
    );
};

export default ProgresoYoga;