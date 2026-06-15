import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .Operations.multiplayer_operation import save_multiplayer_result

# Global in-memory dictionary to store room states.
# In production, this can be moved to Redis cache or standard database tables.
# Structure:
# {
#     "ROOM_CODE": {
#         "status": "waiting" | "playing",
#         "game_id": str,
#         "game_name": str,
#         "players": {
#             "username": {
#                 "channel_name": str,
#                 "is_host": bool,
#                 "score": int,
#                 "status": "waiting" | "playing" | "finished"
#             }
#         }
#     }
# }

rooms = {}

class MultiplayerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Called when a client initiates a WebSocket handshake.
        Extracts room code and joins the appropriate Channel Group.
        """
        try:
            self.room_code = self.scope['url_route']['kwargs']['room_code'].upper()
            self.room_group_name = f'room_{self.room_code}'
            self.username = None

            # Accept the incoming connection
            await self.accept()

            # Join the channel group for room-wide broadcasting
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            # Initialize the room configuration if it is new
            if self.room_code not in rooms:
                rooms[self.room_code] = {
                    "status": "waiting",
                    "game_id": None,
                    "game_name": None,
                    "players": {}
                }
        except Exception as e:
            print(f"--- [WS CONNECT ERROR] ---")
            import traceback
            traceback.print_exc()
            await self.close()

    async def disconnect(self, close_code):
        """
        Cleans up room state and broadcasts to group when a player disconnects.
        """
        try:
            # Leave channel group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

            if self.room_code in rooms and self.username:
                players = rooms[self.room_code]["players"]
                if self.username in players:
                    is_host = players[self.username]["is_host"]
                    del players[self.username]

                    # If the player leaving was the host, re-assign hosting to the next player
                    if is_host and players:
                        next_player = list(players.keys())[0]
                        players[next_player]["is_host"] = True

                    # Notify other players about the disconnection
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            "type": "player_left",
                            "username": self.username,
                            "players": self.get_players_list()
                        }
                    )

                # Clean up the room entirely if no players are left
                if not players:
                    del rooms[self.room_code]
        except Exception as e:
            print(f"--- [WS DISCONNECT ERROR] ---")
            import traceback
            traceback.print_exc()

    async def receive(self, text_data):
        """
        Listens for incoming messages from the client and delegates tasks.
        """
        try:
            data = json.loads(text_data)
            event_type = data.get("event")

            if event_type == "join_room":
                await self.handle_join_room(data)
            elif event_type == "chat_message":
                await self.handle_chat_message(data)
            elif event_type == "start_game":
                await self.handle_start_game(data)
            elif event_type == "start_gameplay":
                await self.handle_start_gameplay(data)
            elif event_type == "score_update":
                await self.handle_score_update(data)
            elif event_type == "submit_score":
                await self.handle_submit_score(data)
            elif event_type == "add_bot":
                await self.handle_add_bot(data)
            elif event_type == "remove_bot":
                await self.handle_remove_bot(data)
            elif event_type == "reset_lobby":
                await self.handle_reset_lobby(data)
            elif event_type == "game_action":
                await self.handle_game_action(data)
        except Exception as e:
            print(f"--- [WS RECEIVE ERROR] ---")
            import traceback
            traceback.print_exc()

    async def handle_join_room(self, data):
        """
        Registers a player into the room state and notifies all room occupants.
        """
        self.username = data.get("username")
        if not self.username:
            return

        players = rooms[self.room_code]["players"]
        
        # If player is already in room (e.g. reconnect or page refresh), update channel name
        if self.username in players:
            players[self.username]["channel_name"] = self.channel_name
        else:
            # First player in the room is assigned host status
            is_host = len(players) == 0
            players[self.username] = {
                "channel_name": self.channel_name,
                "is_host": is_host,
                "score": 0,
                "status": "waiting"
            }

        # Broadcast the joining event to the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_joined",
                "username": self.username,
                "players": self.get_players_list(),
                "room_status": rooms[self.room_code]["status"]
            }
        )

    async def handle_chat_message(self, data):
        """
        Broadcasts a text chat message to all players in the room.
        """
        message = data.get("message")
        if not message:
            return
            
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_broadcast",
                "username": self.username,
                "message": message
            }
        )

    async def handle_start_game(self, data):
        """
        Transitions the room status to 'playing' and starts the selected game.
        """
        players = rooms[self.room_code]["players"]
        
        # Security: Check if caller is indeed the room host
        if self.username in players and players[self.username]["is_host"]:
            game_id = data.get("game_id")
            game_name = data.get("game_name")

            rooms[self.room_code]["status"] = "playing"
            rooms[self.room_code]["game_id"] = game_id
            rooms[self.room_code]["game_name"] = game_name

            # Reset player active game scores and status
            for p_username in players:
                players[p_username]["score"] = 0
                players[p_username]["status"] = "playing"

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_start_broadcast",
                    "game_id": game_id,
                    "game_name": game_name,
                    "players": self.get_players_list()
                }
            )

            # Start bot simulation tasks
            import asyncio
            for p_username in list(players.keys()):
                if p_username.startswith("Computer Bot"):
                    asyncio.create_task(self.simulate_bot_play(p_username))

    async def handle_start_gameplay(self, data):
        """
        Broadcasts to all players that gameplay should start now.
        """
        players = rooms[self.room_code]["players"]
        if self.username in players and players[self.username]["is_host"]:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "gameplay_start_broadcast"
                }
            )

    async def handle_score_update(self, data):
        """
        Updates a player's intermediate score and broadcasts it in real-time.
        """
        score = data.get("score", 0)
        players = rooms[self.room_code]["players"]
        if self.username in players:
            players[self.username]["score"] = score

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "score_update_broadcast",
                    "username": self.username,
                    "score": score
                }
            )

    async def handle_submit_score(self, data, submitter_username=None):
        """
        Registers a player's final score. Evaluates victory if all players finished.
        """
        username = submitter_username or self.username
        score = data.get("score", 0)
        players = rooms[self.room_code]["players"]
        if username in players:
            players[username]["score"] = score
            players[username]["status"] = "finished"

            # Check if all connected players have completed the game
            all_finished = all(
                p["status"] == "finished" for p in players.values()
            )

            if all_finished:
                # Determine the highest score
                highest_score = max(p["score"] for p in players.values()) if players else 0
                
                results = []
                for name, p_data in players.items():
                    # Check if player won (must have score > 0 or be the maximum if all are 0)
                    is_winner = p_data["score"] == highest_score and highest_score > 0
                    results.append({
                        "username": name,
                        "score": p_data["score"],
                        "is_winner": is_winner
                    })
                    
                    # Persist final results to the MySQL database
                    await self.save_db_result(
                        self.room_code,
                        rooms[self.room_code]["game_name"],
                        name,
                        p_data["score"],
                        is_winner
                    )

                # Reset room state to allow playing subsequent games
                rooms[self.room_code]["status"] = "waiting"
                rooms[self.room_code]["game_id"] = None
                rooms[self.room_code]["game_name"] = None
                for name in players:
                    players[name]["status"] = "waiting"

                # Send victory results broadcast
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "game_finished_broadcast",
                        "results": results
                    }
                )
            else:
                # Just notify that this player has finished
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "player_finished_broadcast",
                        "username": username,
                        "score": score,
                        "players": self.get_players_list()
                    }
                )
    async def handle_add_bot(self, data):
        """
        Registers a Computer Bot into the room state and notifies all occupants.
        """
        if self.room_code not in rooms:
            return
        players = rooms[self.room_code]["players"]
        
        # Only allow the host to add bots
        if self.username in players and players[self.username]["is_host"]:
            if len(players) >= 5:
                return
            
            bot_username = f"Computer Bot {len(players)}"
            players[bot_username] = {
                "channel_name": f"bot_channel_{bot_username}",
                "is_host": False,
                "score": 0,
                "status": "waiting"
            }
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "player_joined",
                    "username": bot_username,
                    "players": self.get_players_list(),
                    "room_status": rooms[self.room_code]["status"]
                }
            )

    async def handle_remove_bot(self, data):
        """
        Removes the last added Computer Bot from the room.
        """
        if self.room_code not in rooms:
            return
        players = rooms[self.room_code]["players"]
        
        # Only allow the host to remove bots
        if self.username in players and players[self.username]["is_host"]:
            bot_names = [name for name in players if name.startswith("Computer Bot")]
            if bot_names:
                target_bot = bot_names[-1]
                del players[target_bot]
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "player_left",
                        "username": target_bot,
                        "players": self.get_players_list()
                    }
                )

    async def handle_reset_lobby(self, data):
        """
        Resets the room and player states to 'waiting' and broadcasts a lobby_reset event.
        Called by the host to return all players to the lobby screen.
        """
        if self.room_code not in rooms:
            return
        players = rooms[self.room_code]["players"]
        
        # Security: Check if caller is indeed the room host
        if self.username in players and players[self.username]["is_host"]:
            rooms[self.room_code]["status"] = "waiting"
            rooms[self.room_code]["game_id"] = None
            rooms[self.room_code]["game_name"] = None
            
            # Reset player active game scores and status
            for p_username in players:
                players[p_username]["score"] = 0
                players[p_username]["status"] = "waiting"

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "lobby_reset_broadcast",
                    "players": self.get_players_list()
                }
            )

    async def handle_game_action(self, data):
        """
        Broadcasts custom game actions/payloads to all clients in the channel group.
        """
        payload = data.get("payload")
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "game_action_broadcast",
                "username": self.username,
                "payload": payload
            }
        )

    async def simulate_bot_play(self, bot_username):
        """
        Asynchronously simulates intermediate scoring and final submission for a bot.
        Aligns the bot's gameplay duration and start timing with the specific game configuration.
        """
        import asyncio
        import random
        
        game_id = rooms.get(self.room_code, {}).get("game_id", "")
        
        if game_id == "hotpotato":
            # For Hot Potato, bots sleep for a bit and submit a final score
            await asyncio.sleep(random.uniform(25.0, 35.0))
            if self.room_code not in rooms or rooms[self.room_code]["status"] != "playing":
                return
            players = rooms[self.room_code]["players"]
            if bot_username in players and players[bot_username]["status"] == "playing":
                final_score = random.randint(15, 50)
                await self.handle_submit_score({"score": final_score}, submitter_username=bot_username)
            return

        if game_id == "wronganswers":
            # Bot answer phase
            await asyncio.sleep(random.uniform(4.0, 7.0))
            if self.room_code not in rooms or rooms[self.room_code]["status"] != "playing":
                return
            players = rooms[self.room_code]["players"]
            if bot_username not in players or players[bot_username]["status"] != "playing":
                return

            bot_silly_answers = [
                "To recharge my invisible phone.",
                "For watering my plastic trees.",
                "To make the dust wet so it doesn't fly.",
                "To wash my pet rock.",
                "As hot chocolate sauce.",
                "For inflating tires on my bicycle.",
                "To paint my ceiling blue.",
                "To keep the ocean from drying up.",
                "As glue for sticking clouds together.",
                "To clean my clean clothes again."
            ]
            chosen_answer = random.choice(bot_silly_answers)
            
            # Broadcast the bot's answer
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_action_broadcast",
                    "username": bot_username,
                    "payload": {
                        "action": "submit_answer",
                        "answer": chosen_answer
                    }
                }
            )

            # Bot voting phase (wait for players to submit answers, then vote)
            await asyncio.sleep(random.uniform(10.0, 14.0))
            if self.room_code not in rooms or rooms[self.room_code]["status"] != "playing":
                return
            players = rooms[self.room_code]["players"]
            if bot_username not in players or players[bot_username]["status"] != "playing":
                return

            # Choose a random other player to vote for (prefer humans or other bots)
            other_players = [p for p in players if p != bot_username]
            voted_funniest = random.choice(other_players) if other_players else bot_username
            voted_creative = random.choice(other_players) if other_players else bot_username

            # Broadcast the bot's vote
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_action_broadcast",
                    "username": bot_username,
                    "payload": {
                        "action": "submit_vote",
                        "voted_funniest": voted_funniest,
                        "voted_creative": voted_creative
                    }
                }
            )

            # Wait a bit more and then finish the game
            await asyncio.sleep(random.uniform(5.0, 7.0))
            if self.room_code not in rooms or rooms[self.room_code]["status"] != "playing":
                return
            players = rooms[self.room_code]["players"]
            if bot_username in players and players[bot_username]["status"] == "playing":
                # Final bot score
                final_score = random.randint(20, 60)
                await self.handle_submit_score({"score": final_score}, submitter_username=bot_username)
            return
        
        # Determine total duration and update steps based on the game
        if game_id in ["aim", "stroop", "focusgrid", "trafficcontrol"]:
            total_duration = 30.0
            steps = 5
        elif game_id == "reaction":
            # Reaction test completes very fast (red to green delay + click reaction time)
            total_duration = random.uniform(3.0, 5.5)
            steps = 1
        elif game_id in ["speedmath", "schulte", "typing"]:
            total_duration = random.uniform(20.0, 30.0)
            steps = 4
        else:
            # Memory Match, Simon, Sudoku, etc.
            total_duration = random.uniform(25.0, 38.0)
            steps = 5
            
        # Tiny initial load delay to match client loading/rendering (auto-clicks start button)
        initial_delay = random.uniform(0.3, 0.8)
        await asyncio.sleep(initial_delay)
        
        # Calculate remaining duration for steps
        remaining_duration = max(1.0, total_duration - initial_delay)
        step_duration = remaining_duration / steps
        
        for _ in range(steps):
            await asyncio.sleep(step_duration)
            
            if self.room_code not in rooms or rooms[self.room_code]["status"] != "playing":
                return
            players = rooms[self.room_code]["players"]
            if bot_username not in players or players[bot_username]["status"] != "playing":
                return
                
            # Add realistic intermediate scores depending on the game
            if game_id == "reaction":
                score_increment = 0
            elif game_id == "aim":
                score_increment = random.randint(4, 7)
            elif game_id == "stroop":
                score_increment = random.randint(3, 6)
            elif game_id == "speedmath":
                score_increment = random.randint(30, 60)
            elif game_id in ["simon", "numbers", "nback"]:
                score_increment = random.randint(1, 3)
            elif game_id == "typing":
                score_increment = random.randint(10, 18)
            elif game_id == "trafficcontrol":
                score_increment = random.randint(2, 4) * 10
            else:
                score_increment = random.randint(10, 25)
                
            players[bot_username]["score"] += score_increment
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "score_update_broadcast",
                    "username": bot_username,
                    "score": players[bot_username]["score"]
                }
            )
            
        if self.room_code not in rooms or rooms[self.room_code]["status"] != "playing":
            return
        players = rooms[self.room_code]["players"]
        if bot_username in players and players[bot_username]["status"] == "playing":
            current_score = players[bot_username]["score"]
            if game_id == "reaction":
                final_score = 100
            elif game_id == "aim":
                final_score = current_score + random.randint(2, 5)
            elif game_id == "stroop":
                final_score = current_score + random.randint(1, 4)
            elif game_id == "speedmath":
                final_score = current_score + random.randint(10, 40)
            elif game_id in ["simon", "numbers", "nback"]:
                final_score = current_score + random.randint(1, 2)
            elif game_id == "typing":
                final_score = current_score + random.randint(5, 12)
            elif game_id == "trafficcontrol":
                final_score = current_score + random.randint(1, 3) * 10
            else:
                final_score = current_score + random.randint(5, 15)
                
            await self.handle_submit_score({"score": final_score}, submitter_username=bot_username)

    def get_players_list(self):
        """
        Helper method to serialize the list of players for frontend delivery.
        """
        players = rooms[self.room_code]["players"]
        return [
            {
                "username": name,
                "is_host": details["is_host"],
                "score": details["score"],
                "status": details["status"]
            }
            for name, details in players.items()
        ]

    @database_sync_to_async
    def save_db_result(self, room_code, game_name, username, score, is_winner):
        """
        Helper to run database inserts inside Channels' database_sync_to_async threadpool.
        """
        return save_multiplayer_result(room_code, game_name, username, score, is_winner)

    # ----------------------------------------------------
    # Event Broadcasters (Group message handlers)
    # ----------------------------------------------------

    async def player_joined(self, event):
        await self.send(text_data=json.dumps({
            "event": "player_joined",
            "username": event["username"],
            "players": event["players"],
            "room_status": event["room_status"]
        }))

    async def player_left(self, event):
        await self.send(text_data=json.dumps({
            "event": "player_left",
            "username": event["username"],
            "players": event["players"]
        }))

    async def chat_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "event": "chat_message",
            "username": event["username"],
            "message": event["message"]
        }))

    async def game_start_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "event": "game_started",
            "game_id": event["game_id"],
            "game_name": event["game_name"],
            "players": event["players"]
        }))

    async def score_update_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "event": "score_updated",
            "username": event["username"],
            "score": event["score"]
        }))

    async def player_finished_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "event": "player_finished",
            "username": event["username"],
            "score": event["score"],
            "players": event["players"]
        }))

    async def game_finished_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "event": "game_finished",
            "results": event["results"]
        }))

    async def gameplay_start_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "event": "gameplay_started"
        }))

    async def lobby_reset_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "event": "lobby_reset",
            "players": event["players"]
        }))

    async def game_action_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "event": "game_action",
            "username": event["username"],
            "payload": event["payload"]
        }))