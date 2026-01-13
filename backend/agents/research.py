import asyncio
import json
from typing import Dict, List, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ResearchAgent:
    """Autonomous research agent that discovers new utilities via MCP"""
    
    def __init__(self, mcp_client, llm, rag_system):
        self.mcp = mcp_client
        self.llm = llm
        self.rag = rag_system
    
    async def discover_and_integrate_utilities(self) -> Dict[str, Any]:
        """Main research workflow"""
        
        logger.info("🔬 Starting autonomous research...")
        
        # Phase 1: Scan for new utilities
        logger.info("Phase 1: Scanning for new utilities...")
        new_utilities = await self._scan_for_utilities()
        
        # Phase 2: Validate discovered utilities
        logger.info("Phase 2: Validating utilities...")
        validated = await self._validate_utilities(new_utilities)
        
        # Phase 3: Integrate into system
        logger.info("Phase 3: Integrating utilities...")
        integrated = await self._integrate_utilities(validated)
        
        # Phase 4: Update knowledge base
        logger.info("Phase 4: Updating knowledge base...")
        await self._update_knowledge_base(integrated)
        
        return {
            'status': 'complete',
            'new_utilities_found': len(new_utilities),
            'validated': len(validated),
            'integrated': len(integrated),
            'timestamp': datetime.now().isoformat()
        }
    
    async def _scan_for_utilities(self) -> List[Dict[str, Any]]:
        """Scan MCP servers for new utilities"""
        
        categories = [
            'cycles',
            'compatibility',
            'personality',
            'life_purpose',
            'karmic_patterns',
            'timing',
            'forecasting'
        ]
        
        discovered = []
        
        for category in categories:
            try:
                # Call research server's discovery tool
                result = await self.mcp.call_tool(
                    'discover_new_utilities',
                    {
                        'category': category,
                        'search_depth': 'medium'
                    },
                    'research'
                )
                
                if result['success']:
                    utilities = result['result'].get('discovered_utilities', [])
                    discovered.extend(utilities)
                    logger.info(f"📍 Found {len(utilities)} utilities for {category}")
            
            except Exception as e:
                logger.error(f"Error scanning {category}: {e}")
        
        return discovered
    
    async def _validate_utilities(self, utilities: List[Dict]) -> List[Dict]:
        """Validate discovered utilities against known data"""
        
        validated = []
        
        for utility in utilities:
            try:
                # Use LLM to validate utility
                validation_prompt = f"""
                Evaluate this numerology utility for validity:
                
                Name: {utility.get('name')}
                Description: {utility.get('description')}
                Accuracy: {utility.get('accuracy', 'unknown')}
                
                Is this a legitimate numerology method? 
                Respond with JSON: {{"valid": bool, "confidence": 0-1, "notes": str}}
                """
                
                response = await self.llm.ainvoke(validation_prompt)
                
                try:
                    validation_result = json.loads(response.content)
                    
                    if validation_result.get('valid', False) and validation_result.get('confidence', 0) > 0.7:
                        utility['validation'] = validation_result
                        validated.append(utility)
                        logger.info(f"✅ Validated: {utility['name']}")
                
                except json.JSONDecodeError:
                    logger.warning(f"Could not parse validation for {utility['name']}")
            
            except Exception as e:
                logger.error(f"Validation error for {utility['name']}: {e}")
        
        return validated
    
    async def _integrate_utilities(self, utilities: List[Dict]) -> List[Dict]:
        """Integrate validated utilities into system"""
        
        integrated = []
        
        for utility in utilities:
            try:
                # Register utility
                utility_id = utility.get('name', '').lower().replace(' ', '_')
                
                # Store in database (pseudo-code)
                # await db.utilities.insert({
                #     'id': utility_id,
                #     'name': utility['name'],
                #     'description': utility['description'],
                #     'implementation_status': 'registered',
                #     'validation': utility.get('validation'),
                #     'registered_at': datetime.now()
                # })
                
                integrated.append(utility)
                logger.info(f"🔧 Integrated utility: {utility['name']}")
            
            except Exception as e:
                logger.error(f"Integration error: {e}")
        
        return integrated
    
    async def _update_knowledge_base(self, utilities: List[Dict]):
        """Update RAG knowledge base with new utilities"""
        
        for utility in utilities:
            try:
                # Create knowledge document
                doc = f"""
                Utility: {utility['name']}
                Description: {utility['description']}
                Category: {utility.get('category', 'general')}
                Accuracy: {utility.get('accuracy', 'unknown')}
                Implementation: {utility.get('implementation_difficulty', 'unknown')}
                
                {utility.get('details', '')}
                """
                
                # Add to RAG system
                await self.rag.ingest_document({
                    'title': utility['name'],
                    'content': doc,
                    'metadata': {
                        'type': 'utility',
                        'validation_score': utility.get('validation', {}).get('confidence', 0),
                        'discovered_at': datetime.now().isoformat()
                    }
                })
                
                logger.info(f"📚 Added to knowledge base: {utility['name']}")
            
            except Exception as e:
                logger.error(f"Knowledge base update error: {e}")
    
    async def research_number(self, number: int, context: str = 'general') -> Dict[str, Any]:
        """Research a specific number"""
        
        try:
            # Call research server
            result = await self.mcp.call_tool(
                'analyze_number_patterns',
                {
                    'number': number,
                    'context': context,
                    'time_period': 'all'
                },
                'research'
            )
            
            if result['success']:
                analysis = result['result']
                
                # Enrich with RAG
                rag_context = await self.rag.retrieve(
                    f"Number {number} {context}",
                    top_k=3
                )
                
                return {
                    'number': number,
                    'context': context,
                    'analysis': analysis,
                    'rag_context': rag_context,
                    'timestamp': datetime.now().isoformat()
                }
            
            else:
                raise Exception(result.get('error', 'Unknown error'))
        
        except Exception as e:
            logger.error(f"Research error: {e}")
            return {'error': str(e)}
    
    async def validate_interpretation(self, interpretation: str, number: int) -> Dict[str, Any]:
        """Validate numerology interpretation against sources"""
        
        try:
            result = await self.mcp.call_tool(
                'validate_numerology_theory',
                {
                    'theory': interpretation,
                    'number': number
                },
                'research'
            )
            
            return result
        
        except Exception as e:
            logger.error(f"Validation error: {e}")
            return {'error': str(e)}
