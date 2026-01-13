import asyncio
import httpx
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)

class MCPClientManager:
    """Manages multiple MCP servers with tool discovery and caching"""
    
    def __init__(self, config, redis_client: aioredis.Redis):
        self.config = config
        self.redis = redis_client
        self.servers: Dict[str, httpx.AsyncClient] = {}
        self.tool_cache: Dict[str, Any] = {}
        self.tool_cache_ttl = 3600  # 1 hour
    
    async def initialize(self):
        """Initialize connections to all MCP servers"""
        for server_name, server_config in self.config.MCP_SERVERS.items():
            try:
                client = httpx.AsyncClient(
                    base_url=server_config['url'],
                    timeout=server_config['timeout']
                )
                self.servers[server_name] = client
                logger.info(f"✅ Connected to MCP server: {server_name}")
                
                # Cache tools on startup
                await self._sync_tools(server_name)
            
            except Exception as e:
                logger.error(f"❌ Failed to connect to {server_name}: {e}")
    
    async def get_all_tools(self) -> List[Dict[str, Any]]:
        """Get all tools from all MCP servers"""
        all_tools = []
        
        for server_name in self.servers:
            try:
                # Check cache first
                cache_key = f"mcp_tools:{server_name}"
                cached = await self.redis.get(cache_key)
                
                if cached:
                    tools = json.loads(cached)
                    logger.info(f"📦 Loaded {len(tools)} tools from cache: {server_name}")
                else:
                    tools = await self._fetch_tools(server_name)
                    # Cache for 1 hour
                    await self.redis.setex(
                        cache_key,
                        self.tool_cache_ttl,
                        json.dumps(tools)
                    )
                
                for tool in tools:
                    tool['mcp_server'] = server_name
                    all_tools.append(tool)
            
            except Exception as e:
                logger.error(f"Error fetching tools from {server_name}: {e}")
        
        return all_tools
    
    async def _fetch_tools(self, server_name: str) -> List[Dict[str, Any]]:
        """Fetch tools from a specific MCP server"""
        try:
            client = self.servers.get(server_name)
            if not client:
                return []
            
            response = await client.post("/mcp/tools/list")
            response.raise_for_status()
            
            data = response.json()
            tools = data.get('tools', [])
            
            logger.info(f"🔍 Discovered {len(tools)} tools from {server_name}")
            return tools
        
        except Exception as e:
            logger.error(f"Failed to fetch tools from {server_name}: {e}")
            return []
    
    async def call_tool(
        self, 
        tool_name: str, 
        arguments: Dict[str, Any],
        server_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Call a specific tool on an MCP server"""
        
        # If server not specified, search all servers
        if not server_name:
            for srv_name in self.servers:
                tools = await self._fetch_tools(srv_name)
                if any(t['name'] == tool_name for t in tools):
                    server_name = srv_name
                    break
        
        if not server_name:
            raise ValueError(f"Tool {tool_name} not found on any server")
        
        try:
            client = self.servers.get(server_name)
            if not client:
                raise ValueError(f"Server {server_name} not initialized")
            
            response = await client.post(
                "/mcp/tools/call",
                json={
                    "name": tool_name,
                    "arguments": arguments
                }
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"✅ Tool executed: {tool_name} on {server_name}")
            
            return {
                'success': True,
                'tool': tool_name,
                'server': server_name,
                'result': result.get('content'),
                'execution_time': result.get('execution_time_ms')
            }
        
        except Exception as e:
            logger.error(f"Tool execution failed: {tool_name}: {e}")
            return {
                'success': False,
                'tool': tool_name,
                'server': server_name,
                'error': str(e)
            }
    
    async def _sync_tools(self, server_name: str):
        """Sync tools from a server and store in database"""
        try:
            tools = await self._fetch_tools(server_name)
            
            # Store in cache and database
            cache_key = f"mcp_tools:{server_name}"
            await self.redis.setex(
                cache_key,
                self.tool_cache_ttl,
                json.dumps(tools)
            )
            
            # Update MCP server registry in database
            # This would be done via a database connection
            logger.info(f"✅ Synced {len(tools)} tools for {server_name}")
        
        except Exception as e:
            logger.error(f"Failed to sync tools for {server_name}: {e}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of all MCP servers"""
        health_status = {}
        
        for server_name, client in self.servers.items():
            try:
                response = await client.get("/health", timeout=5)
                health_status[server_name] = {
                    'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                    'response_time_ms': int(response.elapsed.total_seconds() * 1000)
                }
            except Exception as e:
                health_status[server_name] = {
                    'status': 'unavailable',
                    'error': str(e)
                }
        
        return health_status
    
    async def close(self):
        """Close all client connections"""
        for client in self.servers.values():
            await client.aclose()
