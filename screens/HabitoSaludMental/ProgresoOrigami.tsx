import React, { useState, useEffect } from 'react';
import {View,Text,TouchableOpacity,ScrollView,Image,ActivityIndicator
} from 'react-native';
import { auth, firestore } from '../../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const ProgresoOrigami = () => {
  const [loading, setLoading] = useState(true);
  const [origamisData, setOrigamisData] = useState({
    totalCompletados: 0,
    rachaActual: 0,
    ultimosOrigamis: [],
    estadisticasPorDificultad: {
      facil: 0,
      intermedio: 0,
      dificil: 0
    }
  });

  useEffect(() => {
    loadOrigamiProgress();
  }, []);

  const loadOrigamiProgress = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(firestore, 'users', user.uid, 'origamisCompletados'),
        orderBy('fechaCompletado', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const origamis = [];
      const estadisticasPorDificultad = { facil: 0, intermedio: 0, dificil: 0 };
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        origamis.push({
          id: doc.id,
          name: data.nombreOrigami,
          date: data.fechaCompletado,
          imageUrl: data.imageUrl,
          difficulty: data.dificultad
        });

        // Contar por dificultad
        const difficulty = data.dificultad.toLowerCase();
        if (difficulty.includes('fácil') || difficulty.includes('facil')) {
          estadisticasPorDificultad.facil++;
        } else if (difficulty.includes('intermedio')) {
          estadisticasPorDificultad.intermedio++;
        } else if (difficulty.includes('difícil') || difficulty.includes('dificil')) {
          estadisticasPorDificultad.dificil++;
        }
      });

      // Calcular racha actual
      const rachaActual = calculateCurrentStreak(origamis);

      setOrigamisData({
        totalCompletados: origamis.length,
        rachaActual,
        ultimosOrigamis: origamis.slice(0, 5), // Últimos 5 origamis
        estadisticasPorDificultad
      });

    } catch (error) {
      console.error('Error cargando progreso de origamis:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentStreak = (origamis) => {
    if (origamis.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const sortedOrigamis = [...origamis].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    // Agrupar por días
    const dayGroups = {};
    sortedOrigamis.forEach(origami => {
      const date = new Date(origami.date);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!dayGroups[dayKey]) {
        dayGroups[dayKey] = [];
      }
      dayGroups[dayKey].push(origami);
    });

    const sortedDays = Object.keys(dayGroups).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA;
    });

    // Calcular racha consecutiva
    let currentDate = new Date(today);
    for (let i = 0; i < sortedDays.length; i++) {
      const dayKey = sortedDays[i];
      const dayDate = new Date(dayKey);
      
      const daysDiff = Math.floor((currentDate - dayDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1 && (i === 0 || daysDiff === 0)) {
        streak++;
        currentDate = new Date(dayDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty.toLowerCase();
    if (diff.includes('fácil') || diff.includes('facil')) return 'bg-green-500';
    if (diff.includes('intermedio')) return 'bg-yellow-500';
    if (diff.includes('difícil') || diff.includes('dificil')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getDifficultyIcon = (difficulty) => {
    const diff = difficulty.toLowerCase();
    if (diff.includes('fácil') || diff.includes('facil')) return '🟢';
    if (diff.includes('intermedio')) return '🟡';
    if (diff.includes('difícil') || diff.includes('dificil')) return '🔴';
    return '⚪';
  };

  if (loading) {
    return (
      <View className="bg-orange-800 rounded-3xl p-6 mb-6 shadow-2xl border border-orange-700">
        <View className="items-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-white mt-2">Cargando progreso de origami...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-orange-800 rounded-3xl p-6 mb-6 shadow-2xl border border-orange-700">
      {/* Header */}
      <View className="items-center mb-6">
        <Text style={{ fontSize: 48 }}>🎨</Text>
        <Text className="text-white text-xl font-bold mt-2">Progreso de Origami</Text>
        <Text className="text-orange-200 text-sm">Arte en papel</Text>
      </View>

      {/* Estadísticas principales */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-orange-700 rounded-2xl p-4 flex-1 mr-2">
          <Text className="text-orange-200 text-sm">Total Completados</Text>
          <Text className="text-white text-2xl font-bold">{origamisData.totalCompletados}</Text>
        </View>
        <View className="bg-orange-700 rounded-2xl p-4 flex-1 ml-2">
          <Text className="text-orange-200 text-sm">Racha Actual</Text>
          <Text className="text-white text-2xl font-bold">{origamisData.rachaActual} días</Text>
        </View>
      </View>

      {/* Estadísticas por dificultad */}
      <View className="mb-6">
        <Text className="text-white text-lg font-bold mb-3">Por Dificultad</Text>
        <View className="flex-row justify-between">
          <View className="bg-green-600 rounded-xl p-3 flex-1 mr-1">
            <Text className="text-white text-xs">Fácil</Text>
            <Text className="text-white text-lg font-bold">{origamisData.estadisticasPorDificultad.facil}</Text>
          </View>
          <View className="bg-yellow-600 rounded-xl p-3 flex-1 mx-1">
            <Text className="text-white text-xs">Intermedio</Text>
            <Text className="text-white text-lg font-bold">{origamisData.estadisticasPorDificultad.intermedio}</Text>
          </View>
          <View className="bg-red-600 rounded-xl p-3 flex-1 ml-1">
            <Text className="text-white text-xs">Difícil</Text>
            <Text className="text-white text-lg font-bold">{origamisData.estadisticasPorDificultad.dificil}</Text>
          </View>
        </View>
      </View>

      {/* Últimos origamis completados */}
      {origamisData.ultimosOrigamis.length > 0 && (
        <View>
          <Text className="text-white text-lg font-bold mb-3">Últimos Completados</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {origamisData.ultimosOrigamis.map((origami, index) => (
              <View key={origami.id || index} className="bg-orange-700 rounded-xl p-3 mr-3 w-32">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white text-xs font-bold">{origami.name}</Text>
                  <Text className="text-xs">{getDifficultyIcon(origami.difficulty)}</Text>
                </View>
                
                {origami.imageUrl && (
                  <Image
                    source={{ uri: origami.imageUrl }}
                    className="w-full h-16 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                )}
                
                <Text className="text-orange-200 text-xs">
                  {new Date(origami.date).toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Mensaje motivacional */}
      <View className="bg-orange-700 rounded-2xl p-4 mt-4">
        <Text className="text-white text-sm text-center">
          {origamisData.totalCompletados === 0 
            ? "¡Comienza tu journey de origami! Cada pliegue cuenta." 
            : origamisData.rachaActual > 0 
              ? `¡Increíble! Llevas ${origamisData.rachaActual} días creando arte en papel.`
              : "¡Vuelve a crear! El arte del origami te espera."}
        </Text>
      </View>
    </View>
  );
};

export default ProgresoOrigami;