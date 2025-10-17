import { Image, StyleSheet, Platform, Text, View, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://reactjs.org/logo-og.png' }}
          style={styles.reactLogo}
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome!</Text>
      </View>

      <View style={styles.stepContainer}>
        <Text style={styles.subtitle}>Step 1: Try it</Text>
        <Text style={styles.text}>
          Edit <Text style={styles.bold}>app/(tabs)/index.tsx</Text> to see changes.
          Press{' '}
          <Text style={styles.bold}>
            {Platform.select({ ios: 'cmd + d', android: 'cmd + m' })}
          </Text>{' '}
          to open developer tools.
        </Text>
      </View>

      <View style={styles.stepContainer}>
        <Text style={styles.subtitle}>Step 2: Explore</Text>
        <Text style={styles.text}>
          Tap the Explore tab to learn more about what's included in this starter app.
        </Text>
      </View>

      <View style={styles.stepContainer}>
        <Text style={styles.subtitle}>Step 3: Get a fresh start</Text>
        <Text style={styles.text}>
          When you're ready, run{' '}
          <Text style={styles.bold}>npm run reset-project</Text> to get a fresh{' '}
          <Text style={styles.bold}>app</Text> directory.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 200,
    backgroundColor: '#A1CEDC',
    overflow: 'hidden',
    position: 'relative',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  titleContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  stepContainer: {
    padding: 20,
    gap: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});