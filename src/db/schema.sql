-- Drop existing tables if they exist
DROP TABLE IF EXISTS promotion_history CASCADE;
DROP TABLE IF EXISTS evaluation_scores CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS evaluation_criteria CASCADE;
DROP TABLE IF EXISTS communication_ratings CASCADE;
DROP TABLE IF EXISTS technical_delivery_ratings CASCADE;
DROP TABLE IF EXISTS calibration_ratings CASCADE;
DROP TABLE IF EXISTS engineers CASCADE;

-- Create engineers table
CREATE TABLE engineers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    "current_role" VARCHAR(100) NOT NULL,
    "current_level" VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    time_in_role INTEGER NOT NULL,
    last_year_rating VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create calibration_ratings table
CREATE TABLE calibration_ratings (
    id SERIAL PRIMARY KEY,
    engineer_id INTEGER REFERENCES engineers(id),
    evaluator_id INTEGER REFERENCES engineers(id) NULL,
    evaluation_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create technical_delivery_ratings table
CREATE TABLE technical_delivery_ratings (
    id SERIAL PRIMARY KEY,
    calibration_rating_id INTEGER REFERENCES calibration_ratings(id),
    code_quality DECIMAL(3,2) NOT NULL CHECK (code_quality >= 1 AND code_quality <= 5),
    timeliness_of_delivery DECIMAL(3,2) NOT NULL CHECK (timeliness_of_delivery >= 1 AND timeliness_of_delivery <= 5),
    architectural_proficiency DECIMAL(3,2) NOT NULL CHECK (architectural_proficiency >= 1 AND architectural_proficiency <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create communication_ratings table
CREATE TABLE communication_ratings (
    id SERIAL PRIMARY KEY,
    calibration_rating_id INTEGER REFERENCES calibration_ratings(id),
    effective_communication DECIMAL(3,2) NOT NULL CHECK (effective_communication >= 1 AND effective_communication <= 5),
    cross_team_collaboration DECIMAL(3,2) NOT NULL CHECK (cross_team_collaboration >= 1 AND cross_team_collaboration <= 5),
    architecture_influence DECIMAL(3,2) NOT NULL CHECK (architecture_influence >= 1 AND architecture_influence <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create evaluation_criteria table
CREATE TABLE evaluation_criteria (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    weight DECIMAL(5,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create evaluations table
CREATE TABLE evaluations (
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
CREATE TABLE evaluation_scores (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER REFERENCES evaluations(id),
    criteria_id INTEGER REFERENCES evaluation_criteria(id),
    score DECIMAL(5,2) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create promotion_history table
CREATE TABLE promotion_history (
    id SERIAL PRIMARY KEY,
    engineer_id INTEGER REFERENCES engineers(id),
    previous_role VARCHAR(100) NOT NULL,
    new_role VARCHAR(100) NOT NULL,
    promotion_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_engineers_email ON engineers(email);
CREATE INDEX idx_calibration_ratings_engineer_id ON calibration_ratings(engineer_id);
CREATE INDEX idx_calibration_ratings_evaluator_id ON calibration_ratings(evaluator_id);
CREATE INDEX idx_technical_delivery_ratings_calibration_id ON technical_delivery_ratings(calibration_rating_id);
CREATE INDEX idx_communication_ratings_calibration_id ON communication_ratings(calibration_rating_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_engineers_updated_at
    BEFORE UPDATE ON engineers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calibration_ratings_updated_at
    BEFORE UPDATE ON calibration_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technical_delivery_ratings_updated_at
    BEFORE UPDATE ON technical_delivery_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_ratings_updated_at
    BEFORE UPDATE ON communication_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 