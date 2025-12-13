import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../Login';



jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children }) => <span>{children}</span>,
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) =>
    selector({
      users: {
        user: {},
        isSuccess: false,
        isError: false,
        message: '',
      },
    }),
}));

jest.mock('../../features/UserSlice', () => ({
  getUser: jest.fn(),
  resetState: jest.fn(),
}));



describe('Login Component – Basic Working Tests', () => {
  test('renders email and password inputs', () => {
    render(<Login />);

    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  test('allows typing in email and password fields', () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: '123456' },
    });

    expect(screen.getByPlaceholderText(/enter your email/i)).toHaveValue('test@example.com');
    expect(screen.getByPlaceholderText(/enter your password/i)).toHaveValue('123456');
  });

  test('shows validation errors when submitting empty form', async () => {
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText(/you cannot leave the email blank/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/password must not be entered blank/i)
    ).toBeInTheDocument();
  });
});
