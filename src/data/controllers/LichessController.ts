class LichessController {
  private static instance: LichessController;

  static getInstance(): LichessController {
    if (!LichessController.instance) {
      LichessController.instance = new LichessController();
    }
    return LichessController.instance;
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    const response = await fetch(
      `https://lichess.org/api/user/${encodeURIComponent(username)}`,
    );
    return response.ok;
  }

  async getGamesInTimeRange(
    username: string,
    startTime: number,
    endTime: number,
  ): Promise<any[]> {
    const response = await fetch(
      `https://lichess.org/api/games/user/${encodeURIComponent(
        username,
      )}?since=${startTime}&until=${endTime}&moves=false`,
      { headers: { Accept: 'application/x-ndjson' } },
    );

    const text = await response.text();
    const games = text
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));

    return games.map(game => {
      const isWhite =
        game.players?.white?.user?.name?.toLowerCase() ===
        username.toLowerCase();
      const opponent = isWhite
        ? game.players?.black?.user?.name
        : game.players?.white?.user?.name;

      let result: 'win' | 'loss' | 'draw' = 'draw';
      if (game.winner) {
        const won =
          (isWhite && game.winner === 'white') ||
          (!isWhite && game.winner === 'black');
        result = won ? 'win' : 'loss';
      }

      const rating = isWhite
        ? game.players?.white?.rating
        : game.players?.black?.rating;

      return {
        id: game.id,
        opponent: opponent ?? 'Computer/Anonymous',
        color: isWhite ? 'white' : 'black',
        result,
        speed: game.speed,
        playedAt: game.createdAt,
        rating,
      };
    });
  }

  buildChallengeLink(
    opponent: string,
    fen: string,
    initTime: number,
    increment: number,
    color: 'white' | 'black' | 'random' = 'random',
  ): string {
    const minutesPerSide = initTime / (60 * 1000);
    const incrementSeconds = increment / 1000;

    return (
      `https://lichess.org/?user=${encodeURIComponent(opponent)}` +
      `&fen=${encodeURIComponent(fen)}` +
      `&minutesPerSide=${minutesPerSide}` +
      `&increment=${incrementSeconds}` +
      `&gameMode=casual` +
      `&color=${color}` +
      `#friend`
    );
  }
}

export default LichessController;
