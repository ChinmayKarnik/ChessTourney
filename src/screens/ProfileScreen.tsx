import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DatabaseController, LichessController } from '../data/controllers';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

export const ProfileScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [draftUsername, setDraftUsername] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    DatabaseController.getInstance()
      .loadUsername()
      .then(stored => {
        if (stored) {
          setUsername(stored);
          setIsEditing(false);
        }
      });
  }, []);

  const handleSave = async () => {
    const trimmed = draftUsername.trim();
    if (!trimmed) {
      setError('Enter a username');
      return;
    }

    setError('');
    setIsChecking(true);
    const exists = await LichessController.getInstance().checkUsernameExists(
      trimmed,
    );
    setIsChecking(false);

    if (!exists) {
      setError('No Lichess account found with this username');
      return;
    }

    await DatabaseController.getInstance().setUsername(trimmed);
    setUsername(trimmed);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setDraftUsername(username);
    setError('');
    setIsEditing(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Lichess username"
            value={draftUsername}
            onChangeText={setDraftUsername}
            autoCapitalize="none"
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            disabled={isChecking}
          >
            <Text style={styles.buttonText}>
              {isChecking ? 'Checking...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.username}>{username}</Text>
          <TouchableOpacity style={styles.button} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit Username</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, styles.backButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#8e8e93',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
