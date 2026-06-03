import pymysql
import re
import sys
import os

def main():
    print("==================================================")
    print("       RAILWAY MYSQL DATABASE IMPORTER            ")
    print("==================================================")
    print("તમારા Railway Dashboard માંથી MySQL -> Connect -> Variables ટેબમાં જાઓ.")
    print("ત્યાંથી DATABASE_URL અથવા MYSQL_URL કોપી કરો.")
    print("તે URL આ પ્રકારનું હશે: mysql://root:password@host:port/database\n")
    
    url = input("Railway MySQL Connection URL દાખલ કરો: ").strip()
    
    if not url:
        print("ભૂલ: URL ખાલી ન હોઈ શકે!")
        return
        
    # parse the connection URL
    match = re.match(r"mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", url)
    if not match:
        print("ભૂલ: URL ફોર્મેટ ખોટું છે! ખાતરી કરો કે તે mysql:// થી શરૂ થાય છે.")
        return
        
    user, password, host, port, db = match.groups()
    port = int(port)
    
    print("\nRailway Database સાથે કનેક્ટ થઈ રહ્યું છે...")
    try:
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            port=port,
            database=db,
            charset='utf8mb4'
        )
        print("કનેક્શન સફળ રહ્યું!")
    except Exception as e:
        print(f"કનેક્શન નિષ્ફળ ગયું: {e}")
        return

    # find brain_game.sql path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sql_file = os.path.join(base_dir, 'brain_game.sql')
    
    if not os.path.exists(sql_file):
        print(f"ભૂલ: brain_game.sql ફાઇલ {sql_file} સ્થાને મળી નથી!")
        return
        
    print(f"ડેટાબેઝ ફાઇલ વાંચી રહ્યા છીએ: {sql_file}")
    with open(sql_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print("ક્વેરીઝ એક્ઝીક્યુટ થઈ રહી છે...")
    cursor = connection.cursor()
    
    current_statement = []
    current_delimiter = ';'
    success_count = 0
    error_count = 0
    
    for line_num, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # skip comments or empty lines
        if stripped.startswith('--') or stripped.startswith('/*') or not stripped:
            continue
            
        # check for delimiter change
        if stripped.upper().startswith('DELIMITER'):
            parts = stripped.split()
            if len(parts) >= 2:
                current_delimiter = parts[1]
            continue
            
        current_statement.append(line)
        
        # execute when delimiter matches
        if stripped.endswith(current_delimiter):
            statement = "".join(current_statement)
            if current_delimiter != ';':
                statement = statement.rstrip()
                if statement.endswith(current_delimiter):
                    statement = statement[:-len(current_delimiter)]
            
            try:
                cursor.execute(statement)
                success_count += 1
            except Exception as e:
                error_count += 1
                # print warnings for failed queries
                print(f"લાઈન {line_num} પર ચેતવણી: {e}")
                
            current_statement = []
            
    connection.commit()
    cursor.close()
    connection.close()
    
    print("\n==================================================")
    print(f"આયાત પૂર્ણ થઈ!")
    print(f"સફળ ક્વેરીઝ: {success_count}")
    print(f"નિષ્ફળ ક્વેરીઝ/ચેતવણીઓ: {error_count}")
    print("રેલવે ડેટાબેઝ સેટઅપ થઈ ગયો છે!")
    print("==================================================")

if __name__ == '__main__':
    main()
