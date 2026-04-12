import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgetPassword from '../ForgetPassword';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}), { virtual: true });

jest.mock('axios');
const mockAxios = require('axios');

describe('ForgetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders forget password form', () => {
    render(<ForgetPassword />);
    expect(screen.getByText('Forget Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request reset link/i })).toBeInTheDocument();
  });

  test('renders logo and brand', () => {
    render(<ForgetPassword />);
    expect(screen.getByText('ReNova')).toBeInTheDocument();
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });

  test('allows typing email', () => {
    render(<ForgetPassword />);
    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');
  });

  test('shows validation error for empty email', async () => {
    render(<ForgetPassword />);
    fireEvent.click(screen.getByRole('button', { name: /request reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email', async () => {
    render(<ForgetPassword />);
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'invalid-email' }
    });
    fireEvent.click(screen.getByRole('button', { name: /request reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  test('successfully sends reset email', async () => {
    const mockNavigate = jest.fn();
    const { useNavigate } = require('react-router-dom');
    useNavigate.mockReturnValue(mockNavigate);

    mockAxios.post.mockResolvedValueOnce({ data: { message: 'Reset email sent' } });

    render(<ForgetPassword />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: /request reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('Reset email sent successfully!')).toBeInTheDocument();
    });

    expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:5000/forgot-password', {
      email: 'test@example.com'
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/VerifyOtp', { state: { email: 'test@example.com' } });
    }, { timeout: 2000 });
  });

  test('handles API error', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'User not found' } }
    });

    render(<ForgetPassword />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: /request reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});