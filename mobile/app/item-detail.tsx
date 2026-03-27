import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/constants';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  location: string;
  images?: string[];
  createdAt: string;
  userName: string;
  userEmail: string;
  status: 'active' | 'resolved' | 'closed';
}

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/reports/${id}`);
        if (!response.ok) throw new Error('Failed to load item');

        const data = await response.json();
        setReport(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleContact = () => {
    if (!report) return;

    Alert.alert('Contact', `Email ${report.userName} at ${report.userEmail}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Email',
        onPress: () => {
          // In production, use Linking to open email client
          Alert.alert('Success', `Opening email to ${report.userEmail}`);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#14b8a6" />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-2 text-red-600 font-semibold">Error</Text>
        <Text className="text-gray-600 text-center mt-1">{error || 'Item not found'}</Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-4 py-2 bg-teal-600 rounded-lg">
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const hasImages = report.images && report.images.length > 0;

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Image Gallery */}
      {hasImages && (
        <View className="bg-gray-100 aspect-square">
          <Image
            source={{ uri: report.images![selectedImageIndex] }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {report.images!.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {report.images!.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === selectedImageIndex ? 'bg-white' : 'bg-gray-400'
                  }`}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View className="p-4">
        {/* Type Badge */}
        <View className="flex-row items-center gap-2 mb-3">
          <View
            className={`px-3 py-1 rounded-full ${
              report.type === 'lost' ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                report.type === 'lost' ? 'text-red-700' : 'text-green-700'
              }`}
            >
              {report.type === 'lost' ? '🔍 Lost Item' : '📍 Found Item'}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              report.status === 'active'
                ? 'bg-blue-100'
                : report.status === 'resolved'
                  ? 'bg-yellow-100'
                  : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                report.status === 'active'
                  ? 'text-blue-700'
                  : report.status === 'resolved'
                    ? 'text-yellow-700'
                    : 'text-gray-700'
              }`}
            >
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">{report.title}</Text>

        {/* Description */}
        <Text className="text-gray-700 leading-relaxed mb-4">{report.description}</Text>

        {/* Location */}
        <View className="bg-gray-50 p-3 rounded-lg mb-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="location" size={20} color="#14b8a6" />
            <View className="flex-1">
              <Text className="text-xs text-gray-600">Location</Text>
              <Text className="text-gray-900 font-semibold">{report.location}</Text>
            </View>
          </View>
        </View>

        {/* Reporter Info */}
        <View className="bg-gray-50 p-3 rounded-lg mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 bg-teal-600 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-lg">
                {report.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">{report.userName}</Text>
              <Text className="text-xs text-gray-600">{report.userEmail}</Text>
            </View>
          </View>
        </View>

        {/* Date */}
        <View className="flex-row items-center gap-2 mb-6">
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600">
            {new Date(report.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <Pressable
            onPress={handleContact}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 rounded-lg"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="mail" size={20} color="white" />
              <Text className="text-white font-semibold">Contact Poster</Text>
            </View>
          </Pressable>

          <Pressable className="border-2 border-gray-300 p-4 rounded-lg">
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="flag-outline" size={20} color="#6b7280" />
              <Text className="text-gray-700 font-semibold">Report This Item</Text>
            </View>
          </Pressable>
        </View>

        {/* Tips */}
        <View className="bg-blue-50 p-3 rounded-lg mt-6 mb-4 border border-blue-200">
          <Text className="text-xs text-blue-900 leading-relaxed">
            💡 <Text className="font-semibold">Safety Tip:</Text> Always verify the person's identity before handing over any items or sharing personal information.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
