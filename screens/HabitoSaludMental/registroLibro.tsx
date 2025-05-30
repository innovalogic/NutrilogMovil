import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import { useState } from 'react';
import type { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import CambiarHora from 'Componentes/Hora';
import * as Notifications from 'expo-notifications';


type RootStackParamList = {
    RegistroLecturaDiaria: undefined;
};

type MensajeRouteProp = RouteProp<RootStackParamList, 'RegistroLecturaDiaria'>;
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

return (
    <LinearGradient
        colors={['#0f1829', '#305bab']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="flex-1 justify-center items-center"
    >
        <View className='bg-white'>
            <Text>Registro de Libro</Text>
        </View>
        <View className='bg-red-500'>
            <TextInput
                placeholder='Ingrese Titulo del Libro'
                value={titulo}
                onChangeText={setTitulo}
            />
        </View>

        <View className='bg-green-500'>
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
                // await programarNotificacion();
                // menuRegistroLibro();
            }}
        >
            <Text className='bg-white'>Guardar</Text>
        </TouchableOpacity>
    </LinearGradient>
);
};
export default RegistroLibro;