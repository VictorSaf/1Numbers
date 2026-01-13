"""MCP Server Configuration"""
import os
from typing import Dict, Any
from dataclasses import dataclass

@dataclass
class MCPServerConfig:
    """Configuration for a single MCP server"""
    name: str
    url: str
    timeout: int = 30
    retries: int = 3
    health_check_interval: int = 300

class MCPConfiguration:
    """Master MCP configuration"""
    
    def __init__(self):
        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.TOOL_CACHE_TTL = int(os.getenv("TOOL_CACHE_TTL", "3600"))
        
        # Configure MCP servers
        self.MCP_SERVERS = {
            "research": MCPServerConfig(
                name="research",
                url=os.getenv("MCP_RESEARCH_URL", "http://localhost:5001"),
                timeout=30
            ),
            "knowledge": MCPServerConfig(
                name="knowledge",
                url=os.getenv("MCP_KNOWLEDGE_URL", "http://localhost:5002"),
                timeout=30
            ),
            "utilities": MCPServerConfig(
                name="utilities",
                url=os.getenv("MCP_UTILITIES_URL", "http://localhost:5003"),
                timeout=30
            )
        }
        
        # Research agent config
        self.RESEARCH_CONFIG = {
            "discovery_categories": [
                "cycles",
                "compatibility",
                "personality",
                "life_purpose",
                "karmic_patterns",
                "timing",
                "forecasting"
            ],
            "validation_confidence_threshold": 0.7,
            "auto_discovery_interval": 86400,  # 24 hours
            "max_utilities_per_category": 10
        }
        
        # Tool execution config
        self.TOOL_EXECUTION_CONFIG = {
            "max_concurrent_tools": 5,
            "tool_timeout": 30,
            "retry_strategy": "exponential_backoff",
            "max_retries": 3,
            "retry_delay": 1,  # seconds
            "fallback_to_cache": True
        }
        
        # Monitoring and observability
        self.MONITORING_CONFIG = {
            "log_tool_execution": True,
            "track_execution_time": True,
            "alert_on_failures": True,
            "metrics_enabled": True,
            "trace_enabled": True
        }
    
    def get_server_config(self, server_name: str) -> MCPServerConfig:
        """Get configuration for a specific server"""
        return self.MCP_SERVERS.get(server_name)
    
    def get_all_servers(self) -> Dict[str, MCPServerConfig]:
        """Get all server configurations"""
        return self.MCP_SERVERS

# Global configuration instance
mcp_config = MCPConfiguration()
