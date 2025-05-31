import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import CambiarHora from 'Componentes/Hora';
import * as Notifications from 'expo-notifications';
import { AntDesign } from '@expo/vector-icons';
import { KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Alert } from 'react-native';


type RootStackParamList = {
    RegistroLecturaDiaria: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


const RegistroLibro = () => {
    const navigation = useNavigation<NavigationProp>();
    const [hora, setHora] = useState(0);
    const [minutos, setMinutos] = useState(0);
    const [titulo, setTitulo] = useState('');
    const [paginas, setPaginas] = useState('');

    const registrar = async () => {
        const user = auth.currentUser;

        if (!user) {
            console.log("Usuario no autenticado");
            return;
        }

        if (titulo.trim() === '' || paginas.trim() === '') {
            Alert.alert(
                'Campos incompletos',
                'Por favor, completa todos los campos.',
                [
                    {
                        text: 'Entendido',
                    },
                ],
                { cancelable: false }
            );

            return;
        }

        try {
            const docRef = doc(firestore, 'users', user.uid, 'Libros', titulo);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log('el libro existe');
            } else {
                await setDoc(docRef, {
                    titulo: titulo,
                    paginas: parseInt(paginas),
                    paginasLeidas: 0,
                    hora: hora,
                    minutos: minutos,
                });
                console.log('guardado');

                const ahora = new Date();
                const horaNotificacion = new Date(ahora);
                horaNotificacion.setHours(hora);
                horaNotificacion.setMinutes(minutos);
                horaNotificacion.setSeconds(0);

                if (horaNotificacion <= ahora) {
                    horaNotificacion.setDate(horaNotificacion.getDate() + 1);
                    console.log('hora pasada')
                }

                await Notifications.cancelAllScheduledNotificationsAsync();

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: '¡Hora de leer!',
                        body: 'No olvides leer tu libro hoy.',
                        sound: true,
                    },
                    trigger: {
                        channelId: 'default',
                        hour: hora,
                        minute: minutos,
                        repeats: true,
                    },
                });
                menuRegistroLibro()
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const menuRegistroLibro = async () => {
        navigation.navigate('RegistroLecturaDiaria');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            behavior="height"
            className="flex-1"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <LinearGradient
                    colors={['#000000', '#0f1828']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="flex-1 justify-center items-center"
                >
                    <View className="absolute top-10 left-4 z-10">
                        <TouchableOpacity onPress={handleBack}>
                            <AntDesign name="arrowleft" size={30} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="px-8 bg-[#202938] rounded-3xl p-6">
                        <View className="mt-10 items-center">
                            <Text className="text-4xl text-white">Registro de Libro</Text>
                        </View>

                        <View className='items-center mb-2 mt-3'>
                            <Image
                                source={require('../../assets/iconoLibro.png')}
                                className="w-16 h-16"
                            />
                        </View>

                        <View className='bg-white rounded-2xl mt-5'>
                            <TextInput
                                placeholder='Ingrese Titulo del Libro'
                                value={titulo}
                                onChangeText={setTitulo}
                                returnKeyType="next"
                            />
                        </View>

                        <View className='bg-white rounded-2xl mt-5 mb-4'>
                            <TextInput
                                placeholder='Ingrese cantidad de paginas del libro'
                                value={paginas}
                                onChangeText={setPaginas}
                                keyboardType='numeric'
                            />
                        </View>

                        <CambiarHora onHoraSeleccionada={(h, m) => {
                            setHora(h);
                            setMinutos(m);
                        }}
                        />
                        <TouchableOpacity
                            onPress={async () => {
                                await registrar();
                            }}
                            className='bg-sky-300/75 items-center rounded-3xl py-1 mx-16'
                        >
                            <Text className='text-white text-lg'>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </TouchableWithoutFeedback>

        </KeyboardAvoidingView>
    );
};
export default RegistroLibro;