import asyncio


async def main():
    await asyncio.sleep(1)
    print('hello')


loop = asyncio.get_event_loop()
task = loop.create_task(main)
loop.run_forever()