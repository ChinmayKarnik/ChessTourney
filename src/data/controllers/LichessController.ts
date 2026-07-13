class LichessController {
  private static instance: LichessController;

  // global backoff: once we hit a 429, no requests go out until this timestamp.
  private rateLimitedUntil = 0;

  static getInstance(): LichessController {
    if (!LichessController.instance) {
      LichessController.instance = new LichessController();
    }
    return LichessController.instance;
  }

  private async waitForRateLimit() {
    while (Date.now() < this.rateLimitedUntil) {
      const remaining = this.rateLimitedUntil - Date.now();
      console.log('lichess API rate limited, waiting', remaining, 'ms');
      await new Promise<void>(resolve => setTimeout(resolve, remaining));
    }
  }

  private registerRateLimit() {
    this.rateLimitedUntil = Date.now() + 60000;
    console.log(
      'lichess API rate limited, backing off until',
      new Date(this.rateLimitedUntil).toISOString(),
    );
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    await this.waitForRateLimit();

    try {
      const url = `https://lichess.org/api/user/${encodeURIComponent(username)}`;
      console.log('LICHESS_API_CALL', url);
      const response = await fetch(url);
      if (response.status === 429) {
        this.registerRateLimit();
        return false;
      }
      return response.ok;
    } catch (error) {
      console.log('checkUsernameExists failed for', username, error);
      return false;
    }
  }

  async getGamesInTimeRange(
    username: string,
    startTime: number,
    endTime: number,
  ): Promise<any[]> {
    await this.waitForRateLimit();

    let response;
    try {
      const url = `https://lichess.org/api/games/user/${encodeURIComponent(
        username,
      )}?since=${startTime}&until=${endTime}&moves=false`;
      console.log('LICHESS_API_CALL', url);
      response = await fetch(url, {
        headers: { Accept: 'application/x-ndjson' },
      });
    } catch (error) {
      console.log('getGamesInTimeRange failed for', username, error);
      return [];
    }

    if (response.status === 429) {
      this.registerRateLimit();
      return [];
    }

    if (!response.ok) {
      return [];
    }

    const text = await response.text();
    const games = text
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

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
        finishedAt: game.lastMoveAt ?? game.createdAt,
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
      (fen ? `&fen=${encodeURIComponent(fen)}` : '') +
      `&minutesPerSide=${minutesPerSide}` +
      `&increment=${incrementSeconds}` +
      `&gameMode=casual` +
      `&color=${color}` +
      `#friend`
    );
  }
}

export default LichessController;
