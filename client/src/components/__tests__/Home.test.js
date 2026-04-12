import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../Home';

jest.mock('react-router-dom', () => ({
  Link: ({ children }) => <span>{children}</span>,
}), { virtual: true });

describe('Home Component', () => {
  test('renders ReNova logo and brand', () => {
    render(<Home />);
    expect(screen.getAllByText('ReNova')).toHaveLength(2); // One in navbar, one in hero
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  test('renders main content sections', () => {
    render(<Home />);
    expect(screen.getByText('Turn Your E-Waste Into a Greener Future')).toBeInTheDocument();
  });

  test('renders hero section', () => {
    render(<Home />);
    expect(screen.getByText('Turn Your E-Waste Into a Greener Future')).toBeInTheDocument();
  });

  test('renders call-to-action buttons', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });
});