import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectorDash from '../CollectorDash';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock('react-redux', () => ({
  useSelector: (selector) =>
    selector({
      users: {
        user: { companyName: 'Test Collector' },
      },
    }),
}), { virtual: true });

// Mock MUI X Charts
jest.mock('@mui/x-charts/PieChart', () => ({
  PieChart: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

jest.mock('@mui/x-charts/BarChart', () => ({
  BarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

describe('CollectorDash Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard title with user name', () => {
    render(<CollectorDash />);
    expect(screen.getByText('Collector Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Test Collector!')).toBeInTheDocument();
  });

  test('renders charts', () => {
    render(<CollectorDash />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('renders widget cards', () => {
    render(<CollectorDash />);
    expect(screen.getByText('Electronics Recycled')).toBeInTheDocument();
    expect(screen.getByText('Electronics Upcycled')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Pickups Today')).toBeInTheDocument();
  });

  test('renders new requests section', () => {
    render(<CollectorDash />);
    expect(screen.getByText('New Requests')).toBeInTheDocument();
    expect(screen.getByText('View all')).toBeInTheDocument();
  });

  test('renders empty requests message when no requests', () => {
    render(<CollectorDash />);
    expect(screen.getByText('No requests found')).toBeInTheDocument();
  });
});