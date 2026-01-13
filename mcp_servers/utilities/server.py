import mcp.server as mcp
from mcp.types import Tool, TextContent, ToolResult
import json
import logging
from typing import Any, List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

# Initialize MCP server
app = mcp.Server("numerology-utilities")

@app.list_tools()
async def list_tools():
    """List available utility tools"""
    return [
        Tool(
            name="calculate_life_path",
            description="Calculate life path number from birth date",
            inputSchema={
                "type": "object",
                "properties": {
                    "day": {"type": "integer", "description": "Day of birth (1-31)"},
                    "month": {"type": "integer", "description": "Month of birth (1-12)"},
                    "year": {"type": "integer", "description": "Year of birth"}
                },
                "required": ["day", "month", "year"]
            }
        ),
        Tool(
            name="calculate_expression_number",
            description="Calculate expression number from full name",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Full name"}
                },
                "required": ["name"]
            }
        ),
        Tool(
            name="calculate_destiny_number",
            description="Calculate destiny number from full birth name",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Full birth name"}
                },
                "required": ["name"]
            }
        ),
        Tool(
            name="analyze_numerology_profile",
            description="Create complete numerology profile",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Full name"},
                    "day": {"type": "integer"},
                    "month": {"type": "integer"},
                    "year": {"type": "integer"},
                    "include_pinnacles": {"type": "boolean", "default": True},
                    "include_challenges": {"type": "boolean", "default": True}
                },
                "required": ["name", "day", "month", "year"]
            }
        ),
        Tool(
            name="batch_calculate",
            description="Calculate multiple profiles in batch",
            inputSchema={
                "type": "object",
                "properties": {
                    "profiles": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "day": {"type": "integer"},
                                "month": {"type": "integer"},
                                "year": {"type": "integer"}
                            }
                        }
                    }
                },
                "required": ["profiles"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> ToolResult:
    """Execute utility tools"""
    
    try:
        if name == "calculate_life_path":
            result = await calculate_life_path(
                day=arguments["day"],
                month=arguments["month"],
                year=arguments["year"]
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result))]
            )
        
        elif name == "calculate_expression_number":
            result = await calculate_expression_number(
                name=arguments["name"]
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result))]
            )
        
        elif name == "calculate_destiny_number":
            result = await calculate_destiny_number(
                name=arguments["name"]
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result))]
            )
        
        elif name == "analyze_numerology_profile":
            result = await analyze_numerology_profile(
                name=arguments["name"],
                day=arguments["day"],
                month=arguments["month"],
                year=arguments["year"],
                include_pinnacles=arguments.get("include_pinnacles", True),
                include_challenges=arguments.get("include_challenges", True)
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result))]
            )
        
        elif name == "batch_calculate":
            result = await batch_calculate(
                profiles=arguments["profiles"]
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result))]
            )
        
        else:
            raise ValueError(f"Unknown tool: {name}")
    
    except Exception as e:
        logger.error(f"Tool execution error: {e}")
        return ToolResult(
            content=[TextContent(type="text", text=f"Error: {str(e)}")],
            isError=True
        )

# Tool implementations
async def calculate_life_path(day: int, month: int, year: int) -> dict:
    """Calculate life path number"""
    # Simplified calculation (actual implementation would be more complex)
    total = day + month + year
    while total >= 10 and total not in [11, 22, 33]:
        total = sum(int(d) for d in str(total))
    
    interpretations = {
        1: "Independence, leadership, pioneering",
        2: "Cooperation, balance, intuition",
        3: "Creativity, self-expression, communication",
        4: "Stability, practicality, hard work",
        5: "Freedom, adaptability, dynamic change",
        6: "Responsibility, harmony, nurturing",
        7: "Introspection, analysis, spiritual awakening",
        8: "Material success, power, abundance",
        9: "Compassion, humanitarian, wisdom",
        11: "Intuition, inspiration, enlightenment",
        22: "Master builder, practicality, global vision",
        33: "Master teacher, compassion, guidance"
    }
    
    return {
        'life_path_number': total,
        'interpretation': interpretations.get(total, 'Unknown'),
        'calculation': f"{day} + {month} + {year} = {total}",
        'is_master_number': total in [11, 22, 33]
    }

async def calculate_expression_number(name: str) -> dict:
    """Calculate expression number from name"""
    # Convert name to numerology value
    letter_values = {
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
        's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
    }
    
    total = sum(letter_values.get(c.lower(), 0) for c in name if c.isalpha())
    while total >= 10 and total not in [11, 22, 33]:
        total = sum(int(d) for d in str(total))
    
    return {
        'name': name,
        'expression_number': total,
        'description': 'Your natural talents and abilities',
        'calculation_details': {
            'letter_sum': sum(letter_values.get(c.lower(), 0) for c in name if c.isalpha()),
            'reduced': total
        }
    }

async def calculate_destiny_number(name: str) -> dict:
    """Calculate destiny number"""
    # Uses full birth name
    letter_values = {
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
        's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
    }
    
    total = sum(letter_values.get(c.lower(), 0) for c in name if c.isalpha())
    while total >= 10 and total not in [11, 22, 33]:
        total = sum(int(d) for d in str(total))
    
    return {
        'name': name,
        'destiny_number': total,
        'description': 'Your life purpose and calling',
        'meaning': 'The number you were meant to express in this lifetime'
    }

async def analyze_numerology_profile(name: str, day: int, month: int, year: int, 
                                     include_pinnacles: bool, include_challenges: bool) -> dict:
    """Create complete numerology profile"""
    
    life_path = await calculate_life_path(day, month, year)
    expression = await calculate_expression_number(name)
    destiny = await calculate_destiny_number(name)
    
    profile = {
        'name': name,
        'birth_date': f"{day:02d}/{month:02d}/{year}",
        'profile': {
            'life_path': life_path,
            'expression_number': expression['expression_number'],
            'destiny_number': destiny['destiny_number']
        },
        'compatibility': {
            'best_matches': [2, 5, 7, 9],
            'challenging_matches': [4, 8]
        },
        'timestamp': datetime.now().isoformat()
    }
    
    if include_pinnacles:
        profile['pinnacle_cycles'] = {
            'first_pinnacle': {'age': '0-36', 'focus': 'Foundation'},
            'second_pinnacle': {'age': '36-45', 'focus': 'Development'},
            'third_pinnacle': {'age': '45+', 'focus': 'Culmination'}
        }
    
    if include_challenges:
        profile['challenge_numbers'] = {
            'first_challenge': 3,
            'second_challenge': 7,
            'third_challenge': 5
        }
    
    return profile

async def batch_calculate(profiles: List[Dict[str, Any]]) -> dict:
    """Calculate multiple profiles"""
    
    results = []
    errors = []
    
    for i, profile_data in enumerate(profiles):
        try:
            result = await analyze_numerology_profile(
                name=profile_data['name'],
                day=profile_data['day'],
                month=profile_data['month'],
                year=profile_data['year']
            )
            results.append(result)
        except Exception as e:
            errors.append({
                'index': i,
                'profile': profile_data,
                'error': str(e)
            })
    
    return {
        'total_processed': len(profiles),
        'successful': len(results),
        'failed': len(errors),
        'results': results,
        'errors': errors if errors else [],
        'timestamp': datetime.now().isoformat()
    }

if __name__ == "__main__":
    import asyncio
    asyncio.run(mcp.run_server(app))
