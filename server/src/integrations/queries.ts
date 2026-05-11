export const INSERT_GAME = `
INSERT INTO games (
	id,
	origin,
	triplet,
	plate_text
) VALUES (@id, @origin, @triplet, @plateText)`;

export const GET_GAME = `
SELECT *
  FROM games
 WHERE id = @id`;

export const GET_TOP_TRIPLET_SCORES = `
SELECT 'AAA' as name, score
  FROM games
 WHERE triplet = @triplet
 ORDER BY score
 LIMIT 10`;

export const UPDATE_GAME_END = `
UPDATE games
   SET ended_at = CURRENT_TIMESTAMP
 WHERE id = @id`;

export const UPDATE_GAME_SCORE = `
UPDATE games
   SET score = @score
 WHERE id = @id`;

export const INSERT_DICTIONARY_WORD = `
INSERT OR IGNORE INTO dictionary (word) VALUES (@word)`;

export const GET_WORDS_FOR_TRIPLET = `
SELECT word
  FROM dictionary
 WHERE word LIKE LOWER(@triplet)`;

export const CHECK_DICTIONARY = `
SELECT COUNT(*) as count
  FROM dictionary
 WHERE word = LOWER(@word)
   AND word LIKE LOWER(@triplet)
 LIMIT 1`;

export const CHECK_GUESS = `
SELECT guess
  FROM guesses
 WHERE game_id = @id
       AND guess = LOWER(@guess)`;

export const INSERT_GUESS = 'INSERT INTO guesses (game_id, guess) VALUES (@id, LOWER(@guess))';
