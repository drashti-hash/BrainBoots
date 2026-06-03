from django.apps import AppConfig


class GamesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'games'

    def ready(self):
        try:
            from games.Operations.multiplayer_operation import create_multiplayer_table_if_not_exists
            create_multiplayer_table_if_not_exists()
            print("Multiplayer DB tables verified/created successfully.")
        except Exception as e:
            print("Warning: Could not auto-initialize multiplayer database tables:", e)

