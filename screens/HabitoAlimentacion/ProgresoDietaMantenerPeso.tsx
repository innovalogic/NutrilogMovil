import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { BarChart } from 'react-native-gifted-charts';
import moment from 'moment';

type BarData = {
  value: number;
  label: string;
  frontColor: string;
  topLabelComponent?: () => JSX.Element;
};

export default function ProgresoDietaMantenerPeso() {
  const [barData, setBarData] = useState<BarData[]>([]);
  const [rachaRegistro, setRachaRegistro] = useState<number>(0);
  const [rachaCumplida, setRachaCumplida] = useState<number>(0);

  useEffect(() => {
    const fetchDatos = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const habitosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosAlimenticios');
        const q = query(habitosRef, where('habitoSeleccionado', '==', 'Dieta Para Mantener el Peso'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const habitoId = snapshot.docs[0].id;
        const registrosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosAlimenticios', habitoId, 'registro');
        const registrosSnap = await getDocs(registrosRef);

        const registros = registrosSnap.docs
          .map(doc => doc.data())
          .filter((r: any) => r.timestamp && r.metas)
          .sort((a: any, b: any) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime());

        const datos: BarData[] = [];
        let tmpRacha1 = 0, tmpRacha2 = 0;
        let maxRacha1 = 0, maxRacha2 = 0;

        for (const registro of registros) {
          const fecha = registro.timestamp.toDate();
          const metas = registro.metas;

          const promedio = metas.reduce((acc: number, meta: any) => acc + meta.porcentaje, 0) / metas.length;
          const cumplido = metas.every((m: any) => m.porcentaje >= 100);

          let color = '#FACC15'; // amarillo por defecto
          if (promedio >= 90) color = '#22c55e'; // verde
          else if (promedio <= 40) color = '#EF4444'; // rojo

          datos.push({
            value: parseFloat(promedio.toFixed(2)),
            label: moment(fecha).format('dd D'),
            frontColor: color,
            topLabelComponent: () => (
              <View style={{ marginBottom: -24 }}>
                <Text style={{ color: 'Black', fontSize: 12 }}>{parseFloat(promedio.toFixed(1))}%</Text>
              </View>
            ),
          });

          tmpRacha1++;
          maxRacha1 = Math.max(maxRacha1, tmpRacha1);

          if (cumplido) {
            tmpRacha2++;
            maxRacha2 = Math.max(maxRacha2, tmpRacha2);
          } else {
            tmpRacha2 = 0;
          }
        }

        setBarData(datos);
        setRachaRegistro(maxRacha1);
        setRachaCumplida(maxRacha2);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };

    fetchDatos();
  }, []);

  return (
    <View className="bg-gray-800 rounded-2xl p-4 mb-6 mx-0">
      <Text className="text-white text-lg font-bold mb-4">📊 Seguimiento para mantener Peso</Text>

      {barData.length > 0 ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={barData}
              barWidth={40}
              spacing={25}
              roundedTop
              showGradient
              noOfSections={4}
              stepValue={25}
              maxValue={100}
              initialSpacing={20}
              xAxisLabelTextStyle={{ color: '#FFF', fontSize: 12 }}
              yAxisTextStyle={{ color: '#FFF', fontSize: 12 }}
              isAnimated
              yAxisColor="#CCC"
              xAxisColor="#CCC"
              rulesColor="#4B5563"
              showLine
            />
          </ScrollView>

          <View className="mt-4 space-y-1">
            <Text className="text-blue-400 text-sm">
              🔁 Racha de días con registro: <Text className="font-bold">{rachaRegistro}</Text>
            </Text>
            <Text className="text-green-400 text-sm">
              ✅ Racha cumpliendo metas al 100%: <Text className="font-bold">{rachaCumplida}</Text>
            </Text>
          </View>

          <View className="mt-4 bg-gray-700 rounded-xl px-4 py-2">
            <Text className="text-white font-bold mb-2">🎨 Leyenda:</Text>
            <Text className="text-yellow-300 text-sm">🟨 Promedio entre 40% y 90%</Text>
            <Text className="text-green-400 text-sm">🟩 Promedio ≥ 90% (meta cumplida)</Text>
            <Text className="text-red-400 text-sm">🟥 Promedio ≤ 40% (muy bajo)</Text>
          </View>
        </>
      ) : (
        <Text className="text-gray-300">Aún no tienes datos registrados para este hábito.</Text>
      )}
    </View>
  );
}
