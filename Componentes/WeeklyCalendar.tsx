import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

interface WeeklyCalendarProps {
  meals: string[];
}

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function WeeklyCalendar({ meals }: WeeklyCalendarProps) {
  // Rotate meals to cover all 7 days if there are fewer meals
  const assignedMeals = daysOfWeek.map((_, index) => meals[index % meals.length]);

  return (
    <View className="mb-6">
      <Text className="text-white text-lg font-semibold mb-4">Plan Semanal de Desayunos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {daysOfWeek.map((day, index) => (
          <View
            key={day}
            className="bg-gray-700 rounded-lg p-4 mr-3 w-40"
            style={{ minHeight: 120 }}
          >
            <Text className="text-white font-semibold mb-2">{day}</Text>
            <Text className="text-white text-sm">{assignedMeals[index]}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}