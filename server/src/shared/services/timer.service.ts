/**
 * In-memory registry of active game timers. Stores a mutable `stopTime` Date per game.
 */
class TimerService {
	private timers = new Map<string, Date>();

	/**
	 * Register the stop time for a newly started game.
	 * Must be called before {@link addTime} can be used for this game.
	 *
	 * @param gameId Unique game identifier.
	 * @param stopTime The Date at which the game round should end.
	 */
	register(gameId: string, stopTime: Date): void {
		this.timers.set(gameId, stopTime);
	}

	/**
	 * Extend the remaining time for an active game.
	 *
	 * @param gameId Unique game identifier.
	 * @param seconds Number of seconds to add to the current stop time.
	 * @returns Remaining milliseconds after the extension, or `null` if the game is not registered.
	 */
	addTime(gameId: string, seconds: number): number | null {
		const stopTime = this.timers.get(gameId);
		if (!stopTime) return null;
		stopTime.setSeconds(stopTime.getSeconds() + seconds);
		return stopTime.getTime() - Date.now();
	}

	/**
	 * Remove a game's timer entry once the round has ended.
	 *
	 * @param gameId Unique game identifier.
	 */
	unregister(gameId: string): void {
		this.timers.delete(gameId);
	}

	getTime(gameId: string): Date | undefined {
		return this.timers.get(gameId);
	}
}

export default new TimerService();
