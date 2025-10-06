CREATE TABLE scores (
score_id SERIAL PRIMARY KEY,
player_id INTEGER REFERENCES players(player_id),
game_id INTEGER REFERENCES games(game_id),
score INTEGER NOT NULL,
date_played DATE DEFAULT CURRENT_DATE
);

INSERT INTO scores (player_id, game_id, score)
VALUES 
  (1, 1, 1500),
  (2, 2, 3000),
  (3, 3, 2500),
  (1, 2, 4000),
  (2, 1, 3500);

SELECT players.name, games.title, scores.score
FROM scores
JOIN players ON scores.player_id = players.player_id
JOIN games ON scores.game_id = games.game_id;


SELECT * FROM scores;