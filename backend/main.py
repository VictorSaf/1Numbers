"""FastAPI application for 1Numbers backend."""
import asyncio
import json
from datetime import datetime
from uuid import uuid4
from typing import AsyncGenerator

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from config import get_settings, Settings
from agents import CalculatorAgent, NumerologySystem, AgentStreamEvent


# ============================================================================
# Pydantic Models for API
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: str


class CalculationRequest(BaseModel):
    """Request for numerology calculation."""
    name: str = Field(..., min_length=1, max_length=200)
    day: int = Field(..., ge=1, le=31)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=1900, le=2100)
    system: NumerologySystem = NumerologySystem.PYTHAGOREAN


class CalculationResponse(BaseModel):
    """Complete calculation response."""
    profile: dict
    request_id: str
    timestamp: str
    execution_time_ms: float


class WSCalculationRequest(BaseModel):
    """WebSocket request for streaming calculation."""
    name: str
    day: int
    month: int
    year: int
    system: NumerologySystem = NumerologySystem.PYTHAGOREAN


# ============================================================================
# FastAPI Application
# ============================================================================

def create_app(settings: Settings = None) -> FastAPI:
    """Create and configure FastAPI application."""
    if settings is None:
        settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
    )

    # ========================================================================
    # Middleware
    # ========================================================================

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ========================================================================
    # Dependencies
    # ========================================================================

    calculator = CalculatorAgent()

    # ========================================================================
    # Routes
    # ========================================================================

    @app.get("/health", response_model=HealthResponse)
    async def health_check() -> HealthResponse:
        """
        Health check endpoint.
        Used by Docker and load balancers.
        """
        return HealthResponse(
            status="healthy",
            version=settings.app_version,
            timestamp=datetime.utcnow().isoformat(),
        )

    @app.get("/config")
    async def get_config() -> dict:
        """
        Get current configuration (non-sensitive).
        """
        return {
            "app_name": settings.app_name,
            "app_version": settings.app_version,
            "environment": settings.environment,
            "ollama_model": settings.ollama_model,
            "cors_origins": settings.cors_origins,
        }

    @app.post("/api/numerology/calculate", response_model=CalculationResponse)
    async def calculate_numerology(
        request: CalculationRequest,
    ) -> CalculationResponse:
        """
        Calculate numerology profile (REST endpoint).

        This endpoint:
        - Validates input date
        - Calculates all 12 core numbers
        - Returns complete profile
        - Caches result for future requests

        Args:
            request: Calculation request with name and birth date

        Returns:
            Complete numerology profile with all numbers

        Raises:
            HTTPException: If date is invalid
        """
        request_id = str(uuid4())
        start_time = datetime.utcnow()

        try:
            # Validate date
            from datetime import datetime as dt

            dt(request.year, request.month, request.day)

            # Calculate profile
            profile = await calculator.calculate_profile(
                name=request.name,
                day=request.day,
                month=request.month,
                year=request.year,
                system=request.system,
            )

            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000

            return CalculationResponse(
                profile=profile,
                request_id=request_id,
                timestamp=datetime.utcnow().isoformat(),
                execution_time_ms=execution_time,
            )

        except ValueError as e:
            raise HTTPException(
                status_code=400, detail=f"Invalid date: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Calculation error: {str(e)}"
            )

    @app.websocket("/ws/numerology")
    async def websocket_numerology(websocket: WebSocket) -> None:
        """
        WebSocket endpoint for real-time streaming calculations.

        Connection Flow:
        1. Client connects to WebSocket
        2. Client sends calculation request as JSON
        3. Server streams events as they happen (thinking, calculating, etc.)
        4. Client receives real-time updates
        5. Connection closes after completion

        Event Types:
        - "connecting": Initial connection established
        - "calculating": Calculation in progress
        - "complete": Calculation finished with results
        - "error": An error occurred
        """
        await websocket.accept()
        request_id = str(uuid4())
        execution_id = str(uuid4())

        try:
            # Send connection confirmation
            await websocket.send_json(
                AgentStreamEvent(
                    type="connecting",
                    agent_id="orchestrator",
                    data={
                        "request_id": request_id,
                        "execution_id": execution_id,
                    },
                    timestamp=datetime.utcnow().isoformat(),
                    execution_id=execution_id,
                )
            )

            # Receive calculation request
            data = await websocket.receive_json()
            request = WSCalculationRequest(**data)

            # Stream calculation start
            await websocket.send_json(
                AgentStreamEvent(
                    type="calculating",
                    agent_id="calculator",
                    data={"status": "starting", "name": request.name},
                    timestamp=datetime.utcnow().isoformat(),
                    execution_id=execution_id,
                )
            )

            # Calculate profile
            profile = await calculator.calculate_profile(
                name=request.name,
                day=request.day,
                month=request.month,
                year=request.year,
                system=request.system,
            )

            # Stream intermediate result (like a real LLM streaming)
            await websocket.send_json(
                AgentStreamEvent(
                    type="calculated",
                    agent_id="calculator",
                    data={
                        "life_path": profile["life_path"],
                        "expression": profile["expression"],
                        "soul_urge": profile["soul_urge"],
                    },
                    timestamp=datetime.utcnow().isoformat(),
                    execution_id=execution_id,
                )
            )

            # Stream completion
            await websocket.send_json(
                AgentStreamEvent(
                    type="complete",
                    agent_id="orchestrator",
                    data=profile,
                    timestamp=datetime.utcnow().isoformat(),
                    execution_id=execution_id,
                )
            )

        except WebSocketDisconnect:
            print(f"Client disconnected: {request_id}")
        except json.JSONDecodeError:
            await websocket.send_json(
                AgentStreamEvent(
                    type="error",
                    agent_id="orchestrator",
                    data={"error": "Invalid JSON format"},
                    timestamp=datetime.utcnow().isoformat(),
                    execution_id=execution_id,
                )
            )
        except ValueError as e:
            await websocket.send_json(
                AgentStreamEvent(
                    type="error",
                    agent_id="orchestrator",
                    data={"error": f"Invalid input: {str(e)}"},
                    timestamp=datetime.utcnow().isoformat(),
                    execution_id=execution_id,
                )
            )
        except Exception as e:
            await websocket.send_json(
                AgentStreamEvent(
                    type="error",
                    agent_id="orchestrator",
                    data={"error": f"Server error: {str(e)}"},
                    timestamp=datetime.utcnow().isoformat(),
                    execution_id=execution_id,
                )
            )
        finally:
            await websocket.close()

    return app


# ============================================================================
# App Instance
# ============================================================================

settings = get_settings()
app = create_app(settings)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.fastapi_host,
        port=settings.fastapi_port,
        reload=settings.fastapi_reload,
        log_level=settings.log_level.lower(),
    )
