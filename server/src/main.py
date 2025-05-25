from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import logfire
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.auth import azure_scheme
from src.exceptions import ResourceAlreadyExistsException, ResourceNotFoundException
from src.router import router
from src.settings import settings

logfire.configure()
logfire.instrument_pydantic_ai()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:  # pyright: ignore[reportUnusedParameter]
    await azure_scheme.openid_config.load_config()
    yield


app = FastAPI(
    swagger_ui_oauth2_redirect_url="/oauth2-redirect",
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True,
        "clientId": settings.OPENAPI_CLIENT_ID,
    },
    lifespan=lifespan,
)


@app.exception_handler(ResourceNotFoundException)
async def resource_not_found_exception_handler(
    request: Request,  # pyright: ignore[reportUnusedParameter]
    exc: ResourceNotFoundException,
):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"message": str(exc)},
    )


@app.exception_handler(ResourceAlreadyExistsException)
async def resource_already_exists_exception_handler(
    request: Request,  # pyright: ignore[reportUnusedParameter]
    exc: ResourceAlreadyExistsException,
):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"message": str(exc)},
    )


if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(router)
