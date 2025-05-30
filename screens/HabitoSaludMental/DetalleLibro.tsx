import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
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
        const mes = diaActual.getMonth() < 10 ? '0' + (diaActual.getMonth()+1) : diaActual.getMonth();
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
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Cargando libro...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <View className='bg-red-300'>
                <Text className="text-2xl font-bold">{libro.titulo}</Text>
            </View>
            <View className='bg-green-200'>
                <Text className="text-lg">Páginas en la que estoy: {paginasLeidas}</Text>
                <TouchableOpacity
                    onPress={disminuirPagina}
                >
                    <Text>{'<'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={aumentarPagina}
                >
                    <Text>{'>'}</Text>
                </TouchableOpacity>
            </View>
            <View className='bg-blue-200'>
                <Text>Dias de lectura</Text>
                <Calendar
                    markedDates={fechasMarcadas}
                    theme={{
                        selectedDayBackgroundColor: '#00B0FF',
                        todayTextColor: '#FF5722',
                    }}
                />
            </View>

            <View>
                <Text>Recordatorio Diario</Text>
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

            {/* <Text className="text-lg">Páginas leídas: {libro.paginasLeidas}</Text> */}
        </View>
    );
};
export default DetalleLibro;