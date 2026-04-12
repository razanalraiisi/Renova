import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PickupRequest from '../PickupRequest';

jest.mock('react-router-dom', () => ({
  Link: ({ children }) => <span>{children}</span>,
  useNavigate: jest.fn(),
  useLocation: () => ({
    state: { category: 'Pickup', from: '/dashboard' }
  }),
}), { virtual: true });

jest.mock('react-icons/fa', () => ({
  FaArrowLeft: () => <div>arrow</div>,
}));

describe('PickupRequest Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => {
        if (key === 'user') {
          return JSON.stringify({
            uname: 'John Doe',
            email: 'john@example.com',
            phone: '91234567'
          });
        }
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
  });

  test('renders pickup request form', () => {
    render(<PickupRequest />);
    expect(screen.getByText(/schedule your pickup/i)).toBeInTheDocument();
    expect(screen.getByText(/fill in the details below/i)).toBeInTheDocument();
  });

  test('renders form fields', () => {
    render(<PickupRequest />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Select Category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Device')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Condition')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
  });

  test('pre-fills user data from localStorage', async () => {
    render(<PickupRequest />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Name')).toHaveValue('John Doe');
      expect(screen.getByPlaceholderText('Email')).toHaveValue('john@example.com');
      expect(screen.getByPlaceholderText('Phone')).toHaveValue('91234567');
    });
  });

  test('allows typing in form fields', () => {
    render(<PickupRequest />);

    fireEvent.change(screen.getByPlaceholderText('Device'), {
      target: { value: 'Laptop' },
    });
    fireEvent.change(screen.getByPlaceholderText('Condition'), {
      target: { value: 'Working' },
    });
    fireEvent.change(screen.getByPlaceholderText('Address'), {
      target: { value: '123 Main St' },
    });

    expect(screen.getByPlaceholderText('Device')).toHaveValue('Laptop');
    expect(screen.getByPlaceholderText('Condition')).toHaveValue('Working');
    expect(screen.getByPlaceholderText('Address')).toHaveValue('123 Main St');
  });

  test('renders device category options', () => {
    render(<PickupRequest />);
    const select = screen.getByDisplayValue('Select Category');
    expect(select).toBeInTheDocument();
    // Check if options are rendered
    expect(screen.getByText('Small Electronics')).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<PickupRequest />);
    expect(screen.getByRole('button', { name: /confirm pickup/i })).toBeInTheDocument();
  });

  test('renders logo and navigation', () => {
    render(<PickupRequest />);
    expect(screen.getByText('ReNova')).toBeInTheDocument();
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });
});