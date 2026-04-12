import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FAQ from '../FAQ';

jest.mock('../../services/FaqServices', () => ({
  getFAQs: jest.fn(),
}));

const mockFAQs = [
  { _id: '1', question: 'What is ReNova?', answer: 'E-waste platform' },
  { _id: '2', question: 'How to recycle?', answer: 'Follow steps' },
];

describe('FAQ Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders title', () => {
    render(<FAQ />);
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
  });

  test('loads FAQs', async () => {
    const { getFAQs } = require('../../services/FaqServices');
    getFAQs.mockResolvedValue(mockFAQs);

    await act(async () => {
      render(<FAQ />);
    });

    await waitFor(() => {
      expect(screen.getByText('What is ReNova?')).toBeInTheDocument();
    });
  });

  test('filters FAQs', async () => {
    const { getFAQs } = require('../../services/FaqServices');
    getFAQs.mockResolvedValue(mockFAQs);

    await act(async () => {
      render(<FAQ />);
    });

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'recycle' },
    });

    expect(screen.getByText('How to recycle?')).toBeInTheDocument();
  });
});