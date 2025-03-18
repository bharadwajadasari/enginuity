import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    try {
        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('Database schema created successfully');

        // Insert default evaluation criteria
        const defaultCriteria = [
            {
                name: 'Technical Skills',
                description: 'Proficiency in required technologies and tools',
                weight: 0.25,
                category: 'Technical'
            },
            {
                name: 'Code Quality',
                description: 'Clean, maintainable, and efficient code',
                weight: 0.20,
                category: 'Technical'
            },
            {
                name: 'Problem Solving',
                description: 'Ability to solve complex technical problems',
                weight: 0.15,
                category: 'Technical'
            },
            {
                name: 'Communication',
                description: 'Effective communication with team members',
                weight: 0.15,
                category: 'Soft Skills'
            },
            {
                name: 'Leadership',
                description: 'Ability to lead and mentor others',
                weight: 0.15,
                category: 'Soft Skills'
            },
            {
                name: 'Innovation',
                description: 'Contributing new ideas and improvements',
                weight: 0.10,
                category: 'Technical'
            }
        ];

        for (const criteria of defaultCriteria) {
            await pool.query(
                'INSERT INTO evaluation_criteria (name, description, weight, category) VALUES ($1, $2, $3, $4)',
                [criteria.name, criteria.description, criteria.weight, criteria.category]
            );
        }
        console.log('Default evaluation criteria inserted successfully');

    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    }
}

setupDatabase(); 