import AsyncStorage from '@react-native-async-storage/async-storage';

const USERNAME_STORAGE_KEY = '@ChessTourney:username';
const TOURNAMENTS_STORAGE_KEY = '@ChessTourney:tournaments';

class DatabaseController {
  private static instance: DatabaseController;

  private username: string = '';
  private tournaments: any[] = [];

  static getInstance(): DatabaseController {
    if (!DatabaseController.instance) {
      DatabaseController.instance = new DatabaseController();
    }
    return DatabaseController.instance;
  }

  getUsername(): string {
    return this.username;
  }

  async setUsername(username: string): Promise<void> {
    this.username = username;
    await this.syncUsernameWithAsyncStorage();
  }

  async loadUsername(): Promise<string> {
    try {
      const stored = await AsyncStorage.getItem(USERNAME_STORAGE_KEY);
      this.username = stored ?? '';
    } catch (error) {
      console.error('Error loading username from AsyncStorage:', error);
    }
    return this.username;
  }

  private async syncUsernameWithAsyncStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(USERNAME_STORAGE_KEY, this.username);
    } catch (error) {
      console.error('Error syncing username to AsyncStorage:', error);
    }
  }

  getTournaments(): any[] {
    return [...this.tournaments];
  }

  async addTournament(tournament: any = {}): Promise<any> {
    const id = tournament.id ?? DatabaseController.generateId();
    const newTournament = { ...tournament, id };
    this.tournaments.push(newTournament);
    await this.syncTournamentsWithAsyncStorage();
    return newTournament;
  }

  async updateTournament(id: string, updates: any): Promise<any | undefined> {
    const index = this.tournaments.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.tournaments[index] = { ...this.tournaments[index], ...updates, id };
    await this.syncTournamentsWithAsyncStorage();
    return this.tournaments[index];
  }

  async loadTournaments(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem(TOURNAMENTS_STORAGE_KEY);
      this.tournaments = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tournaments from AsyncStorage:', error);
    }
    return this.tournaments;
  }

  private async syncTournamentsWithAsyncStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        TOURNAMENTS_STORAGE_KEY,
        JSON.stringify(this.tournaments),
      );
    } catch (error) {
      console.error('Error syncing tournaments to AsyncStorage:', error);
    }
  }

  private static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

}

export default DatabaseController;
