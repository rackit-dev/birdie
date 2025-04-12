from fastapi import FastAPI
from user.interface.controllers.user_controller import router as user_routers

app = FastAPI()

app.include_router(user_routers)


@app.get("/")
def hello():
    return {"Hello": "FastAPI"}