import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from '../Register';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) =>
    selector({
      users: {
        message: '',
        isSuccess: false,
        isError: false,
      },
    }),
}));

jest.mock('../../features/UserSlice', () => ({
  addUser: jest.fn(),
  resetState: jest.fn(),
}));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (fn) => fn,
    formState: { errors: {} },
  }),
}));

describe('Register Component', () => {
  test('renders registration form', () => {
    render(<Register />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create Password')).toBeInTheDocument();
  });

  test('renders user type toggle buttons', () => {
    render(<Register />);
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Collector')).toBeInTheDocument();
  });

  test('allows switching between user and collector', () => {
    render(<Register />);
    const collectorButton = screen.getByText('Collector');
    fireEvent.click(collectorButton);
    // Should navigate to collector registration
  });

  test('allows typing in form fields', () => {
    render(<Register />);
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create Password'), {
      target: { value: 'password123' },
    });

    expect(screen.getByPlaceholderText('Full Name')).toHaveValue('John Doe');
    expect(screen.getByPlaceholderText('Email')).toHaveValue('john@example.com');
  });

  test('renders logo and brand', () => {
    render(<Register />);
    expect(screen.getByText('ReNova')).toBeInTheDocument();
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });

  test('renders sign in link', () => {
    render(<Register />);
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });
});