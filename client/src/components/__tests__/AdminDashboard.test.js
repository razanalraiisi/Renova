import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../AdminDashboard';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('admin/stats')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            totalUsers: 100,
            totalCollectors: 20,
            disposals: 50,
            recycles: 30,
            upcycles: 10,
          }),
      });
    }

    if (url.includes('admin/chart-data')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            disposals: { labels: [], data: [] },
            recycles: { labels: [], data: [] },
            upcycles: { labels: [], data: [] },
            newUsers: { labels: [], data: [] },
          }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AdminDashboard Component', () => {
  test('renders dashboard title', async () => {
    render(<AdminDashboard />);
    expect(await screen.findByText(/welcome admin/i)).toBeInTheDocument();
  });

  test('renders charts', async () => {
    render(<AdminDashboard />);
    expect(await screen.findAllByTestId('bar-chart')).toHaveLength(2);
    expect(await screen.findAllByTestId('line-chart')).toHaveLength(2);
  });

  test('renders UI elements', async () => {
    render(<AdminDashboard />);

    const buttons = await screen.findAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});