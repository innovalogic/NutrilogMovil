import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Image, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import { auth, firestore } from '../../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

const audioList = [
  {
    id: 1,
    title: 'Olas del Mar',
    format: 'mp3',
    duration: '2:45',
    image: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748562941/brave_PMl2BfXpjq_qsekrv.png',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'Sonido de olas para ayudarte a calmar la mente y reducir el estrés.',
    category: 'Ansiedad',
    mood: 'Calma'
  },
  {
    id: 2,
    title: 'Bosque Relajante',
    format: 'mp3',
    duration: '3:20',
    image: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748562941/brave_dmLTEsfzvI_wyrnhc.png',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'Ambiente relajante de bosque para dormir o meditar profundamente.',
    category: 'Estrés',
    mood: 'Relajación'
  },
  {
    id: 3,
    title: 'Pájaros Cantando',
    format: 'mp3',
    duration: '2:10',
    image: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748562941/brave_x0sRwOxoCj_tdhqme.png',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    description: 'Melodías de aves para levantar el ánimo y sentir paz interior.',
    category: 'Felicidad',
    mood: 'Alegría'
  },
  {
    id: 4,
    title: 'Inspiración Matutina',
    format: 'mp3',
    duration: '4:00',
    image: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748562941/brave_lyO68QnVwu_qnkclt.png',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    description: 'Audio motivacional para comenzar tu día con energía positiva.',
    category: 'Motivación',
    mood: 'Energía'
  },
  {
    id: 5,
    title: 'Lluvia Suave',
    format: 'mp3',
    duration: '3:45',
    image: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748562941/brave_eF4NtKd3Iz_kfqhea.png',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    description: 'Gotas de lluvia para liberar tensiones y conectar con la melancolía.',
    category: 'Tristeza',
    mood: 'Melancolía'
  },
  {
    id: 6,
    title: 'Meditación Guiada',
    format: 'mp3',
    duration: '10:00',
    image: 'https://example.com/meditation.jpg',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    description: 'Meditación guiada para encontrar paz interior.',
    category: 'Meditación',
    mood: 'Paz'
  },
  {
    id: 7,
    title: 'Enfoque Profundo',
    format: 'mp3',
    duration: '45:00',
    image: 'https://example.com/focus.jpg',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    description: 'Sonidos para mejorar la concentración y productividad.',
    category: 'Productividad',
    mood: 'Concentración'
  }
];

// Extraemos todos los estados de ánimo únicos de la lista de audios
const allMoods = [...new Set(audioList.map(audio => audio.mood))];

export default function AudioInspira({ navigation }) {
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [filteredAudios, setFilteredAudios] = useState(audioList);

  // Filtra los audios según el estado de ánimo seleccionado
  useEffect(() => {
    if (selectedMood) {
      setFilteredAudios(audioList.filter(audio => audio.mood === selectedMood));
    } else {
      setFilteredAudios(audioList);
    }
  }, [selectedMood]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (sound) {
          sound.unloadAsync();
          setSound(null);
          setIsPlaying(false);
        }
      };
    }, [sound])
  );

  useEffect(() => {
    let interval;
    if (sound && isPlaying) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  const handlePlayAudio = async (audio) => {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync({ uri: audio.file });
    setSound(newSound);
    await newSound.playAsync();
    setSelectedAudio(audio);
    setIsPlaying(true);

    // ESTRUCTURA SIMPLIFICADA - Solo dos niveles:
    // users/{uid}/audios/{autoID}
    const user = auth.currentUser;
    if (user) {
      try {
        // Opción 1: Usar addDoc para generar ID automático
        const audiosRef = collection(firestore, 'users', user.uid, 'audios');
        await addDoc(audiosRef, {
          audioId: audio.id,
          titulo: audio.title,
          categoria: audio.category,
          estadoAnimo: audio.mood,
          descripcion: audio.description,
          duracion: audio.duration,
          escuchadoEn: new Date().toISOString(),
          timestamp: new Date()
        });

        // Opción 2: Usar setDoc con ID específico (descomenta si prefieres esta opción)
        /*
        const audioDocRef = doc(firestore, 'users', user.uid, 'audios', `${audio.id}_${Date.now()}`);
        await setDoc(audioDocRef, {
          audioId: audio.id,
          titulo: audio.title,
          categoria: audio.category,
          estadoAnimo: audio.mood,
          descripcion: audio.description,
          duracion: audio.duration,
          escuchadoEn: new Date().toISOString(),
          timestamp: new Date()
        });
        */

        console.log('Audio guardado exitosamente');
      } catch (error) {
        console.error('Error al guardar audio:', error);
      }
    }
  };

  const handlePause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const handleResume = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const handleSeek = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const handleBack = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    setSelectedAudio(null);
    setSound(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(1);
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: 'white',
      }}
    >
      {selectedAudio ? (
        <View className="flex-1 justify-center items-center bg-black p-4">
          <TouchableOpacity onPress={handleBack} className="absolute top-10 left-4">
            <AntDesign name="arrowleft" size={30} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl mb-2">{selectedAudio.title}</Text>
          <Text className="text-gray-300 text-base mb-4 italic">{selectedAudio.mood}</Text>
          <Image source={{ uri: selectedAudio.image }} className="w-64 h-64 rounded-xl mb-4" />
          <Text className="text-white text-center px-4 mb-6">{selectedAudio.description}</Text>

          <Slider
            style={{ width: '90%', height: 40 }}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#90cdf4"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#fff"
            onSlidingComplete={handleSeek}
          />
          <View className="flex-row justify-between w-11/12 mb-4">
            <Text className="text-white">{formatTime(position)}</Text>
            <Text className="text-white">{formatTime(duration)}</Text>
          </View>

          {isPlaying ? (
            <TouchableOpacity onPress={handlePause} className="bg-white px-6 py-3 rounded-full">
              <Text className="text-black text-lg">Pausar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleResume} className="bg-white px-6 py-3 rounded-full">
              <Text className="text-black text-lg">Reproducir</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="bg-black">
          <View className="items-center pb-6">
            <Text className="text-white text-3xl font-mono mt-8">Audio Inspira</Text>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748562419/menuAudio_dprp9w.png' }}
              className="rounded-2xl w-48 h-48 mt-4"
            />
            
            {/* Filtro por estado de ánimo */}
            <View className="w-full px-4 mb-4">
              <Text className="text-white text-lg mb-2">Selecciona tu estado de ánimo:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <TouchableOpacity
                  onPress={() => setSelectedMood(null)}
                  className={`px-4 py-2 rounded-full mr-2 ${!selectedMood ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  <Text className="text-white">Todos</Text>
                </TouchableOpacity>
                
                {allMoods.map((mood, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedMood(mood)}
                    className={`px-4 py-2 rounded-full mr-2 ${selectedMood === mood ? 'bg-blue-500' : 'bg-gray-700'}`}
                  >
                    <Text className="text-white">{mood}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {selectedMood && (
                <Text className="text-white text-center mb-2">
                  Mostrando audios para: <Text className="font-bold">{selectedMood}</Text>
                </Text>
              )}
            </View>
          </View>

          {filteredAudios.map(audio => (
            <TouchableOpacity
              key={audio.id}
              onPress={() => handlePlayAudio(audio)}
              className="flex-row bg-[#202938] m-4 p-3 rounded-xl items-center shadow-md"
            >
              <Image source={{ uri: audio.image }} className="w-16 h-16 rounded-md" />
              <View className="flex-1 ml-4">
                <Text className="text-white text-lg font-semibold">{audio.title}</Text>
                <Text className="text-gray-300">{audio.mood} - {audio.category}</Text>
                <Text className="text-gray-400">{audio.duration}</Text>
              </View>
              <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}