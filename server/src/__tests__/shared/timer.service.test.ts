import timerService from '#services/timer.service';
import { beforeEach, describe, expect, it } from 'vitest';

describe('TimerService', () => {
	const bogusGame = 'ab_sdfoI';
	const bogusTime = 1_000_000;
	let timer: Date;

	beforeEach(() => {
		timerService.unregister(bogusGame);
		timer = new Date(bogusTime);
	});

	describe('register()', () => {
		it('registers new game timers', () => {
			timerService.register(bogusGame, timer);
			const result = timerService.getTime(bogusGame);

			expect(result).toBeDefined();
			expect(result?.getTime()).toBe(bogusTime);
		});
	});

	describe('addTime()', () => {
		it('adds time to an existing timer', () => {
			const extraTime = 2;
			timerService.register(bogusGame, new Date());
			const result = timerService.addTime(bogusGame, extraTime);

			// i.e., 2 seconds minus ~1 ms of processing
			expect(result).toBeGreaterThanOrEqual(1998);
			expect(result).toBeLessThanOrEqual(2000);
		});

		it('does nothing to nonexistent timers', () => {
			expect(timerService.addTime(bogusGame, 2)).toBeNull();
		});
	});

	describe('unregister()', () => {
		it('unregisters timers', () => {
			timerService.register(bogusGame, timer);
			expect(timerService.getTime(bogusGame)).toBeDefined();
			timerService.unregister(bogusGame);
			expect(timerService.getTime(bogusGame)).toBeUndefined();
		});
	});
});
