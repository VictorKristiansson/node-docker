CREATE TABLE games (
game_id SERIAL PRIMARY KEY,
title VARCHAR(50) NOT NULL,
genre VARCHAR(50) NOT NULL
)

INSERT INTO games (title,genre)
VALUES 
('Tetris', 'Puzzle'),
('Pac-Man', 'Arcade'),
('Donkey Kong', 'Arcade');

SELECT * FROM games;