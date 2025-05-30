import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import BottomNavBar from 'Componentes/BottomNavBar';
import { collection, addDoc, Timestamp, getDocs, query, where, Firestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../../firebase';
import { Alert } from 'react-native';


type MetaDiaria = {
  nombre: string;
  unidad: string;
  meta: number;
  valor: number;
};

type RegistroAlimento = {
  nombre: string;
  valor: number;
};

const metasIniciales: MetaDiaria[] = [
  { nombre: 'Calorías', unidad: '', meta: 2000, valor: 0 },
  { nombre: 'Proteínas (g)', unidad: 'g', meta: 50, valor: 0 },
  { nombre: 'Grasas (g)', unidad: 'g', meta: 70, valor: 0 },
  { nombre: 'Carbohidratos (g)', unidad: 'g', meta: 260, valor: 0 },
  { nombre: 'Agua (mL)', unidad: 'mL', meta: 3000, valor: 0 },
];

const registrosIniciales: RegistroAlimento[] = [
  { nombre: 'Calorías', valor: 0 },
  { nombre: 'Proteínas (g)', valor: 0 },
  { nombre: 'Grasas (g)', valor: 0 },
  { nombre: 'Carbohidratos (g)', valor: 0 },
  { nombre: 'Agua (mL)', valor: 0 },
];

// Colores únicos para cada barra de meta
const coloresBarra: { [key: string]: string } = {
  'Calorías': 'bg-red-400',
  'Proteínas (g)': 'bg-blue-400',
  'Grasas (g)': 'bg-yellow-400',
  'Carbohidratos (g)': 'bg-purple-400',
  'Agua (mL)': 'bg-teal-400',
};

const DietaMantenerPeso: React.FC = () => {
  const [metasDiarias, setMetasDiarias] = useState<MetaDiaria[]>(metasIniciales);
  const [registroAlimentos, setRegistroAlimentos] = useState<RegistroAlimento[]>(registrosIniciales);
  const [yaRegistradoHoy, setYaRegistradoHoy] = useState(false);
  const [registroExistente, setRegistroExistente] = useState<any>(null);


  const incrementar = (
    arraySetter: React.Dispatch<React.SetStateAction<any[]>>,
    index: number
  ) => {
    arraySetter((prev) =>
      prev.map((item, i) => {
        const metaCorrespondiente = metasIniciales.find((meta) => meta.nombre === item.nombre);
        const limite = metaCorrespondiente ? metaCorrespondiente.meta : Infinity;
        const incremento = 50;
        const nuevoValor = Math.min(item.valor + incremento, limite); // ✅ ajuste aquí
        return i === index ? { ...item, valor: nuevoValor } : item;
      })
    );
  };


  const decrementar = (
    arraySetter: React.Dispatch<React.SetStateAction<any[]>>,
    index: number
  ) => {
    arraySetter((prev) =>
      prev.map((item, i) => {
        const decremento = 50;
        const nuevoValor = item.valor - decremento >= 0 ? item.valor - decremento : item.valor;
        return i === index ? { ...item, valor: nuevoValor } : item;
      })
    );
  };

  useEffect(() => {
    setMetasDiarias((prev) =>
      prev.map((meta) => {
        const registro = registroAlimentos.find((r) => r.nombre === meta.nombre);
        return registro ? { ...meta, valor: registro.valor } : meta;
      })
    );
  }, [registroAlimentos]);
  useEffect(() => {
  const verificarRegistroDiario = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    const habitosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosAlimenticios');
    const q = query(habitosRef, where('habitoSeleccionado', '==', 'Dieta Para Mantener el Peso'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return;

    const habitoDocId = querySnapshot.docs[0].id;

    const registroRef = collection(
      firestore,
      'habitosUsuarios',
      user.uid,
      'habitosAlimenticios',
      habitoDocId,
      'registro'
    );

    const registrosSnap = await getDocs(registroRef);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const registroHoy = registrosSnap.docs.find((doc) => {
      const fecha = doc.data().timestamp.toDate();
      fecha.setHours(0, 0, 0, 0);
      return fecha.getTime() === hoy.getTime();
    });

    if (registroHoy) {
      setRegistroExistente(registroHoy.data());
      setYaRegistradoHoy(true);
    }
  };

  verificarRegistroDiario();
}, []);


  const todasCompletas = metasDiarias.every((m) => m.valor >= m.meta);

  const guardarRegistro = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    // 🔍 Buscar el documento del hábito "Dieta Para Mantener el Peso"
    const habitosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosAlimenticios');
    const q = query(habitosRef, where('habitoSeleccionado', '==', 'Dieta Para Mantener el Peso'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      Alert.alert('Error', 'No se encontró el hábito "Dieta Para Mantener el Peso"');
      return;
    }

    const habitoDocId = querySnapshot.docs[0].id;

    // 📦 Preparar datos del progreso
    const progreso = metasDiarias.map((meta) => {
    const porcentaje = meta.meta > 0 ? Math.min((meta.valor / meta.meta) * 100, 100) : 0;
    return {
      nombre: meta.nombre,
      valor: meta.valor,
      unidad: meta.unidad,
      meta: meta.meta,
      porcentaje: parseFloat(porcentaje.toFixed(2)), // opcional: limitar a 2 decimales
    };
  });

    // 💾 Guardar en la subcolección `registro`
    const registroRef = collection(
      firestore,
      'habitosUsuarios',
      user.uid,
      'habitosAlimenticios',
      habitoDocId,
      'registro'
    );

    await addDoc(registroRef, {
      timestamp: Timestamp.now(),
      metas: progreso,
    });

    Alert.alert('Éxito', 'Registro diario guardado exitosamente');
    setYaRegistradoHoy(true);
    // Volver a consultar el registro más reciente
    const registrosSnap = await getDocs(registroRef);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const registroHoy = registrosSnap.docs.find((doc) => {
      const fecha = doc.data().timestamp.toDate();
      fecha.setHours(0, 0, 0, 0);
      return fecha.getTime() === hoy.getTime();
    });

    if (registroHoy) {
      setRegistroExistente(registroHoy.data());
    }
  } catch (error) {
    Alert.alert('Error', 'Hubo un problema al guardar el registro. Intenta nuevamente.');
  }
};


  return (
  <View className="flex-1 bg-gray-900">
    <ScrollView className="px-6 pt-8">
      <Text className="text-center text-xl font-bold text-white mb-6 mt-2">
        Seguimiento de Dieta Para Mantener el Peso 
      </Text>

      {yaRegistradoHoy && registroExistente ? (
        <>
          <View className="bg-gray-800 rounded-2xl p-4 mb-6">
            <Text className="text-lg font-semibold text-white mb-4">Resumen de Hoy</Text>
            {registroExistente.metas.map((meta: any, index: number) => (
              <View key={index} className="mb-4">
                <Text className="text-white font-medium">{meta.nombre}</Text>
                <Text className="text-gray-300 mb-1">
                  {meta.valor}/{meta.meta} {meta.unidad}
                </Text>
                <View className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <View
                    style={{ width: `${meta.porcentaje}%` }}
                    className={`h-full rounded-full ${
                      meta.porcentaje >= 100
                        ? 'bg-green-400'
                        : coloresBarra[meta.nombre] || 'bg-orange-400'
                    }`}
                  />
                </View>
              </View>
            ))}
          </View>

          <View className="bg-gray-800 rounded-2xl p-4 mb-6">
            <Text className="text-lg font-semibold text-white mb-2">Consejos para mejorar</Text>
            <Text className="text-white text-sm">
              Intenta mantener un equilibrio entre todos los macronutrientes.
              Bebe suficiente agua durante el día y no te saltes comidas importantes.
            </Text>
          </View>
        </>
      ) : (
        <>
          {/* 👇 Sección normal de registro si aún no ha registrado */}
          <View className="bg-gray-800 rounded-2xl p-4 mb-6">
            <Text className="text-lg font-semibold text-white mb-4">Metas Diarias</Text>
            {metasDiarias.map((item, index) => {
              const progreso = Math.min((item.valor / item.meta) * 100, 100);
              return (
                <View key={index} className="mb-4">
                  <Text className="text-white font-medium">{item.nombre}</Text>
                  <Text className="text-gray-300 mb-1">
                    {item.valor}/{item.meta} {item.unidad}
                  </Text>
                  <View className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                    <View
                      style={{ width: `${progreso}%` }}
                      className={`h-full rounded-full ${
                        progreso >= 100
                          ? 'bg-green-400'
                          : coloresBarra[item.nombre] || 'bg-orange-400'
                      }`}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View className="bg-gray-800 rounded-2xl p-4 mb-6">
            <Text className="text-lg font-semibold text-white mb-4">Registrar Alimentos</Text>
            {registroAlimentos.map((item, index) => (
              <View key={index} className="mb-3">
                <Text className="text-white font-medium">{item.nombre}</Text>
                <View className="flex-row items-center justify-between bg-gray-700 rounded-full px-4 py-3 mt-2">
                  <TouchableOpacity onPress={() => decrementar(setRegistroAlimentos, index)}>
                    <Text className="text-3xl text-white px-4">−</Text>
                  </TouchableOpacity>
                  <Text className="text-xl text-white">{item.valor}</Text>
                  <TouchableOpacity onPress={() => incrementar(setRegistroAlimentos, index)}>
                    <Text className="text-3xl text-white px-4">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="bg-green-500 py-4 rounded-full mb-12"
            onPress={guardarRegistro}
          >
            <Text className="text-white text-center font-bold text-xl">Finalizar Día</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>

    <BottomNavBar />
  </View>
);

};

export default DietaMantenerPeso;
