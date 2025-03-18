import { render, screen, fireEvent } from '@testing-library/react';
import EngineerCard from '../EngineerCard';

describe('EngineerCard', () => {
  const mockEngineer = {
    id: 1,
    name: 'John Doe',
    level: 'L5',
    department: 'Engineering',
    lastYearRating: 'Exceeds',
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders engineer information correctly', () => {
    render(
      <EngineerCard
        engineer={mockEngineer}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('L5')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Exceeds')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <EngineerCard
        engineer={mockEngineer}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockEngineer);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <EngineerCard
        engineer={mockEngineer}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockEngineer.id);
  });
}); 