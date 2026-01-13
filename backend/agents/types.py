"""Shared type definitions for agent system."""
from typing import Any, Annotated, TypedDict, Optional, List
from operator import add
from enum import Enum
from langchain_core.messages import BaseMessage


class NumerologySystem(str, Enum):
    """Supported numerology systems."""
    PYTHAGOREAN = "pythagorean"
    CHALDEAN = "chaldean"


class OrchestratorState(TypedDict):
    """
    State for the orchestrator agent (supervisor).
    Uses Annotated types with reducers for safe concurrent updates.
    """
    # Messages flowing through the system
    messages: Annotated[List[BaseMessage], add_messages]
    
    # User input context
    user_input: str
    user_name: str
    birth_day: int
    birth_month: int
    birth_year: int
    numerology_system: NumerologySystem
    
    # Routing decision
    next_agent: str  # "calculator", "interpreter", "comparison", etc.
    
    # Calculation results (cached)
    calculation_result: dict[str, Any]
    
    # Error tracking
    error: Optional[str]
    
    # Execution metadata
    timestamp: Optional[str]
    execution_id: Optional[str]


class CalculationResult(TypedDict):
    """Result from Calculator Agent."""
    life_path: int
    expression: int
    soul_urge: int
    personality: int
    birthday_number: int
    maturity_number: int
    hidden_passion: int
    subconscious_self: int
    karmic_debt: Optional[int]
    master_numbers: List[int]


class InterpretationResult(TypedDict):
    """Result from Interpretation Agent."""
    profile_summary: str
    life_path_interpretation: str
    expression_interpretation: str
    soul_urge_interpretation: str
    compatibility_notes: Optional[str]
    guidance: str
    confidence_score: float
    sources: List[str]  # For RAG citations


class ComparisonResult(TypedDict):
    """Result from Comparison Agent."""
    person_1_name: str
    person_2_name: str
    compatibility_score: float  # 0-100
    life_path_compatibility: float
    expression_compatibility: float
    soul_urge_compatibility: float
    strengths: List[str]
    challenges: List[str]
    analysis: str


class ForecastResult(TypedDict):
    """Result from Forecast Agent."""
    personal_year: int
    forecast_year: int
    monthly_forecasts: dict[str, Any]  # month -> forecast data
    key_themes: List[str]
    recommendations: List[str]
    challenges: List[str]


class AgentStreamEvent(TypedDict):
    """Event streamed from agents via WebSocket."""
    type: str  # "thinking", "calculating", "interpreting", "complete", "error"
    agent_id: str
    data: dict[str, Any]
    timestamp: str
    execution_id: str


def add_messages(left: List[BaseMessage], right: List[BaseMessage]) -> List[BaseMessage]:
    """
    Reducer function for safely appending messages.
    Prevents silent data loss in concurrent agent updates.
    """
    if not isinstance(right, list):
        right = [right]
    return left + right
