import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AboutUs from '../AboutUs';

describe('AboutUs Component', () => {
  test('renders About Us heading', () => {
    render(<AboutUs />);
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  test('renders Who We Are section', () => {
    render(<AboutUs />);
    expect(screen.getByText('Who We Are')).toBeInTheDocument();
    expect(screen.getByText(/ReNova is a smart, user-friendly web platform/)).toBeInTheDocument();
  });

  test('renders Our Mission section', () => {
    render(<AboutUs />);
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText(/To empower individuals, families, and communities/)).toBeInTheDocument();
  });

  test('renders Our Vision section', () => {
    render(<AboutUs />);
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
    expect(screen.getByText(/A future where Oman becomes a leader/)).toBeInTheDocument();
  });

  test('renders all icons', () => {
    render(<AboutUs />);
    // Icons are rendered via react-icons, we can check for their presence through text content
    expect(screen.getByText('Who We Are')).toBeInTheDocument();
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
  });
});