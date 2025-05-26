import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';

interface UserData {
  weightGoal?: number;
}

interface BajarDePesoProps {
  userData: UserData | null;
}

const BajarDePeso: React.FC<BajarDePesoProps> = ({ userData }) => {
  return (
    <View className="bg-gray-800 rounded-2xl shadow-lg p-6">
      <Text className="text-white text-xl font-semibold mb-4">
        Configuración de Meta
      </Text>
      {/* Aquí irá el contenido del componente */}
    </View>
  );
};

export default BajarDePeso; 