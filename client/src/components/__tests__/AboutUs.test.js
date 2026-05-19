import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AboutUs from '../AboutUs';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AboutUs Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderAboutUs = () =>
    render(
      <MemoryRouter>
        <AboutUs />
      </MemoryRouter>
    );

  test('renders About Us heading', () => {
    renderAboutUs();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  test('shows back button for collector and navigates to dashboard', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ role: 'collector', name: 'Test Collector' })
    );
    renderAboutUs();

    const backBtn = screen.getByRole('button', { name: /back/i });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/CollectorDash');
  });

  test('does not show back button for non-collector visitors', () => {
    renderAboutUs();
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  test('renders Who We Are section', () => {
    renderAboutUs();
    expect(screen.getByText('Who We Are')).toBeInTheDocument();
    expect(screen.getByText(/ReNova is a smart, user-friendly web platform/)).toBeInTheDocument();
  });

  test('renders Our Mission section', () => {
    renderAboutUs();
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText(/To empower individuals, families, and communities/)).toBeInTheDocument();
  });

  test('renders Our Vision section', () => {
    renderAboutUs();
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
    expect(screen.getByText(/A future where Oman becomes a leader/)).toBeInTheDocument();
  });

  test('renders all icons', () => {
    renderAboutUs();
    // Icons are rendered via react-icons, we can check for their presence through text content
    expect(screen.getByText('Who We Are')).toBeInTheDocument();
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
  });
});