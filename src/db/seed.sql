-- Insert evaluation criteria
INSERT INTO evaluation_criteria (name, description, weight, category) VALUES
('Technical Skills', 'Demonstrates strong technical capabilities and problem-solving abilities', 0.3, 'Technical'),
('Code Quality', 'Produces clean, maintainable, and well-tested code', 0.2, 'Technical'),
('Project Delivery', 'Consistently delivers projects on time and within scope', 0.2, 'Delivery'),
('Communication', 'Effectively communicates technical concepts and project status', 0.15, 'Soft Skills'),
('Team Collaboration', 'Works well with team members and contributes to team success', 0.15, 'Soft Skills');

-- Insert sample engineers
INSERT INTO engineers (
    "first_name", "last_name", "email", "current_role", "current_level", 
    "department", "start_date", "time_in_role", "last_year_rating"
) VALUES
('John', 'Doe', 'john.doe@company.com', 'Senior Software Engineer', 'L5', 
    'Engineering', '2020-01-15', 24, 'Exceed Expectations'),
('Jane', 'Smith', 'jane.smith@company.com', 'Software Engineer', 'L4', 
    'Engineering', '2021-03-01', 12, 'Meets Expectations'),
('Mike', 'Johnson', 'mike.johnson@company.com', 'Staff Engineer', 'L6', 
    'Engineering', '2019-06-10', 33, 'Exceed Expectations'),
('Sarah', 'Williams', 'sarah.williams@company.com', 'Senior Software Engineer', 'L5', 
    'Engineering', '2020-08-20', 19, 'Meets Expectations'),
('David', 'Brown', 'david.brown@company.com', 'Software Engineer', 'L4', 
    'Engineering', '2022-01-05', 14, 'Meets Expectations'); 