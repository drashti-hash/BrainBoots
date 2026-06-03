from django.urls import path

from games.Views.user_view import login_view, register_view
from games.Views.dashboard_view import dashboard_data_view
from games.Views.reaction_view import add_reaction_score_view
from games.Views.memory_view import add_memory_score_view
from games.Views.typing_view import add_typing_score_view
from games.Views.aim_view import add_aim_score_view
from games.Views.stroop_view import add_stroop_score_view
from games.Views.simon_view import add_simon_score_view
from games.Views.number_sequence_view import add_number_sequence_score_view
from games.Views.odd_color_view import add_odd_color_score_view
from games.Views.focus_grid_view import add_focus_grid_score_view
from games.Views.sudoku_view import add_sudoku_score_view
from games.Views.word_guess_view import add_word_guess_score_view
from games.Views.lights_out_view import add_lights_out_score_view
from games.Views.sliding_tile_view import add_sliding_tile_score_view
from games.Views.nback_view import add_nback_score_view
from games.Views.speed_math_view import add_speed_math_score_view
from games.Views.schulte_view import add_schulte_score_view
from games.Views.hanoi_view import add_hanoi_score_view

urlpatterns = [
    path('add-reaction-score/', add_reaction_score_view),
    path('add-memory-score/', add_memory_score_view),
    path('add-typing-score/', add_typing_score_view),
    path('add-aim-score/', add_aim_score_view),
    path('add-stroop-score/', add_stroop_score_view),
    path('add-simon-score/', add_simon_score_view),
    path('add-number-sequence-score/', add_number_sequence_score_view),
    path('add-odd-color-score/', add_odd_color_score_view),
    path('add-focus-grid-score/', add_focus_grid_score_view),
    path('add-sudoku-score/', add_sudoku_score_view),
    path('add-word-guess-score/', add_word_guess_score_view),
    path('add-lights-out-score/', add_lights_out_score_view),
    path('add-sliding-tile-score/', add_sliding_tile_score_view),
    path('add-nback-score/', add_nback_score_view),
    path('add-speed-math-score/', add_speed_math_score_view),
    path('add-schulte-score/', add_schulte_score_view),
    path('add-hanoi-score/', add_hanoi_score_view),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('dashboard-data/', dashboard_data_view, name='dashboard-data'),
]
