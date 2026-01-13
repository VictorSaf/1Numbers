-- ============================================================================
-- 1Numbers Database Schema
-- ============================================================================
-- PostgreSQL 16+
-- Supports numerology profile caching and agent execution history

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- Profiles Table (Cached Numerology Calculations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    birth_date DATE NOT NULL,
    system VARCHAR(20) DEFAULT 'pythagorean',
    
    -- Core numbers (cached)
    life_path INT,
    expression INT,
    soul_urge INT,
    personality INT,
    birthday_number INT,
    maturity_number INT,
    hidden_passion INT,
    subconscious_self INT,
    
    -- Special cases
    karmic_debt INT,
    master_numbers INT[],
    
    -- Complete profile data (JSON)
    profile_data JSONB NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INT DEFAULT 0
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_name ON profiles(name);
CREATE INDEX idx_profiles_life_path ON profiles(life_path);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- ============================================================================
-- Agent Execution History (Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    execution_id UUID NOT NULL UNIQUE,
    agent_name VARCHAR(50) NOT NULL,  -- calculator, interpreter, comparison, etc.
    request JSONB NOT NULL,
    response JSONB NOT NULL,
    execution_time_ms INT,
    status VARCHAR(20) NOT NULL,  -- success, error, timeout
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_executions_user_id ON agent_executions(user_id);
CREATE INDEX idx_executions_agent_name ON agent_executions(agent_name);
CREATE INDEX idx_executions_status ON agent_executions(status);
CREATE INDEX idx_executions_created_at ON agent_executions(created_at);

-- ============================================================================
-- Comparisons Table (Compatibility Analysis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    profile_2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Compatibility scores
    total_score FLOAT,
    life_path_compat FLOAT,
    expression_compat FLOAT,
    soul_urge_compat FLOAT,
    
    -- Analysis
    analysis JSONB NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comparisons_user_id ON comparisons(user_id);
CREATE INDEX idx_comparisons_profiles ON comparisons(profile_1_id, profile_2_id);
CREATE INDEX idx_comparisons_total_score ON comparisons(total_score);

-- ============================================================================
-- MCP Servers Registry
-- ============================================================================
CREATE TABLE IF NOT EXISTS mcp_servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    url VARCHAR(255) NOT NULL,
    transport VARCHAR(20) DEFAULT 'http',  -- http, stdio
    tools JSONB DEFAULT '[]',
    resources JSONB DEFAULT '[]',
    last_sync TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'inactive',  -- active, inactive, error
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcp_servers_name ON mcp_servers(name);
CREATE INDEX idx_mcp_servers_status ON mcp_servers(status);

-- ============================================================================
-- Numerology Knowledge Base
-- ============================================================================
CREATE TABLE IF NOT EXISTS numerology_knowledge (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,  -- life_path, expression, compatibility, etc.
    number INT,
    content TEXT NOT NULL,
    source VARCHAR(100),
    embedding vector(384),  -- Nomic embed dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_knowledge_category ON numerology_knowledge(category);
CREATE INDEX idx_knowledge_number ON numerology_knowledge(number);
CREATE INDEX idx_knowledge_embedding ON numerology_knowledge USING ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- Forecast Data
-- ============================================================================
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    forecast_year INT NOT NULL,
    personal_year INT NOT NULL,
    monthly_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forecasts_profile_id ON forecasts(profile_id);
CREATE INDEX idx_forecasts_year ON forecasts(forecast_year);

-- ============================================================================
-- Create Updated At Trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparisons_updated_at BEFORE UPDATE ON comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_servers_updated_at BEFORE UPDATE ON mcp_servers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE users IS 'User accounts for 1Numbers application';
COMMENT ON TABLE profiles IS 'Cached numerology calculations for quick retrieval';
COMMENT ON TABLE agent_executions IS 'Audit trail of all agent executions for debugging and analysis';
COMMENT ON TABLE comparisons IS 'Compatibility analysis between two numerology profiles';
COMMENT ON TABLE mcp_servers IS 'Registry of connected MCP (Model Context Protocol) servers';
COMMENT ON TABLE numerology_knowledge IS 'Knowledge base for RAG (Retrieval-Augmented Generation) system';
COMMENT ON TABLE forecasts IS 'Year and month forecasts based on personal year numbers';
