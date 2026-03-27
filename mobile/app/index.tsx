import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';

export default function HomeScreen() {
  const [reportType, setReportType] = useState<'lost' | 'found' | null>(null);

  return (
    <ScrollView className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <Text className="text-4xl font-bold text-white mb-2">FindrHub</Text>
        <Text className="text-lg text-white/70">Reuniting Communities</Text>
      </View>

      {/* Action Buttons */}
      <View className="px-6 gap-4 pb-8">
        <Pressable
          onPress={() => setReportType('lost')}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 active:opacity-80"
        >
          <Text className="text-xl font-bold text-white text-center">📍 Report Lost Item</Text>
        </Pressable>

        <Pressable
          onPress={() => setReportType('found')}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 active:opacity-80"
        >
          <Text className="text-xl font-bold text-white text-center">🎯 Report Found Item</Text>
        </Pressable>

        <Pressable className="bg-gradient-to-r from-teal-700 to-emerald-700 rounded-xl p-6 active:opacity-80">
          <Text className="text-xl font-bold text-white text-center">🔍 Browse Items</Text>
        </Pressable>
      </View>

      {/* Feature Info */}
      <View className="px-6 pb-8">
        <Text className="text-white/60 text-center text-sm">
          Download for free and help your community find lost items
        </Text>
      </View>
    </ScrollView>
  );
}
