import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import BottomNavBar from '../Componentes/BottomNavBar';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

type Meta = {
  nombre: string;
  meta: number;
  valor: number;
  porcentaje: number;
  unidad: string;
};

type Libro = {
  titulo: string;
  diasLeidos: {
    paginasLeidas: number;
    paginas: number;
    hora: number;
    minutos: number;
    [key: string]: any;
  }[];
};

type Origami = {
  nombreOrigami: string;
  dificultad: string;
  fechaCompletado: string;
};

export default function SeguimientoScreen() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [libro, setLibro] = useState<Libro | null>(null);
  const [origamis, setOrigamis] = useState<Origami[]>([]);
  const [loading, setLoading] = useState(true);
  const [sinDatos, setSinDatos] = useState(false);

  useEffect(() => {
    const fetchDatos = async () => {
      const db = getFirestore();
      const auth = getAuth();
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      try {
        let datosEncontrados = false;

        // 1. Buscar hábitos alimenticios
        const habitosRef = collection(db, `habitosUsuarios/${uid}/habitosAlimenticios`);
        const habitosSnap = await getDocs(habitosRef);

        for (const habitoDoc of habitosSnap.docs) {
          const habito = habitoDoc.data();
          if (habito.habitoSeleccionado === "Dieta Para Mantener el Peso") {
            const registrosRef = collection(db, `habitosUsuarios/${uid}/habitosAlimenticios/${habitoDoc.id}/registro`);
            const registrosSnap = await getDocs(registrosRef);
            for (const regDoc of registrosSnap.docs) {
              const datos = regDoc.data();
              if (datos?.metas?.length > 0) {
                setMetas(datos.metas);
                datosEncontrados = true;
                break;
              }
            }
          }
        }

        // 2. Buscar libro
        const libroRef = collection(db, `users/${uid}/libro`);
        const libroSnap = await getDocs(libroRef);
        if (!libroSnap.empty) {
          const libroData = libroSnap.docs[0].data() as Libro;
          setLibro(libroData);
          datosEncontrados = true;
        }

        // 3. Buscar origamis completados
        const origamiRef = collection(db, `users/${uid}/origamisCompletados`);
        const origamiSnap = await getDocs(origamiRef);
        if (!origamiSnap.empty) {
          const lista: Origami[] = origamiSnap.docs.map((doc) => doc.data() as Origami);
          setOrigamis(lista);
          datosEncontrados = true;
        }

        if (!datosEncontrados) {
          setSinDatos(true);
        }

      } catch (error) {
        console.error("Error obteniendo datos:", error);
        setSinDatos(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  const renderTitulo = (titulo: string) => (
    <Text className="text-white text-xl font-bold mt-4 mb-2">{titulo}</Text>
  );

  const renderMetas = () => (
    <>
      {renderTitulo("Metas Nutricionales")}
      {metas.map((item, index) => (
        <View key={index} className="p-4 bg-green-800 rounded-lg mb-2">
          <Text className="text-white font-bold">{item.nombre}</Text>
          <Text className="text-white">Meta: {item.meta} {item.unidad}</Text>
          <Text className="text-white">Valor: {item.valor}</Text>
          <Text className="text-white">Porcentaje: {item.porcentaje}%</Text>
        </View>
      ))}
    </>
  );

  const renderLibro = () => (
    <>
      {renderTitulo("Lectura")}
      <View className="p-4 bg-blue-800 rounded-lg mb-2">
        <Text className="text-white font-bold">Libro: {libro?.titulo}</Text>
        <Text className="text-white">Páginas leídas: {libro?.diasLeidos?.[0]?.paginasLeidas}</Text>
      </View>
    </>
  );

  const renderOrigamis = () => (
    <>
      {renderTitulo("Origamis Completados")}
      {origamis.map((item, index) => (
        <View key={index} className="p-4 bg-purple-800 rounded-lg mb-2">
          <Text className="text-white font-bold">Origami: {item.nombreOrigami}</Text>
          <Text className="text-white">Dificultad: {item.dificultad}</Text>
          <Text className="text-white">Fecha: {new Date(item.fechaCompletado).toLocaleDateString()}</Text>
        </View>
      ))}
    </>
  );

  return (
    <View className="flex-1 bg-gray-900">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : sinDatos ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-white text-center">No hay datos suficientes para mostrar seguimiento.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          {metas.length > 0 && renderMetas()}
          {libro && renderLibro()}
          {origamis.length > 0 && renderOrigamis()}
        </ScrollView>
      )}
      <BottomNavBar />
    </View>
  );
}
