import os
import django
from django.test import TestCase, override_settings
from channels.testing import WebsocketCommunicator
from backend.asgi import application

class MultiplayerConsumerTests(TestCase):
    @override_settings(CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    })
    async def test_lobby_reset(self):
        # Establish websocket connection
        communicator = WebsocketCommunicator(application, "/ws/multiplayer/TESTROOM/")
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # 1. Join room as host
        await communicator.send_json_to({
            "event": "join_room",
            "username": "HostPlayer"
        })
        
        response = await communicator.receive_json_from()
        self.assertEqual(response["event"], "player_joined")
        self.assertEqual(response["username"], "HostPlayer")

        # 2. Start game
        await communicator.send_json_to({
            "event": "start_game",
            "game_id": "aim",
            "game_name": "Aim Trainer"
        })
        
        response = await communicator.receive_json_from()
        self.assertEqual(response["event"], "game_started")
        self.assertEqual(response["game_id"], "aim")

        # 3. Reset lobby
        await communicator.send_json_to({
            "event": "reset_lobby"
        })

        response = await communicator.receive_json_from()
        self.assertEqual(response["event"], "lobby_reset")
        self.assertEqual(len(response["players"]), 1)
        self.assertEqual(response["players"][0]["username"], "HostPlayer")
        self.assertEqual(response["players"][0]["status"], "waiting")
        self.assertEqual(response["players"][0]["score"], 0)

        # Cleanup
        await communicator.disconnect()

    @override_settings(CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    })
    async def test_game_action(self):
        # Establish websocket connection
        communicator = WebsocketCommunicator(application, "/ws/multiplayer/TESTROOM2/")
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # 1. Join room
        await communicator.send_json_to({
            "event": "join_room",
            "username": "Player1"
        })
        response = await communicator.receive_json_from()
        self.assertEqual(response["event"], "player_joined")

        # 2. Send custom game action
        payload = {"action": "submit_answer", "answer": "To wash my pet rock."}
        await communicator.send_json_to({
            "event": "game_action",
            "payload": payload
        })

        response = await communicator.receive_json_from()
        self.assertEqual(response["event"], "game_action")
        self.assertEqual(response["username"], "Player1")
        self.assertEqual(response["payload"], payload)

        # Cleanup
        await communicator.disconnect()
