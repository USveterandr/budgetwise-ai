from workers import WorkerEntrypoint, ASGIApp
from backend.server import worker_app

class Default(WorkerEntrypoint):
    def __init__(self):
        self.asgi_app = ASGIApp(worker_app)

    async def fetch(self, request):
        return await self.asgi_app.handle(request)
