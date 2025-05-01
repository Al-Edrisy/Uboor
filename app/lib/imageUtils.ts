import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Alert } from 'react-native';

export const pickAndCompressImage = async (options: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxWidth?: number;
}) => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos to upload images');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing,
      aspect: options.aspect,
      quality: options.quality || 0.7,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return null;

    const compressed = await manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: options.maxWidth || 800 } }],
      { compress: options.quality || 0.7, format: SaveFormat.JPEG }
    );

    return compressed.uri;
  } catch (error) {
    console.error('Image processing error:', error);
    Alert.alert('Error', 'Failed to process image. Please try again.');
    return null;
  }
};