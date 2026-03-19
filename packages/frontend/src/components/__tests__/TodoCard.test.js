import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: '2025-12-25',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo title and due date', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
  });

  it('should render unchecked checkbox when todo is incomplete', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when todo is complete', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show edit button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should apply completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    const { container } = render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const card = container.querySelector('.todo-card');
    expect(card).toHaveClass('completed');
  });

  it('should not render due date when dueDate is null', () => {
    const todoNoDate = { ...mockTodo, dueDate: null };
    render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });
});

describe('Overdue indicator — User Story 1', () => {
  const TODAY = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const handlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  it('past due date + incomplete → card has class overdue and "Overdue" text is visible', () => {
    const todo = { id: 10, title: 'Past Due Task', dueDate: '2020-01-01', completed: 0, createdAt: '2020-01-01T00:00:00Z' };
    const { container } = render(<TodoCard todo={todo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).toHaveClass('overdue');
    expect(container.querySelector('.overdue-badge')).toBeInTheDocument();
  });

  it('future due date + incomplete → no overdue class, no "Overdue" text', () => {
    const todo = { id: 11, title: 'Future Task', dueDate: '2099-12-31', completed: 0, createdAt: '2020-01-01T00:00:00Z' };
    const { container } = render(<TodoCard todo={todo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(container.querySelector('.overdue-badge')).not.toBeInTheDocument();
  });

  it("today's date + incomplete → no overdue class, no \"Overdue\" text", () => {
    const todo = { id: 12, title: 'Due Today Task', dueDate: TODAY, completed: 0, createdAt: '2020-01-01T00:00:00Z' };
    const { container } = render(<TodoCard todo={todo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(container.querySelector('.overdue-badge')).not.toBeInTheDocument();
  });

  it('past due date + completed → no overdue class, no "Overdue" text', () => {
    const todo = { id: 13, title: 'Completed Past Task', dueDate: '2020-01-01', completed: 1, createdAt: '2020-01-01T00:00:00Z' };
    const { container } = render(<TodoCard todo={todo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(container.querySelector('.overdue-badge')).not.toBeInTheDocument();
  });

  it('null due date + incomplete → no overdue class, no "Overdue" text', () => {
    const todo = { id: 14, title: 'No Date Task', dueDate: null, completed: 0, createdAt: '2020-01-01T00:00:00Z' };
    const { container } = render(<TodoCard todo={todo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(container.querySelector('.overdue-badge')).not.toBeInTheDocument();
  });
});

describe('Overdue indicator — User Story 2 (dynamic due date change)', () => {
  const handlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  it('overdue todo re-rendered with future due date → overdue class and "Overdue" text removed', () => {
    const overdueTodo = { id: 20, title: 'Task', dueDate: '2020-01-01', completed: 0, createdAt: '2020-01-01T00:00:00Z' };
    const { container, rerender } = render(<TodoCard todo={overdueTodo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).toHaveClass('overdue');

    const futureTodo = { ...overdueTodo, dueDate: '2099-12-31' };
    rerender(<TodoCard todo={futureTodo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(container.querySelector('.overdue-badge')).not.toBeInTheDocument();
  });

  it('non-overdue todo re-rendered with past due date → overdue class and "Overdue" text appear', () => {
    const futureTodo = { id: 21, title: 'Task', dueDate: '2099-12-31', completed: 0, createdAt: '2020-01-01T00:00:00Z' };
    const { container, rerender } = render(<TodoCard todo={futureTodo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');

    const overdueTodo = { ...futureTodo, dueDate: '2020-01-01' };
    rerender(<TodoCard todo={overdueTodo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).toHaveClass('overdue');
    expect(container.querySelector('.overdue-badge')).toBeInTheDocument();
  });
});

describe('Overdue indicator — User Story 3 (completion toggle)', () => {
  const handlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  it('overdue todo re-rendered with completed: 1 → overdue class and "Overdue" text removed', () => {
    const overdueTodo = { id: 30, title: 'Task', dueDate: '2020-01-01', completed: 0, createdAt: '2020-01-01T00:00:00Z' };
    const { container, rerender } = render(<TodoCard todo={overdueTodo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).toHaveClass('overdue');

    const completedTodo = { ...overdueTodo, completed: 1 };
    rerender(<TodoCard todo={completedTodo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(container.querySelector('.overdue-badge')).not.toBeInTheDocument();
  });

  it('completed overdue todo re-rendered with completed: 0 → overdue class and "Overdue" text reappear', () => {
    const completedTodo = { id: 31, title: 'Task', dueDate: '2020-01-01', completed: 1, createdAt: '2020-01-01T00:00:00Z' };
    const { container, rerender } = render(<TodoCard todo={completedTodo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');

    const incompleteTodo = { ...completedTodo, completed: 0 };
    rerender(<TodoCard todo={incompleteTodo} {...handlers} isLoading={false} />);
    expect(container.querySelector('.todo-card')).toHaveClass('overdue');
    expect(container.querySelector('.overdue-badge')).toBeInTheDocument();
  });
});
