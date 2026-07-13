import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DatabaseController } from '../data/controllers';
import { setLatestDataForTournament } from '../utils/tournamentUtils';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export const HomeScreen = ({ navigation }: Props) => {
  const [tournaments, setTournaments] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      DatabaseController.getInstance()
        .loadTournaments()
        .then(loaded => {
          setTournaments(loaded);
          if (loaded[0]) {
            setLatestDataForTournament(loaded[0].id);
          }
        });
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ChessTourney</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>

      <ScrollView style={styles.section}>
        <Text style={styles.sectionTitle}>Tournaments</Text>
        {tournaments.map(tournament => {
          const endTime = tournament.startTime + tournament.duration;
          const isOngoing = Date.now() < endTime;

          return (
            <TouchableOpacity
              key={tournament.id}
              style={styles.tournamentCard}
              onPress={() =>
                isOngoing
                  ? navigation.navigate('OngoingTournament', {
                      tournamentId: tournament.id,
                    })
                  : navigation.navigate('FinishedTournament', {
                      tournamentId: tournament.id,
                    })
              }
            >
              <Text style={styles.tournamentText}>
                Start: {new Date(tournament.startTime).toLocaleString()}
              </Text>
              <Text style={styles.tournamentText}>
                End: {new Date(endTime).toLocaleString()}
              </Text>
              <Text style={styles.tournamentText}>
                Players: {tournament.players.join(', ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    width: '100%',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  tournamentCard: {
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  tournamentText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 2,
  },
});
