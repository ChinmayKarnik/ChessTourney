import { DatabaseController, LichessController } from '../data/controllers';

const setLatestDataForTournament = async (id: string) => {
  // get trouanment from the database.
  const tournament = DatabaseController.getInstance()
    .getTournaments()
    .find(t => t.id === id);

  if (!tournament) {
    return;
  }

  // for all the players, get all the matches corresponding to the time frame within the torunament
  // ie. the last match should start before the tournament end time and the first match should start after the tournament start time.
  const startTime = tournament.startTime;
  const endTime = tournament.startTime + tournament.duration;

  const matches: any = {};

  for (const player of tournament.players) {
    matches[player] = await LichessController.getInstance().getGamesInTimeRange(
      player,
      startTime,
      endTime,
    );

    console.log(player, matches[player]);
  }

  await DatabaseController.getInstance().updateTournament(id, { matches });
};

export { setLatestDataForTournament };
