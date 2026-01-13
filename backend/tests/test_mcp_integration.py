"""Tests for MCP integration"""
import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from backend.mcp.client_manager import MCPClientManager
from backend.agents.research import ResearchAgent


class TestMCPClientManager:
    """Tests for MCP client manager"""
    
    @pytest.fixture
    async def mcp_client(self):
        """Initialize MCP client"""
        config = MagicMock()
        config.MCP_SERVERS = {
            "research": {"url": "http://localhost:5001", "timeout": 30}
        }
        redis = AsyncMock()
        return MCPClientManager(config, redis)
    
    @pytest.mark.asyncio
    async def test_initialize_servers(self, mcp_client):
        """Test server initialization"""
        with patch('httpx.AsyncClient') as mock_client:
            await mcp_client.initialize()
            assert len(mcp_client.servers) > 0
    
    @pytest.mark.asyncio
    async def test_tool_caching(self, mcp_client):
        """Test tool definition caching"""
        mcp_client.redis.get = AsyncMock(return_value=json.dumps([
            {"name": "test_tool", "description": "Test"}
        ]))
        
        tools = await mcp_client.get_all_tools()
        assert len(tools) > 0
        assert tools[0]['name'] == "test_tool"
    
    @pytest.mark.asyncio
    async def test_tool_execution_success(self, mcp_client):
        """Test successful tool execution"""
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            'content': {'results': []},
            'execution_time_ms': 100
        }
        
        with patch.object(mcp_client, '_fetch_tools', return_value=[
            {"name": "search_numerology_knowledge"}
        ]):
            result = await mcp_client.call_tool(
                "search_numerology_knowledge",
                {"query": "life path"}
            )
            assert result['success'] is True
    
    @pytest.mark.asyncio
    async def test_tool_execution_failure(self, mcp_client):
        """Test tool execution error handling"""
        with patch.object(mcp_client, '_fetch_tools', return_value=[]):
            result = await mcp_client.call_tool(
                "nonexistent_tool",
                {}
            )
            assert result['success'] is False
            assert 'error' in result
    
    @pytest.mark.asyncio
    async def test_health_check(self, mcp_client):
        """Test server health checking"""
        mock_client = AsyncMock()
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.elapsed.total_seconds.return_value = 0.045
        mock_client.get = AsyncMock(return_value=mock_response)
        
        mcp_client.servers["research"] = mock_client
        health = await mcp_client.health_check()
        
        assert "research" in health
        assert health["research"]["status"] == "healthy"


class TestResearchAgent:
    """Tests for research agent"""
    
    @pytest.fixture
    def research_agent(self):
        """Initialize research agent"""
        mcp_client = AsyncMock()
        llm = AsyncMock()
        rag_system = AsyncMock()
        return ResearchAgent(mcp_client, llm, rag_system)
    
    @pytest.mark.asyncio
    async def test_scan_for_utilities(self, research_agent):
        """Test utility scanning"""
        research_agent.mcp.call_tool = AsyncMock(return_value={
            'success': True,
            'result': {
                'discovered_utilities': [
                    {
                        'name': 'Test Utility',
                        'description': 'A test utility',
                        'accuracy': 0.95
                    }
                ]
            }
        })
        
        utilities = await research_agent._scan_for_utilities()
        assert len(utilities) > 0
        assert utilities[0]['name'] == 'Test Utility'
    
    @pytest.mark.asyncio
    async def test_validate_utilities(self, research_agent):
        """Test utility validation"""
        utilities = [{
            'name': 'Test Utility',
            'description': 'Test',
            'accuracy': 0.95
        }]
        
        research_agent.llm.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({"valid": True, "confidence": 0.85})
        ))
        
        validated = await research_agent._validate_utilities(utilities)
        assert len(validated) > 0
        assert 'validation' in validated[0]
    
    @pytest.mark.asyncio
    async def test_research_number(self, research_agent):
        """Test number research"""
        research_agent.mcp.call_tool = AsyncMock(return_value={
            'success': True,
            'result': {
                'number': 7,
                'patterns_found': ['Pattern 1']
            }
        })
        research_agent.rag.retrieve = AsyncMock(return_value=[
            {'content': 'Life path 7 information'}
        ])
        
        result = await research_agent.research_number(7, 'life_path')
        assert result['number'] == 7
        assert 'analysis' in result
        assert 'rag_context' in result
    
    @pytest.mark.asyncio
    async def test_validate_interpretation(self, research_agent):
        """Test interpretation validation"""
        research_agent.mcp.call_tool = AsyncMock(return_value={
            'success': True,
            'result': {'validated': True, 'confidence': 0.87}
        })
        
        result = await research_agent.validate_interpretation(
            "Life path 7 is spiritual",
            7
        )
        assert result['success'] is True


class TestDiscoveryWorkflow:
    """Tests for complete discovery workflow"""
    
    @pytest.fixture
    def research_agent(self):
        """Initialize agent for workflow test"""
        mcp_client = AsyncMock()
        llm = AsyncMock()
        rag_system = AsyncMock()
        return ResearchAgent(mcp_client, llm, rag_system)
    
    @pytest.mark.asyncio
    async def test_full_discovery_workflow(self, research_agent):
        """Test complete 4-phase discovery"""
        # Phase 1: Scan
        research_agent.mcp.call_tool = AsyncMock(return_value={
            'success': True,
            'result': {'discovered_utilities': [{'name': 'Test', 'accuracy': 0.95}]}
        })
        
        # Phase 2: Validate
        research_agent.llm.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({"valid": True, "confidence": 0.85})
        ))
        
        # Phase 3: Integrate (no-op in test)
        # Phase 4: Update KB
        research_agent.rag.ingest_document = AsyncMock()
        
        result = await research_agent.discover_and_integrate_utilities()
        
        assert result['status'] == 'complete'
        assert result['new_utilities_found'] > 0
        assert result['validated'] > 0


# Integration tests
@pytest.mark.asyncio
class TestMCPIntegration:
    """Integration tests with real MCP servers (if available)"""
    
    async def test_mcp_server_connectivity(self):
        """Test connection to MCP servers"""
        config = MagicMock()
        config.MCP_SERVERS = {
            "research": {"url": "http://localhost:5001", "timeout": 5}
        }
        redis = AsyncMock()
        
        mcp = MCPClientManager(config, redis)
        
        try:
            await mcp.initialize()
            # If we get here, servers are running
            assert len(mcp.servers) > 0
        except Exception as e:
            pytest.skip(f"MCP servers not running: {e}")


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
