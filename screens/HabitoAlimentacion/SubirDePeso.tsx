import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    SafeAreaView, 
    ActivityIndicator, 
    Modal, 
    TextInput,
    ScrollView,
    Dimensions,
    Animated,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, firestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, increment } from 'firebase/firestore';
import ReminderButton from 'Componentes/ReminderButton';

// Define the navigation stack's param list
type RootStackParamList = {
    SubirDePeso: undefined;
    DesayunoSubirDePeso: undefined;
    AlmuerzoSubirDePeso: undefined;
    CenaSubirDePeso: undefined;
};

// Define navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserData {
    weightGoal?: number;
    weight?: string;
    breakfastReminder?: string;
    lunchReminder?: string;
    dinnerReminder?: string;
    currentStreakSubirDePeso?: number;
    totalDaysTrackedSubirDePeso?: number;
    lastCompletedDaySubirDePeso?: string; // Para evitar completar el mismo día múltiples veces
}

const { width } = Dimensions.get('window');

// Componente de icono personalizado
const Icon = ({ name, size = 24, color = '#1F2A44' }: { name: string; size?: number; color?: string }) => {
    const icons: { [key: string]: string } = {
        target: '🎯',
        scale: '⚖️',
        breakfast: '🍳',
        lunch: '🍽️',
        dinner: '🌙',
        trophy: '🏆',
        fire: '🔥',
        chart: '📊',
        check: '✅',
        back: '⬅️'
    };
    
    return (
        <Text style={{ fontSize: size, color }}>
            {icons[name] || '📱'}
        </Text>
    );
};

export default function SubirDePeso() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [finishingDay, setFinishingDay] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [weightGoalInput, setWeightGoalInput] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.95));
    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserData(snapshot.data() as UserData);
                        // Animate content appearance with fade and scale
                        Animated.parallel([
                            Animated.timing(fadeAnim, {
                                toValue: 1,
                                duration: 800,
                                useNativeDriver: true,
                            }),
                            Animated.timing(scaleAnim, {
                                toValue: 1,
                                duration: 800,
                                useNativeDriver: true,
                            })
                        ]).start();
                    }
                    setLoading(false);
                });
                return () => unsubscribeSnapshot();
            } else {
                setUserData(null);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const saveWeightGoal = async () => {
        if (!auth.currentUser || !weightGoalInput) return;
        
        try {
            const weightGoal = parseFloat(weightGoalInput);
            if (isNaN(weightGoal)) {
                alert('Ingrese un número válido');
                return;
            }
            if (weightGoal <= 0) {
                alert('La meta debe ser un número positivo mayor a 0');
                return;
            }
            if (weightGoal > 20) {
                alert('La meta no puede ser mayor a 20 kg');
                return;
            }

            await setDoc(doc(firestore, 'users', auth.currentUser.uid), 
                { 
                    weightGoal,
                    // CLAVES ESPECÍFICAS ACTUALIZADAS AQUI TAMBIEN
                    totalDaysTrackedSubirDePeso: userData?.totalDaysTrackedSubirDePeso || 0,
                    currentStreakSubirDePeso: userData?.currentStreakSubirDePeso || 0
                }, 
                { merge: true }
            );
            setModalVisible(false);
            setWeightGoalInput('');
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };

    const handleMealPress = (mealType: string) => {
        console.log(`Botón ${mealType} presionado`);
        switch (mealType) {
            case 'Desayuno':
                navigation.navigate('DesayunoSubirDePeso');
                break;
            case 'Almuerzo':
                navigation.navigate('AlmuerzoSubirDePeso');
                break;
            case 'Cena':
                navigation.navigate('CenaSubirDePeso');
                break;
        }
    };

    const handleSetGoalPress = () => {
        setModalVisible(true);
    };

    const getTodayDateString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; 
    };

    const canCompleteDay = () => {
        const today = getTodayDateString();
        // CLAVE ESPECÍFICA
        return userData?.lastCompletedDaySubirDePeso !== today;
    };

    const handleFinishDay = async () => {
        if (!auth.currentUser || !userData?.weightGoal) {
            Alert.alert(
                "Meta requerida", 
                "Primero debes establecer una meta de peso para comenzar a trackear tus días."
            );
            return;
        }

        if (!canCompleteDay()) {
            Alert.alert(
                "Día ya completado", 
                "Ya completaste el día de hoy para tu objetivo de subir de peso. ¡Vuelve mañana para continuar tu progreso!"
            );
            return;
        }

        Alert.alert(
            "Finalizar Día",
            "¿Estás seguro de que quieres marcar este día como completado? Esto sumará +1 día a tu progreso de subir de peso.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        try {
                            setFinishingDay(true);
                            const today = getTodayDateString();
                            const userDocRef = doc(firestore, 'users', auth.currentUser!.uid);
                            
                            await updateDoc(userDocRef, {
                                // CLAVES ESPECÍFICAS
                                totalDaysTrackedSubirDePeso: increment(1),
                                currentStreakSubirDePeso: increment(1),
                                lastCompletedDaySubirDePeso: today
                            });

                            Alert.alert(
                                "¡Excelente! 🎉", 
                                `Has completado un día más en tu transformación para subir de peso. Llevas ${(userData.totalDaysTrackedSubirDePeso || 0) + 1} días en total.`,
                                [{ text: "¡Genial!", style: "default" }]
                            );
                        } catch (error) {
                            console.error('Error al finalizar día (SubirDePeso):', error);
                            Alert.alert(
                                "Error", 
                                "Hubo un problema al guardar tu progreso. Intenta nuevamente."
                            );
                        } finally {
                            setFinishingDay(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <View className="items-center">
                    <ActivityIndicator size="large" color="#1F2A44" />
                    <Text className="text-gray-100 mt-4 text-base font-medium">Cargando tu progreso...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Header */}
                <View className="bg-purple-900 pt-12 pb-8 px-6 rounded-b-2xl shadow-md">
                    <View className="items-center">
                        <Icon name="target" size={28} color="#F5F5F5" />
                        <Text className="text-gray-100 text-xl font-semibold mt-2">Transformación Personal</Text>
                        <Text className="text-gray-300 text-sm">Tu ruta hacia un aumento de peso saludable y equilibrado</Text>
                    </View>
                </View>

                <View className="px-6 mt-6">
                    {/* Mensaje para establecer meta si no existe */}
                    {!userData?.weightGoal && (
                        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                            <View className="items-center">
                                <Icon name="target" size={40} color="#1F2A44" />
                                <Text className="text-gray-900 text-lg font-semibold mt-4 mb-2">¡Establece tu Meta!</Text>
                                <Text className="text-gray-600 text-center text-sm mb-6">
                                    Establece tu objetivo de peso para dar el primer paso en tu transformación
                                </Text>
                                <TouchableOpacity
                                    className="bg-purple-600 py-3 px-6 rounded-lg shadow-sm"
                                    onPress={handleSetGoalPress}
                                >
                                    <Text className="text-white font-semibold">Establecer Meta</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Sección de comidas */}
                    {userData?.weightGoal && (
                        <Animated.View 
                            style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
                            className="mb-6"
                        >
                            <Text className="text-gray-100 text-lg font-semibold mb-4 text-center">
                                📅 Plan de Alimentación Diario
                            </Text>
                            
                            {[
                                { name: 'Desayuno', icon: 'breakfast', color: 'bg-green-50', borderColor: 'border-green-100', time: userData?.breakfastReminder, fieldName: 'breakfastReminder' },
                                { name: 'Almuerzo', icon: 'lunch', color: 'bg-orange-50', borderColor: 'border-orange-100', time: userData?.lunchReminder, fieldName: 'lunchReminder' },
                                { name: 'Cena', icon: 'dinner', color: 'bg-blue-50', borderColor: 'border-blue-100', time: userData?.dinnerReminder, fieldName: 'dinnerReminder' }
                            ].map((meal, index) => (
                                <View key={meal.name} className="mb-4">
                                    <View className="flex-row items-center space-x-3">
                                        <TouchableOpacity
                                            className={`${meal.color} ${meal.borderColor} py-4 px-6 rounded-xl flex-1 border shadow-sm`}
                                            onPress={() => handleMealPress(meal.name)}
                                        >
                                            <View className="flex-row items-center justify-center">
                                                <Icon name={meal.icon} size={20} color="#1F2A44" />
                                                <Text className="text-gray-900 text-center font-semibold text-base ml-2">
                                                    {meal.name}
                                                </Text>
                                            </View>
                                            {meal.time && (
                                                <Text className="text-gray-600 text-center text-xs mt-1">
                                                    🔔 {meal.time}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                        
                                        <ReminderButton 
                                            reminderTime={meal.time} 
                                            fieldName={meal.fieldName} 
                                            label={`Recordatorio ${meal.name}`} 
                                        />
                                    </View>
                                </View>
                            ))}

                            {/* Botón Finalizar Día */}
                            <TouchableOpacity
                                className={`${canCompleteDay() ? 'bg-purple-600' : 'bg-gray-500'} py-4 px-6 rounded-xl mt-6 shadow-sm`}
                                onPress={handleFinishDay}
                                disabled={finishingDay || !canCompleteDay()}
                            >
                                <View className="flex-row items-center justify-center">
                                    {finishingDay ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Icon name="check" size={20} color="#FFFFFF" />
                                            <Text className="text-white text-center font-semibold text-base ml-2">
                                                {canCompleteDay() ? 'Finalizar Día' : 'Día Completado ✨'}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>

                            {!canCompleteDay() && (
                                <Text className="text-gray-400 text-center text-xs mt-2">
                                    Ya completaste el día de hoy para subir de peso. ¡Vuelve mañana!
                                </Text>
                            )}
                        </Animated.View>
                    )}

                    {/* Consejos motivacionales */}
                    {userData?.weightGoal && (
                        <View className="bg-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100">
                            <Text className="text-indigo-900 text-lg font-semibold mb-2">💡 Consejo del Día</Text>
                            <Text className="text-indigo-700 text-sm leading-5">
                                "Cada avance suma. Sé constante y celebra cada logro en tu camino hacia un bienestar óptimo."
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/80">
                    <View className="bg-white rounded-2xl p-6 w-4/5 max-w-sm border border-gray-200">
                        <View className="items-center mb-4">
                            <Icon name="target" size={40} color="#1F2A44" />
                            <Text className="text-gray-900 text-lg font-semibold mt-2">Nueva Meta</Text>
                            <Text className="text-gray-500 text-center text-sm">
                                Define cuánto peso quieres ganar
                            </Text>
                        </View>
                        
                        {userData?.weight && (
                            <View className="bg-gray-100 rounded-xl p-3 mb-4">
                                <Text className="text-gray-500 text-xs">Peso Actual</Text>
                                <Text className="text-gray-900 text-base font-semibold">
                                    {userData.weight} kg
                                </Text>
                            </View>
                        )}
                        
                        <TextInput
                            className="bg-gray-100 text-gray-900 p-3 rounded-xl mb-4 text-sm border border-gray-200"
                            placeholder="Ej: 5 kg (Máximo 20 kg)"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={weightGoalInput}
                            onChangeText={setWeightGoalInput}
                        />
                        
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                className="bg-gray-200 px-4 py-3 rounded-xl flex-1"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="text-gray-900 text-center font-medium">Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                className="bg-purple-600 px-4 py-3 rounded-xl flex-1 shadow-sm"
                                onPress={saveWeightGoal}
                            >
                                <Text className="text-white text-center font-semibold">Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}