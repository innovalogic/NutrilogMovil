import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { auth, firestore } from '../../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const ProgresoAudioInspira = () => {
  const [audioStats, setAudioStats] = useState({
    totalAudios: 0,
    audiosPorCategoria: {},
    audiosPorMood: {},
    ultimosAudios: [],
    tiempoTotalEscuchado: 0,
    rachaActual: 0
  });
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('resumen'); 

  useEffect(() => {
    cargarEstadisticasAudio();
  }, []);

  const cargarEstadisticasAudio = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // NUEVA ESTRUCTURA SIMPLIFICADA: users/{uid}/audios
      const audiosRef = collection(firestore, 'users', user.uid, 'audios');
      const audiosSnapshot = await getDocs(audiosRef);
      
      let totalAudios = audiosSnapshot.size;
      let audiosPorCategoria = {};
      let audiosPorMood = {};
      let todosLosAudios = [];
      let tiempoTotal = 0;

      // Procesar cada audio directamente
      audiosSnapshot.docs.forEach(doc => {
        const audioData = doc.data();
        
        // Contar por categoría
        const categoria = audioData.categoria || 'Sin categoría';
        audiosPorCategoria[categoria] = (audiosPorCategoria[categoria] || 0) + 1;
        
        // Contar por mood
        const mood = audioData.estadoAnimo || 'Sin clasificar';
        audiosPorMood[mood] = (audiosPorMood[mood] || 0) + 1;
        
        // Agregar a la lista de todos los audios
        todosLosAudios.push({
          id: doc.id,
          ...audioData
        });

        // Calcular tiempo total (convertir duración MM:SS a minutos)
        if (audioData.duracion) {
          const [minutos, segundos] = audioData.duracion.split(':').map(Number);
          tiempoTotal += minutos + (segundos / 60);
        }
      });

      // Ordenar audios por fecha más reciente
      const ultimosAudios = todosLosAudios
        .sort((a, b) => {
          // Usar timestamp si existe, sino escuchadoEn
          const fechaA = a.timestamp ? a.timestamp.toDate() : new Date(a.escuchadoEn);
          const fechaB = b.timestamp ? b.timestamp.toDate() : new Date(b.escuchadoEn);
          return fechaB - fechaA;
        })
        .slice(0, 5);

      // Calcular racha actual (días consecutivos con al menos un audio)
      const rachaActual = calcularRachaConsecutiva(todosLosAudios);

      setAudioStats({
        totalAudios,
        audiosPorCategoria,
        audiosPorMood,
        ultimosAudios,
        tiempoTotalEscuchado: Math.round(tiempoTotal),
        rachaActual
      });
    } catch (error) {
      console.error('Error al cargar estadísticas de audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularRachaConsecutiva = (audios) => {
    if (audios.length === 0) return 0;

    // Extraer fechas únicas de los audios
    const fechas = [...new Set(audios.map(audio => {
      const fecha = audio.timestamp ? audio.timestamp.toDate() : new Date(audio.escuchadoEn);
      return fecha.toDateString();
    }))].sort((a, b) => new Date(b) - new Date(a));

    let racha = 0;
    
    for (let i = 0; i < fechas.length; i++) {
      const fechaAudio = new Date(fechas[i]);
      const fechaEsperada = new Date();
      fechaEsperada.setDate(fechaEsperada.getDate() - i);
      
      if (fechaAudio.toDateString() === fechaEsperada.toDateString()) {
        racha++;
      } else {
        break;
      }
    }
    return racha;
  };

  const formatearFecha = (audio) => {
    let fecha;
    if (audio.timestamp) {
      fecha = audio.timestamp.toDate();
    } else {
      fecha = new Date(audio.escuchadoEn);
    }
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatearHora = (audio) => {
    let fecha;
    if (audio.timestamp) {
      fecha = audio.timestamp.toDate();
    } else {
      fecha = new Date(audio.escuchadoEn);
    }
    
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
        <Text className="text-white text-xl font-bold">🎵 Audio Inspira</Text>
        <Text className="text-gray-400 mt-2">Cargando estadísticas...</Text>
      </View>
    );
  }

  const renderResumen = () => (
    <View>
      <View className="flex-row justify-between mb-4">
        <View className="bg-purple-700 rounded-2xl p-4 flex-1 mr-2">
          <Text className="text-white text-2xl font-bold">{audioStats.totalAudios}</Text>
          <Text className="text-purple-200 text-sm">Audios Escuchados</Text>
        </View>
        <View className="bg-blue-700 rounded-2xl p-4 flex-1 ml-2">
          <Text className="text-white text-2xl font-bold">{audioStats.tiempoTotalEscuchado}</Text>
          <Text className="text-blue-200 text-sm">Minutos Totales</Text>
        </View>
      </View>
      
      <View className="bg-green-700 rounded-2xl p-4 mb-4">
        <Text className="text-white text-2xl font-bold text-center">{audioStats.rachaActual}</Text>
        <Text className="text-green-200 text-sm text-center">
          {audioStats.rachaActual === 1 ? 'Día consecutivo' : 'Días consecutivos'}
        </Text>
      </View>

      {audioStats.ultimosAudios.length > 0 && (
        <View>
          <Text className="text-white text-lg font-bold mb-2">🎧 Último Audio</Text>
          <View className="bg-gray-700 rounded-2xl p-4">
            <Text className="text-white font-semibold">{audioStats.ultimosAudios[0].titulo}</Text>
            <Text className="text-gray-300 text-sm">{audioStats.ultimosAudios[0].estadoAnimo} • {audioStats.ultimosAudios[0].categoria}</Text>
            <Text className="text-gray-400 text-xs mt-1">
              {formatearFecha(audioStats.ultimosAudios[0])} a las {formatearHora(audioStats.ultimosAudios[0])}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderCategorias = () => (
    <View>
      <Text className="text-white text-lg font-bold mb-4">📊 Por Categoría</Text>
      {Object.entries(audioStats.audiosPorCategoria).map(([categoria, cantidad]) => (
        <View key={categoria} className="bg-gray-700 rounded-2xl p-4 mb-2 flex-row justify-between">
          <Text className="text-white font-semibold">{categoria}</Text>
          <Text className="text-gray-300">{cantidad} {cantidad === 1 ? 'audio' : 'audios'}</Text>
        </View>
      ))}
    </View>
  );

  const renderMoods = () => (
    <View>
      <Text className="text-white text-lg font-bold mb-4">😊 Por Estado de Ánimo</Text>
      {Object.entries(audioStats.audiosPorMood).map(([mood, cantidad]) => (
        <View key={mood} className="bg-gray-700 rounded-2xl p-4 mb-2 flex-row justify-between">
          <Text className="text-white font-semibold">{mood}</Text>
          <Text className="text-gray-300">{cantidad} {cantidad === 1 ? 'vez' : 'veces'}</Text>
        </View>
      ))}
    </View>
  );

  const renderRecientes = () => (
    <View>
      <Text className="text-white text-lg font-bold mb-4">🕐 Audios Recientes</Text>
      {audioStats.ultimosAudios.map((audio, index) => (
        <View key={index} className="bg-gray-700 rounded-2xl p-4 mb-2">
          <Text className="text-white font-semibold">{audio.titulo}</Text>
          <Text className="text-gray-300 text-sm">{audio.estadoAnimo} • {audio.categoria}</Text>
          <Text className="text-gray-400 text-xs mt-1">
            {formatearFecha(audio)} a las {formatearHora(audio)}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-xl font-bold">🎵 Audio Inspira</Text>
        {audioStats.totalAudios > 0 && (
          <View className="bg-green-600 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-bold">{audioStats.totalAudios} total</Text>
          </View>
        )}
      </View>

      {audioStats.totalAudios === 0 ? (
        <View className="items-center py-4">
          <Text style={{ fontSize: 48 }}>🎧</Text>
          <Text className="text-gray-400 text-center text-base mt-2">
            Aún no has escuchado ningún audio. ¡Comienza tu viaje de bienestar!
          </Text>
        </View>
      ) : (
        <View>
          {/* Navegación de tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {[
              { key: 'resumen', label: 'Resumen' },
              { key: 'categorias', label: 'Categorías' },
              { key: 'moods', label: 'Estados' },
              { key: 'recientes', label: 'Recientes' }
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setVistaActual(tab.key)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  vistaActual === tab.key ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <Text className="text-white text-sm">{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Contenido según la vista actual */}
          {vistaActual === 'resumen' && renderResumen()}
          {vistaActual === 'categorias' && renderCategorias()}
          {vistaActual === 'moods' && renderMoods()}
          {vistaActual === 'recientes' && renderRecientes()}
        </View>
      )}
    </View>
  );
};

export default ProgresoAudioInspira;