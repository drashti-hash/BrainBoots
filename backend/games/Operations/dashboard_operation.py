from datetime import date, datetime, timedelta
from decimal import Decimal

from django.db import connection


SENSITIVE_COLUMNS = {
    "password",
    "hashed_password",
    "token",
    "secret",
}


def _json_value(value):
    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, (datetime, date)):
        return value.isoformat()

    return value


def _is_score_table(table_name):
    name = table_name.lower()
    return "score" in name or name.endswith("_game") or name.endswith("_games")


def _safe_row(columns, row):
    data = {}

    for column, value in zip(columns, row):
        if column.lower() in SENSITIVE_COLUMNS:
            continue

        data[column] = _json_value(value)

    return data


def _extract_score(row):
    for key in ("score", "total_score", "points", "wpm"):
        value = row.get(key)

        if isinstance(value, (int, float, Decimal)):
            return float(value)

    return 0


def _extract_date(row):
    for key in ("created_at", "created_on", "played_at", "date", "created_date"):
        value = row.get(key)

        if isinstance(value, datetime):
            return value.date()

        if isinstance(value, date):
            return value

        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value).date()
            except ValueError:
                try:
                    return date.fromisoformat(value)
                except ValueError:
                    continue

    return None


def _calculate_streak(play_dates):
    unique_dates = sorted(set(play_dates), reverse=True)

    if not unique_dates:
        return 0

    today = date.today()
    expected = today

    if unique_dates[0] != today:
        expected = unique_dates[0]

    streak = 0

    for played_date in unique_dates:
        if played_date == expected:
            streak += 1
            expected = expected - timedelta(days=1)
        else:
            break

    return streak


def _format_game_name(table_name):
    name = table_name.lower()

    for suffix in ("_scores", "_score", "_games", "_game"):
        if name.endswith(suffix):
            name = name[:-len(suffix)]
            break

    return name.replace("_", " ").title()


def get_dashboard_data_operation():
    tables = []
    high_scores = []
    all_rows = []
    play_dates = []

    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        table_names = [row[0] for row in cursor.fetchall()]

        for table_name in table_names:
            if not _is_score_table(table_name):
                continue

            cursor.execute(f"SELECT * FROM `{table_name}` ORDER BY 1 DESC LIMIT 100")
            columns = [column[0] for column in cursor.description]
            rows = [_safe_row(columns, row) for row in cursor.fetchall()]

            for row in rows:
                all_rows.append(row)

                played_date = _extract_date(row)
                if played_date:
                    play_dates.append(played_date)

            table_scores = [_extract_score(row) for row in rows]
            high_scores.append({
                "game": _format_game_name(table_name),
                "table": table_name,
                "bestScore": int(max(table_scores)) if table_scores else 0,
                "plays": len(rows),
            })

            tables.append({
                "name": table_name,
                "count": len(rows),
                "rows": rows,
            })

    scores = [_extract_score(row) for row in all_rows]
    total_score = int(sum(scores))
    best_score = int(max(scores)) if scores else 0

    return {
        "success": True,
        "stats": {
            "totalScore": total_score,
            "bestScore": best_score,
            "gamesPlayed": len(all_rows),
            "streak": _calculate_streak(play_dates),
        },
        "highScores": high_scores,
        "tables": tables,
    }
