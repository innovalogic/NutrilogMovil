import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, RouteProp } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import { Calendar } from 'react-native-calendars';
import CambiarHora from 'Componentes/Hora';

type RootStackParamList = {
    DetalleLibro: { libroId: string };
};

type DetalleLibroRouteProp = RouteProp<RootStackParamList, 'DetalleLibro'>;

const DetalleLibro = () => {
    const [diasLeidos, setDiasLeidos] = useState<string[]>([]);
    const route = useRoute<DetalleLibroRouteProp>();
    const { libroId } = route.params;
    const [paginasLeidas, setPaginasLeidas] = useState<number>(0);
    const [hora, setHora] = useState(0);
    const [minutos, setMinutos] = useState(0);
    const [fechasMarcadas, setFechasMarcadas] = useState<{ [date: string]: any }>({});

    const [libro, setLibro] = useState<null | {
        titulo: string;
        paginas: number;
        paginasLeidas: number;
    }>(null);

    const obtenerFechaActual = (): string => {
        const diaActual = new Date();
        const anio = diaActual.getFullYear();
        const mes = diaActual.getMonth() < 10 ? '0' + (diaActual.getMonth() + 1) : diaActual.getMonth();
        const dia = diaActual.getDate();
        return `${anio}-${mes}-${dia}`;
    };

    const disminuirPagina = () => {
        if (paginasLeidas > 0) {
            setPaginasLeidas(paginasLeidas - 1);
        }
    };

    const aumentarPagina = () => {
        if (libro && paginasLeidas < libro.paginas) {
            setPaginasLeidas(paginasLeidas + 1);
            const fecha = obtenerFechaActual();
            console.log(fecha)
            setDiasLeidos(prev => {
                if (!prev.includes(fecha)) {
                    return [...prev, fecha];
                }
                return prev;
            });
        }
    };

    const guardarCambios = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const libroRef = doc(firestore, 'users', user.uid, 'Libros', libroId);
        await updateDoc(libroRef, {
            paginasLeidas: paginasLeidas,
            diasLeidos: diasLeidos,
        });
        alert('Cambios guardados');
    };

    useEffect(() => {
        const fetchLibro = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const libroRef = doc(firestore, 'users', user.uid, 'Libros', libroId);
            const docSnap = await getDoc(libroRef);

            if (docSnap.exists()) {
                const libroData = docSnap.data() as any;
                setLibro(libroData);
                setPaginasLeidas(libroData.paginasLeidas);

                if (libroData.diasLeidos) {
                    // setDiasLeidos(libroData.diasLeidos);
                    const fechasMarcadas: { [date: string]: any } = {};
                    libroData.diasLeidos.forEach((fecha: string) => {
                        fechasMarcadas[fecha] = {
                            selected: true,
                            marked: true,
                            selectedColor: '#00B0FF',
                        };
                    });
                    setDiasLeidos(libroData.diasLeidos);
                    setFechasMarcadas(fechasMarcadas);
                }
            } else {
                console.log('Libro no encontrado');
            }
        };
        fetchLibro();
    }, [libroId]);

    if (!libro) {
        return (
            <LinearGradient
                colors={['#000000', '#0f1828']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 justify-center items-center"
            >
                <View>
                    <Text className='text-white text-2xl'>Cargando libro...</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#000000', '#0f1828']}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 justify-center items-center"
        >
            <View className="flex-1 justify-center items-center">

                <View className=''>
                    <Text className="text-4xl font-extralight text-white">{libro.titulo}</Text>
                </View>

                <View className='mt-3 mb-3 p-3 bg-[#202938] rounded-2xl'>
                    <Text className="text-lg text-white">Páginas en la que estoy</Text>

                    <View className='flex-row justify-between'>
                        <View>
                            <TouchableOpacity
                                onPress={disminuirPagina}
                            >
                                <Text className='text-white text-4xl'>{'<'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text className='text-white text-3xl'>
                                {paginasLeidas}
                            </Text>
                        </View>

                        <View>
                            <TouchableOpacity
                                onPress={aumentarPagina}
                            >
                                <Text className='text-white text-4xl'>{'>'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className=''>
                    <Text className='text-white text-2xl'>Dias de lectura</Text>
                </View>

                <View className="m-4 rounded-2xl overflow-hidden border border border-gray-200/25">
                    <Calendar
                        markedDates={fechasMarcadas}
                        theme={{
                            backgroundColor: '#101622',
                            calendarBackground: '#101622',
                            textSectionTitleColor: '#ffffffaa',
                            selectedDayBackgroundColor: '#00B0FF',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#FF5722',
                            dayTextColor: '#ffffff',
                            textDisabledColor: '#444c5c',
                            monthTextColor: '#ffffff',
                            arrowColor: '#ffffff',
                            textDayFontFamily: 'System',
                            textMonthFontFamily: 'System',
                            textDayHeaderFontFamily: 'System',
                            textDayFontSize: 16,
                            textMonthFontSize: 20,
                            textDayHeaderFontSize: 14,
                        }}
                        style={{
                            borderRadius: 16,
                            padding: 10,
                        }}
                        headerStyle={{
                            backgroundColor: '#19253b',
                            borderBottomWidth: 1,
                            borderBottomColor: '#303b50',
                        }}
                    />
                </View>

                <CambiarHora onHoraSeleccionada={(h, m) => {
                    setHora(h);
                    setMinutos(m);
                }} />

                <TouchableOpacity className='bg-orange-500'
                    onPress={guardarCambios}
                >
                    <Text>Guardar Cambios</Text>
                </TouchableOpacity>

            </View>
        </LinearGradient>
    );
};
export default DetalleLibro;