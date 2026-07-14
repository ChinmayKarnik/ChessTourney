import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DatabaseController } from '../data/controllers';
import { toTimestamp } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTournament'>;

const now = new Date(Date.now());

export const CreateTournamentScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('BlindFork Arena');
  const [initTimeMinutes, setInitTimeMinutes] = useState('3');
  const [incrementSeconds, setIncrementSeconds] = useState('1');
  const [players, setPlayers] = useState<string[]>([
    'BlindFork',
    'HarshB20000',
    'kkr19',
    'rajjayavant',
  ]);
  const [newPlayer, setNewPlayer] = useState('');
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [day, setDay] = useState(String(now.getDate()));
  const [hour, setHour] = useState(String(now.getHours()));
  const [minute, setMinute] = useState(String(now.getMinutes()));
  const [error, setError] = useState('');

  useEffect(() => {
    DatabaseController.getInstance()
      .loadUsername()
      .then(username => {
        if (username) {
          setPlayers(prev => (prev.includes(username) ? prev : [username, ...prev]));
        }
      });
  }, []);

  const handleAddPlayer = () => {
    const trimmed = newPlayer.trim();
    if (!trimmed || players.includes(trimmed)) {
      return;
    }
    setPlayers([...players, trimmed]);
    setNewPlayer('');
  };

  const handleCreate = async () => {
    const trimmedName = name.trim();
    const initTime = Number(initTimeMinutes);
    const increment = Number(incrementSeconds);

    if (!trimmedName) {
      setError('Enter a tournament name');
      return;
    }
    if (!initTimeMinutes || Number.isNaN(initTime) || initTime <= 0) {
      setError('Enter a valid time in minutes');
      return;
    }
    if (!incrementSeconds || Number.isNaN(increment) || increment < 0) {
      setError('Enter a valid increment');
      return;
    }
    if (players.length === 0) {
      setError('Add at least one player');
      return;
    }

    const startTime = toTimestamp(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
    );
    if (Number.isNaN(startTime)) {
      setError('Enter a valid start date/time');
      return;
    }

    setError('');

    await DatabaseController.getInstance().addTournament({
      name: trimmedName ,
      players,
      startTime,
      duration: 60 * 60 * 1000,
      initTime: initTime * 60 * 1000,
      increment: increment * 1000,
      // From a player's 3rd consecutive win onward, those wins score 4 points
      // instead of 2.
      streakEnabled: true,
      // Piece-odds handicap per matchup, keyed by sorted player-index pair
      // "i-j" (indices into `players`: 0=BlindFork, 1=HarshB20000, 2=kkr19,
      // 3=rajjayavant). Each entry names the giver's index and which of their
      // own pieces they remove before the game, coded by standard starting
      // square — Ra/Rh = queenside/kingside rook, Nb/Ng = queenside/kingside
      // knight, Bc/Bf = queenside/kingside bishop, Q = queen, Pa-Ph = pawn on
      // that file. `null` means an even game.
      oddsInfo: {
        '0-1': { giver: 0, missing: ['Rh','Nb','Pa'] },
        '0-2': { giver: 0, missing: ['Ra', 'Ng'] },
        '0-3': { giver: 0, missing: ['Nb'] },
        '1-2': null,
        '1-3': { giver: 3, missing: ['Nb'] },
        '2-3': { giver: 3, missing: ['Bc'] },
      },
    });

    navigation.navigate('Tournaments');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Tournament</Text>

      <ScrollView style={styles.scroll}>
        <Text style={styles.label}>Tournament Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Friday Night Blitz"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Time (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="3"
          value={initTimeMinutes}
          onChangeText={setInitTimeMinutes}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Increment (seconds)</Text>
        <TextInput
          style={styles.input}
          placeholder="1"
          value={incrementSeconds}
          onChangeText={setIncrementSeconds}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Start Date/Time</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="YYYY"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.dateInputSmall]}
            placeholder="MM"
            value={month}
            onChangeText={setMonth}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.dateInputSmall]}
            placeholder="DD"
            value={day}
            onChangeText={setDay}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.dateInputSmall]}
            placeholder="HH"
            value={hour}
            onChangeText={setHour}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.dateInputSmall]}
            placeholder="mm"
            value={minute}
            onChangeText={setMinute}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Players</Text>
        {[...players].sort((a, b) => a.localeCompare(b)).map(player => (
          <Text key={player} style={styles.player}>
            {player}
          </Text>
        ))}

        <View style={styles.addPlayerRow}>
          <TextInput
            style={[styles.input, styles.addPlayerInput]}
            placeholder="Lichess username"
            value={newPlayer}
            onChangeText={setNewPlayer}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
            <Text style={styles.addButtonText}>Add Player</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create Tournament</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 20,
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
    fontSize: 22,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 20,
  },
  scroll: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateInput: {
    flex: 1.2,
    marginRight: 8,
  },
  dateInputSmall: {
    flex: 1,
    marginRight: 8,
  },
  player: {
    fontSize: 16,
    paddingVertical: 6,
  },
  addPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addPlayerInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#eeeeee',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 16,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
