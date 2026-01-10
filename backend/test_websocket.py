# test_websocket.py
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/audio"

    try:
        async with websockets.connect(uri) as websocket:
            # Receive connection message
            message = await websocket.recv()
            print(f"Received: {message}")

            # Send a mode message
            await websocket.send(json.dumps({
                "type": "mode",
                "data": "dojo"
            }))

            response = await websocket.recv()
            print(f"Mode response: {response}")

            # Send a scenario
            await websocket.send(json.dumps({
                "type": "scenario",
                "data": "salary_negotiation"
            }))

            response2 = await websocket.recv()
            print(f"Scenario response: {response2}")

            print("✅ WebSocket connection working!")

    except Exception as e:
        print("❌ WebSocket test failed:", e)

if __name__ == "__main__":
    asyncio.run(test_websocket())
