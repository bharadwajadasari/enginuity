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
    last_year_rating VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 