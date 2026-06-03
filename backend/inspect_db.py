import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = [r[0] for r in cursor.fetchall()]
        print("=== TABLES AND SCHEMAS ===")
        for table in tables:
            cursor.execute(f"DESCRIBE `{table}`")
            columns = cursor.fetchall()
            col_desc = ", ".join([f"{col[0]} ({col[1]})" for col in columns])
            print(f"- {table}: {col_desc}")
            
        print("\n=== STORED PROCEDURES ===")
        cursor.execute("SHOW PROCEDURE STATUS WHERE Db = 'brain_game'")
        procedures = [r[1] for r in cursor.fetchall()]
        for proc in procedures:
            cursor.execute(f"SHOW CREATE PROCEDURE `{proc}`")
            proc_def = cursor.fetchone()
            print(f"\n--- PROCEDURE: {proc} ---")
            print(proc_def[2])
except Exception as e:
    print("Error:", e)
