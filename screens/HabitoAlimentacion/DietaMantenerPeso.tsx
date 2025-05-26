import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import BottomNavBar from 'Componentes/BottomNavBar';

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
  { nombre: 'Comida', valor: 0 },
  { nombre: 'Calorías', valor: 0 },
  { nombre: 'Proteínas (g)', valor: 0 },
  { nombre: 'Grasas (g)', valor: 0 },
  { nombre: 'Carbohidratos (g)', valor: 0 },
  { nombre: 'Agua (mL)', valor: 0 },
];

const DietaMantenerPeso: React.FC = () => {
  const [metasDiarias, setMetasDiarias] = useState<MetaDiaria[]>(metasIniciales);
  const [registroAlimentos, setRegistroAlimentos] = useState<RegistroAlimento[]>(registrosIniciales);

  const incrementar = (
  arraySetter: React.Dispatch<React.SetStateAction<any[]>>,
  index: number
) => {
  arraySetter((prev) =>
    prev.map((item, i) =>
      i === index ? { ...item, valor: item.valor + 50 } : item
    )
  );
};

const decrementar = (
  arraySetter: React.Dispatch<React.SetStateAction<any[]>>,
  index: number
) => {
  arraySetter((prev) =>
    prev.map((item, i) =>
      i === index && item.valor >= 50 ? { ...item, valor: item.valor - 50 } : item
    )
  );
};

  // Actualiza las metas en función de los registros
  useEffect(() => {
    setMetasDiarias((prev) =>
      prev.map((meta) => {
        const registro = registroAlimentos.find((r) => r.nombre === meta.nombre);
        return registro ? { ...meta, valor: registro.valor } : meta;
      })
    );
  }, [registroAlimentos]);

  const todasCompletas = metasDiarias.every((m) => m.valor >= m.meta);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="px-6 pt-8 mb-0">
        <Text className="text-center text-xl font-bold text-black mb-4 mt-4">
          Seguimiento de Dieta Para Mantener el Peso 
        </Text>

        <Text className="text-lg font-semibold text-black mb-2">Metas Diarias</Text>
        {metasDiarias.map((item, index) => {
          const progreso = Math.min((item.valor / item.meta) * 100, 100);

          return (
            <View key={index} className="mb-4">
              <Text className="text-black font-medium">{item.nombre}</Text>
              <Text className="text-gray-500 mb-1">
                {item.valor}/{item.meta} {item.unidad}
              </Text>
              <View className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <View
                  style={{ width: `${progreso}%` }}
                  className={`h-full rounded-full ${progreso >= 100 ? 'bg-green-500' : 'bg-orange-400'}`}
                />
              </View>
            </View>
          );
        })}

        <Text className="text-lg font-semibold text-black mt-4 mb-2">
          Registrar Alimentos
        </Text>
        {registroAlimentos.map((item, index) => (
          <View key={index} className="mb-3">
            <Text className="text-black font-medium">{item.nombre}</Text>
            <View className="flex-row items-center justify-between bg-gray-100 rounded-full px-4 py-2">
              <TouchableOpacity onPress={() => decrementar(setRegistroAlimentos, index)}>
                <Text className="text-xl">-</Text>
              </TouchableOpacity>
              <Text className="text-lg">{item.valor}</Text>
              <TouchableOpacity onPress={() => incrementar(setRegistroAlimentos, index)}>
                <Text className="text-xl">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {todasCompletas && (
          <TouchableOpacity className="bg-green-500 py-3 rounded-full mt-6 mb-8">
            <Text className="text-white text-center font-bold text-lg">Finalizar Día</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNavBar />
    </View>
  );
};

export default DietaMantenerPeso;
