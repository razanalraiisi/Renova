import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectorNav from '../CollectorNav';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('react-redux', () => ({
  useSelector: () => ({
    users: { user: { uname: 'Test User' } },
  }),
  useDispatch: () => jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

describe('CollectorNav', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders brand', () => {
    render(<CollectorNav />);
    expect(screen.getByText('ReNova')).toBeInTheDocument();
  });

  test('renders navigation items', () => {
    render(<CollectorNav />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.getByText('History Requests')).toBeInTheDocument();
    expect(screen.getByText('New Requests')).toBeInTheDocument();

    expect(screen.getByText('About Us')).toBeInTheDocument();
  });
});