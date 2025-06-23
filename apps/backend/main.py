from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from containers import Container

from user.interface.controllers.user_controller import router as user_routers
from product.interface.controllers.product_controller import router as product_routers

app = FastAPI()
app.container = Container()

app.include_router(user_routers)
app.include_router(product_routers)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    return JSONResponse(
        status_code=400,
        content=str(exc.errors()),
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def hello():
    return {"Hello": "FastAPI"}