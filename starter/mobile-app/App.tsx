import { Text, View, Pressable } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0a0a0b' }}>
      <Text style={{ color: '#818cf8', fontWeight: '700', marginBottom: 12 }}>DesignOS Mobile Starter</Text>
      <Text style={{ color: '#fafafa', fontSize: 34, fontWeight: '800', lineHeight: 40 }}>
        First value before configuration.
      </Text>
      <Text style={{ color: '#d4d4d8', fontSize: 17, lineHeight: 26, marginTop: 16 }}>
        Replace this with a platform-native onboarding flow, permission timing, and offline recovery.
      </Text>
      <Pressable accessibilityRole="button" style={{ marginTop: 24, minHeight: 48, borderRadius: 12, backgroundColor: '#818cf8', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#101018', fontWeight: '800' }}>Start</Text>
      </Pressable>
    </View>
  );
}
