import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useReports } from 'hooks/useReports';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  location: string;
  images?: string[];
  createdAt: string;
  userName: string;
}

export default function BrowseScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'lost' | 'found' | null>(null);
  const { reports, loading, error } = useReports(selectedType ? { type: selectedType } : {});

  const renderReport = ({ item }: { item: Report }) => (
    <Pressable
      onPress={() => router.push(`/item-detail?id=${item.id}`)}
      className="bg-white rounded-lg overflow-hidden shadow-sm mb-3 border border-gray-100"
    >
      <View className="flex-row">
        {/* Image */}
        <View className="w-24 h-24 bg-gray-200">
          {item.images && item.images[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-100">
              <Ionicons name="image-outline" size={32} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 p-3 justify-between">
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <View
                className={`px-2 py-1 rounded-full ${
                  item.type === 'lost' ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    item.type === 'lost' ? 'text-red-700' : 'text-green-700'
                  }`}
                >
                  {item.type === 'lost' ? '🔍 Lost' : '📍 Found'}
                </Text>
              </View>
            </View>
            <Text className="font-semibold text-gray-900 text-sm">{item.title}</Text>
            <Text className="text-xs text-gray-600 mt-1">{item.location}</Text>
          </View>
          <Text className="text-xs text-gray-500">{item.userName}</Text>
        </View>

        <View className="px-3 justify-center">
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text className="mt-2 text-gray-600">Loading items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-2 text-red-600 font-semibold">Error loading items</Text>
        <Text className="text-gray-600 text-center mt-1">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Filter Buttons */}
      <View className="bg-white p-4 gap-2 border-b border-gray-200">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Filter by:</Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setSelectedType(null)}
            className={`flex-1 py-2 px-3 rounded-lg ${
              selectedType === null
                ? 'bg-teal-600'
                : 'bg-gray-100 border border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                selectedType === null ? 'text-white' : 'text-gray-700'
              }`}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSelectedType('lost')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              selectedType === 'lost'
                ? 'bg-red-600'
                : 'bg-gray-100 border border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                selectedType === 'lost' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Lost
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSelectedType('found')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              selectedType === 'found'
                ? 'bg-green-600'
                : 'bg-gray-100 border border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                selectedType === 'found' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Found
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Reports List */}
      {reports.length > 0 ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={{ padding: 12 }}
          ListFooterComponent={<View className="h-4" />}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="search-outline" size={48} color="#d1d5db" />
          <Text className="mt-4 text-lg font-semibold text-gray-700">No items found</Text>
          <Text className="text-gray-600 text-center mt-2">
            Try different filters or come back later
          </Text>
        </View>
      )}
    </View>
  );
}
