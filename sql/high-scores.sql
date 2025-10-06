SELECT players.name, games.title, scores.score
FROM scores
JOIN players ON scores.player_id = players.player_id
JOIN games ON scores.game_id = games.game_id
ORDER BY score DESC

LIMIT 3;