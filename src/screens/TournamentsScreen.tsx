import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DatabaseController } from '../data/controllers';
import { setLatestDataForTournament } from '../utils/tournamentUtils';

type TournamentsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Tournaments'
>;

type Props = {
  navigation: TournamentsScreenNavigationProp;
};

export const TournamentsScreen = ({ navigation }: Props) => {
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Tournaments</Text>

      <ScrollView style={styles.section}>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  section: {
    marginTop: 4,
    width: '100%',
    paddingHorizontal: 16,
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
