from django.db import connection

def create_multiplayer_table_if_not_exists():
    """
    Creates the multiplayer_game_results table in MySQL if it doesn't exist.
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS multiplayer_game_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_code VARCHAR(50) NOT NULL,
                game_name VARCHAR(100) NOT NULL,
                username VARCHAR(100) NOT NULL,
                score INT NOT NULL,
                is_winner BOOLEAN NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
    return True

def save_multiplayer_result(room_code, game_name, username, score, is_winner):
    """
    Inserts a single player's result into the multiplayer_game_results table.
    """
    # Ensure table exists
    create_multiplayer_table_if_not_exists()
    
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO multiplayer_game_results (room_code, game_name, username, score, is_winner)
            VALUES (%s, %s, %s, %s, %s);
        """, [room_code, game_name, username, score, is_winner])
    return True

def get_room_results(room_code):
    """
    Retrieves all results registered for a specific room_code, sorted by score descending.
    """
    # Ensure table exists
    create_multiplayer_table_if_not_exists()
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT username, score, is_winner, created_at
            FROM multiplayer_game_results
            WHERE room_code = %s
            ORDER BY score DESC;
        """, [room_code])
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
