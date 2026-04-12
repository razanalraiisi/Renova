import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserDash from '../UserDash';

// FIX: fully safe router mock for React 18 + RTL
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/dashboard" }),
  Link: ({ children }) => <span>{children}</span>,
}));

// FIX: match real redux shape used in component
jest.mock('react-redux', () => ({
  useSelector: () => ({
    users: {
      user: {
        uname: 'John Doe',
        phone: '91234567',
        email: 'john@test.com',
        _id: '1'
      },
      isSuccess: false,
      message: '',
      isLoading: false,
    },
  }),
  useDispatch: () => jest.fn(),
}));

describe('UserDash', () => {
  test('renders navigation', () => {
    render(<UserDash />);
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('My Requests')).toBeInTheDocument();
  });

  test('renders theme button', () => {
    render(<UserDash />);
    expect(
      screen.getByRole('button', { name: /toggle dark mode/i })
    ).toBeInTheDocument();
  });

  test('renders SVG icons (bell)', () => {
    render(<UserDash />);
    expect(document.querySelectorAll('svg').length).toBeGreaterThan(0);
  });
});