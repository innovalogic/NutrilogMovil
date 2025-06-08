import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { auth, firestore } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

// Componente de icono personalizado 
const Icon = ({ name, size = 24, color = '#FFFFFF' }: { name: string; size?: number; color?: string }) => {
    const icons: { [key: string]: string } = {
        target: '🎯',
        scale: '⚖️',
        trophy: '🏆',
        calories: '🔥', 
        time: '⏰', 
        gym: '🏋️', 
    };

    return (
        <Text style={{ fontSize: size, color }}>
            {icons[name] || '📱'}
        </Text>
    );
};

interface ProgressData {
    tipoEjercicio: string;
    fechaSesion: string;
    tiempoTrabajoSegundos: number;
    caloriasQuemadas: number;
    tipoRutina: string; 
}

interface AgrupadoPorTipo {
    [key: string]: ProgressData[]; 
}

const ServicioDeProgreso = () => {
    const [progreso, setProgreso] = useState<ProgressData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgreso = async () => {
            const user = auth.currentUser;

            if (user) {
                try {
                    const tiposRutinas = ['tren_superior', 'tren_medio', 'tren_inferior'];
                    const progresoData: ProgressData[] = [];

                    for (const tipo of tiposRutinas) {
                        const sesionesRef = collection(firestore, 'users', user.uid, 'ejercicioRutinas', tipo, 'sesiones');
                        const querySnapshot = await getDocs(sesionesRef);

                        querySnapshot.docs.forEach(doc => {
                            progresoData.push({
                                tipoEjercicio: doc.data().tipoEjercicio,
                                fechaSesion: doc.data().fechaSesion,
                                tiempoTrabajoSegundos: doc.data().tiempoTrabajoSegundos,
                                caloriasQuemadas: doc.data().caloriasQuemadas,
                                tipoRutina: tipo, 
                            });
                        });
                    }

                    setProgreso(progresoData);
                } catch (error) {
                    console.error('Error al obtener progreso:', error);
                }
            }
            setLoading(false);
        };

        fetchProgreso();
    }, []);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator size="large" color="#BB86FC" />
                <Text className="text-gray-300 mt-4 text-base font-medium">Cargando tu progreso...</Text>
            </SafeAreaView>
        );
    }

    // Agrupar datos por tipo de ejercicio y sumar calorías y tiempo
    const agrupadoPorTipo: AgrupadoPorTipo = progreso.reduce((acc, item) => {
        if (!acc[item.tipoEjercicio]) {
            acc[item.tipoEjercicio] = [];
        }
        acc[item.tipoEjercicio].push(item);
        return acc;
    }, {} as AgrupadoPorTipo);

    const resultadosSumados = Object.keys(agrupadoPorTipo).map(tipoEjercicio => {
        const items = agrupadoPorTipo[tipoEjercicio];
        const totalCalorias = items.reduce((sum, item) => sum + item.caloriasQuemadas, 0);
        const totalTiempo = items.reduce((sum, item) => sum + item.tiempoTrabajoSegundos, 0);
        const fechaSesion = items[0].fechaSesion; 

        return {
            tipoEjercicio,
            fechaSesion,
            tiempoTrabajoSegundos: totalTiempo,
            caloriasQuemadas: totalCalorias,
            tipoRutina: items[0].tipoRutina,
        };
    });

    // Agrupar datos por tipo de rutina (tren_superior, tren_medio, tren_inferior)
    const agrupadoPorTipoFinal: AgrupadoPorTipo = resultadosSumados.reduce((acc, item) => {
        const tipoRutina = item.tipoRutina;
        if (!acc[tipoRutina]) {
            acc[tipoRutina] = [];
        }
        acc[tipoRutina].push(item);
        return acc;
    }, {} as AgrupadoPorTipo);

    // Calcular estadísticas globales
    const totalCaloriasGlobal = progreso.reduce((sum, item) => sum + item.caloriasQuemadas, 0);
    const totalTiempoGlobalSegundos = progreso.reduce((sum, item) => sum + item.tiempoTrabajoSegundos, 0);
    const totalTiempoGlobalMinutos = (totalTiempoGlobalSegundos / 60).toFixed(0);

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Header */}
                <View className="bg-purple-800 pt-16 pb-10 px-6 rounded-b-3xl shadow-lg">
                    <View className="flex-row items-center justify-center mb-2">
                        <Icon name="gym" size={40} color="#E0BBE4" />
                        <Text className="text-white text-3xl font-bold ml-3">Tu Progreso Fitness</Text>
                    </View>
                    <Text className="text-purple-200 text-base mt-2 text-center">
                        Monitorea tus entrenamientos y mantente en forma.
                    </Text>
                </View>

                <View className="px-6 mt-8">
                    {/* Sección de Estadísticas Generales */}
                    <View className="bg-gray-800 rounded-2xl p-6 mb-6 shadow-xl border border-gray-700">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-white text-xl font-bold">Resumen General</Text>
                            <Icon name="chart" size={28} color="#BB86FC" />
                        </View>
                        <View className="flex-row justify-around items-center">
                            <View className="items-center bg-gray-700 p-4 rounded-xl flex-1 mx-2">
                                <Icon name="calories" size={32} color="#FF6B6B" />
                                <Text className="text-white text-2xl font-bold mt-2">{totalCaloriasGlobal.toFixed(0)}</Text>
                                <Text className="text-gray-400 text-sm">Calorías Quemadas</Text>
                            </View>
                            <View className="items-center bg-gray-700 p-4 rounded-xl flex-1 mx-2">
                                <Icon name="time" size={32} color="#4ECDC4" />
                                <Text className="text-white text-2xl font-bold mt-2">{totalTiempoGlobalMinutos}</Text>
                                <Text className="text-gray-400 text-sm">Minutos Entrenados</Text>
                            </View>
                        </View>
                    </View>

                    {/* Mostrar progreso agrupado por tipo de rutina */}
                    {Object.keys(agrupadoPorTipoFinal).length === 0 && (
                        <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
                            <View className="items-center">
                                <Text style={{ fontSize: 48 }}>😔</Text>
                                <Text className="text-white text-xl font-bold mt-4 text-center">
                                    ¡Aún no hay progreso registrado!
                                </Text>
                                <Text className="text-gray-400 text-base mt-2 text-center">
                                    Registra tus rutinas de ejercicio para ver tus estadísticas aquí.
                                </Text>
                            </View>
                        </View>
                    )}

                    {Object.keys(agrupadoPorTipoFinal).map((tipo) => (
                        <View key={tipo} className="mb-6">
                            <View className="flex-row items-center justify-between mb-4 pl-2">
                                <Text className="text-white text-2xl font-bold capitalize">{tipo.replace('_', ' ')}</Text>
                                <Icon name="chart" size={28} color="#BB86FC" />
                            </View>
                            {agrupadoPorTipoFinal[tipo].length === 0 ? (
                                <View className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
                                    <Text className="text-gray-400 text-base">No hay datos de progreso disponibles para {tipo.replace('_', ' ')}.</Text>
                                </View>
                            ) : (
                                agrupadoPorTipoFinal[tipo].map((item, index) => (
                                    <View
                                        key={index}
                                        className="bg-gray-800 rounded-xl p-5 mb-4 shadow-md border border-l-4 border-purple-600 flex-row items-center justify-between"
                                    >
                                        <View className="flex-1">
                                            <Text className="text-purple-400 text-base font-semibold mb-1">
                                                {item.tipoEjercicio}
                                            </Text>
                                            <Text className="text-gray-300 text-sm">
                                                🗓️ {new Date(item.fechaSesion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </Text>
                                            <View className="flex-row items-center mt-2">
                                                <Icon name="calories" size={18} color="#FF6B6B" />
                                                <Text className="text-white text-sm ml-2">
                                                    Calorías: {item.caloriasQuemadas.toFixed(0)} kcal
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center mt-1">
                                                <Icon name="time" size={18} color="#4ECDC4" />
                                                <Text className="text-white text-sm ml-2">
                                                    Tiempo: {(item.tiempoTrabajoSegundos / 60).toFixed(1)} min
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="ml-4 p-2 bg-purple-900 rounded-full">
                                            <Icon name="trophy" size={24} color="#FFF" />
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ServicioDeProgreso;