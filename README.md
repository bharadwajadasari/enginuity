# Enginuity - Engineer Calibration & Evaluation System

A modern web application for managing engineer performance evaluations and calibrations. Built with React, Node.js, and PostgreSQL.

## Features

- Engineer Management
  - Add and manage engineer profiles
  - Track engineer performance history
  - Store last year's ratings

- Calibration System
  - Conduct calibration sessions
  - Compare engineer performance
  - Generate calibration reports
  - Export evaluations to Word documents

- Evaluation System
  - Comprehensive performance assessment
  - Multiple evaluation criteria
  - Detailed write-ups and assessments
  - Technical delivery tracking

## Tech Stack

- Frontend:
  - React with Vite
  - Modern UI components
  - Responsive design

- Backend:
  - Node.js with Express
  - PostgreSQL database
  - OpenAI integration for enhanced features

## Prerequisites

- Node.js (v23.10.0 or higher)
- PostgreSQL
- OpenAI API key (for certain features)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bharadwajadasari/enginuity.git
cd enginuity
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
OPENAI_API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here
```

4. Initialize the database:
```bash
npm run init-db
```

## Development

Start the development server:
```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers concurrently:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Testing

The application includes a comprehensive test suite covering frontend components, API endpoints, and database operations.

### Test Setup

1. Create a test database:
```bash
createdb enginuity_test
```

2. Run database migrations on the test database:
```bash
DATABASE_URL=postgresql://test:test@localhost:5432/enginuity_test npm run setup-db
```

### Running Tests

The following npm scripts are available for running tests:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI environment
npm run test:ci

# Run specific test suites
npm run test:frontend  # Frontend tests only
npm run test:backend  # Backend tests only
npm run test:api      # API tests only
npm run test:db       # Database tests only
```

### Test Structure

- **Frontend Tests** (`src/components/__tests__/`):
  - Component rendering tests
  - User interaction tests
  - State management tests
  - Integration tests

- **API Tests** (`server/__tests__/api/`):
  - Endpoint functionality tests
  - Request/response validation
  - Error handling tests
  - Authentication tests

- **Database Tests** (`server/__tests__/db/`):
  - CRUD operation tests
  - Data validation tests
  - Transaction tests
  - Error handling tests

### Test Coverage

The project maintains a minimum test coverage threshold of 80% across:
- Branches
- Functions
- Lines
- Statements

Coverage reports can be generated using `npm run test:coverage`.

## Database Setup

The application uses PostgreSQL with the following main tables:
- `engineers`: Stores engineer information
- `evaluations`: Stores performance evaluations
- `calibration_sessions`: Manages calibration meetings
- `evaluation_criteria`: Defines evaluation metrics

## API Endpoints

### Engineers
- `GET /api/engineers`: List all engineers
- `POST /api/engineers`: Add a new engineer
- `GET /api/engineers/:id`: Get engineer details
- `PUT /api/engineers/:id`: Update engineer information

### Calibration
- `GET /api/calibration`: List calibration sessions
- `POST /api/calibration`: Create new calibration session
- `GET /api/calibration/:id`: Get calibration details
- `POST /api/calibration/:id/export`: Export calibration report

### Evaluation
- `GET /api/evaluation`: List evaluations
- `POST /api/evaluation`: Create new evaluation
- `GET /api/evaluation/:id`: Get evaluation details
- `PUT /api/evaluation/:id`: Update evaluation

## Contributing

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "Description of your changes"
```

3. Push to your branch:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

## License

This project is licensed under the MIT License - see the LICENSE file for details.
