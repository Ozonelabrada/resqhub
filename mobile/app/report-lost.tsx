import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function ReportLostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !location) {
      Alert.alert('Required', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      // TODO: Submit to API
      Alert.alert('Success', 'Lost item reported successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 space-y-4">
        {/* Form Fields */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Item Title</Text>
          <TextInput
            placeholder="e.g., Blue Backpack"
            value={title}
            onChangeText={setTitle}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base"
            editable={!loading}
          />
        </View>

        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
          <TextInput
            placeholder="Describe the item in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base"
            editable={!loading}
          />
        </View>

        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Last Seen Location</Text>
          <TextInput
            placeholder="Street, City, Area"
            value={location}
            onChangeText={setLocation}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base"
            editable={!loading}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className={`
            p-4 rounded-lg items-center justify-center
            ${loading ? 'bg-gray-300' : 'bg-gradient-to-r from-teal-600 to-emerald-600'}
          `}
        >
          <View className="flex-row items-center gap-2">
            {loading ? (
              <>
                <Text className="text-white font-semibold">Submitting...</Text>
              </>
            ) : (
              <>
                <Ionicons name="send" size={20} color="white" />
                <Text className="text-white font-semibold">Report Lost Item</Text>
              </>
            )}
          </View>
        </Pressable>

        {/* Info Box */}
        <View className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
          <Text className="text-sm text-blue-900">
            💡 <Text className="font-semibold">Tip:</Text> Include specific details like color, size, and any distinguishing marks to help others identify your item.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
