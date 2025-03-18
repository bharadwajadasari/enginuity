-- Create engineers table
CREATE TABLE IF NOT EXISTS engineers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    current_role VARCHAR(100) NOT NULL,
    years_of_experience INTEGER NOT NULL,
    time_in_current_role INTEGER NOT NULL,
    department VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create evaluation_criteria table
CREATE TABLE IF NOT EXISTS evaluation_criteria (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    weight DECIMAL(5,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    engineer_id INTEGER REFERENCES engineers(id),
    evaluator_id INTEGER REFERENCES engineers(id),
    evaluation_date DATE NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL,
    performance_status VARCHAR(50) NOT NULL,
    promotion_readiness VARCHAR(50) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create evaluation_scores table
CREATE TABLE IF NOT EXISTS evaluation_scores (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER REFERENCES evaluations(id),
    criteria_id INTEGER REFERENCES evaluation_criteria(id),
    score DECIMAL(5,2) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create promotion_history table
CREATE TABLE IF NOT EXISTS promotion_history (
    id SERIAL PRIMARY KEY,
    engineer_id INTEGER REFERENCES engineers(id),
    previous_role VARCHAR(100) NOT NULL,
    new_role VARCHAR(100) NOT NULL,
    promotion_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_engineers_email ON engineers(email);
CREATE INDEX idx_evaluations_engineer_id ON evaluations(engineer_id);
CREATE INDEX idx_evaluation_scores_evaluation_id ON evaluation_scores(evaluation_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_engineers_updated_at
    BEFORE UPDATE ON engineers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at
    BEFORE UPDATE ON evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 