import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Image, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';

const audioList = [
  {
    id: 1,
    title: 'Olas del Mar',
    format: 'mp3',
    duration: '2:45',
    image: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748463178/cld-sample-3.jpg',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'Sonido de olas para ayudarte a calmar la mente y reducir el estrés.',
    category: 'Ansiedad',
  },
  {
    id: 2,
    title: 'Bosque Relajante',
    format: 'mp3',
    duration: '3:20',
    image: 'https://cdn.pixabay.com/photo/2017/03/27/14/56/forest-2179231_1280.jpg',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'Ambiente relajante de bosque para dormir o meditar profundamente.',
    category: 'Estrés',
  },
  {
    id: 3,
    title: 'Pájaros Cantando',
    format: 'mp3',
    duration: '2:10',
    image: 'https://cdn.pixabay.com/photo/2020/01/14/20/07/bird-4764167_1280.jpg',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    description: 'Melodías de aves para levantar el ánimo y sentir paz interior.',
    category: 'Felicidad',
  },
  {
    id: 4,
    title: 'Inspiración Matutina',
    format: 'mp3',
    duration: '4:00',
    image: 'https://cdn.pixabay.com/photo/2020/04/16/18/45/coffee-5052441_1280.jpg',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    description: 'Audio motivacional para comenzar tu día con energía positiva.',
    category: 'Motivación',
  },
  {
    id: 5,
    title: 'Lluvia Suave',
    format: 'mp3',
    duration: '3:45',
    image: 'https://cdn.pixabay.com/photo/2017/08/01/08/29/rain-2565260_1280.jpg',
    file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    description: 'Gotas de lluvia para liberar tensiones y conectar con la melancolía.',
    category: 'Tristeza',
  },
];

export default function AudioInspira({ navigation }) {
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

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
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }}>
      {selectedAudio ? (
        <View className="flex-1 justify-center items-center bg-black p-4">
          <TouchableOpacity onPress={handleBack} className="absolute top-10 left-4">
            <AntDesign name="arrowleft" size={30} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl mb-2">{selectedAudio.title}</Text>
          <Text className="text-gray-300 text-base mb-4 italic">{selectedAudio.category}</Text>
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
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <View className="bg-black items-center pb-6">
            <Text className="text-white text-3xl font-mono mt-8">Audio Inspira</Text>
            <Image
              source={{ uri: 'https://cdn.pixabay.com/photo/2021/02/07/19/21/meditation-5991526_1280.png' }}
              className="rounded-2xl w-48 h-48 mt-4"
            />
          </View>

          {audioList.map(audio => (
            <TouchableOpacity
              key={audio.id}
              onPress={() => handlePlayAudio(audio)}
              className="flex-row bg-gray-100 m-4 p-3 rounded-xl items-center shadow-md"
            >
              <Image source={{ uri: audio.image }} className="w-16 h-16 rounded-md" />
              <View className="flex-1 ml-4">
                <Text className="text-lg font-semibold">{audio.title}</Text>
                <Text className="text-gray-600">{audio.format.toUpperCase()} - {audio.category}</Text>
                <Text className="text-gray-500">{audio.duration}</Text>
              </View>
              <AntDesign name="right" size={24} color="gray" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
