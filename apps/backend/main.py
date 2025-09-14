from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from containers import Container

from user.interface.controllers.user_controller import router as user_routers
from product.interface.controllers.product_controller import router as product_routers
from order.interface.controllers.order_controller import router as order_routers
from order.interface.controllers.coupon_controller import router as coupon_routers
from cartitem.interface.controllers.cartitem_controller import router as cartitem_routers

app = FastAPI(docs_url="/api/docs", redoc_url="/api/redoc")
app.container = Container()

app.include_router(user_routers, prefix="/api")
app.include_router(product_routers, prefix="/api")
app.include_router(order_routers, prefix="/api")
app.include_router(cartitem_routers, prefix="/api")
app.include_router(coupon_routers, prefix="/api")

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


@app.get("/api")
def hello():
    return {"Hello": "FastAPI"}