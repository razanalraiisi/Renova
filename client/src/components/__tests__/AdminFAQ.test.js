import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminFAQ from '../AdminFAQ';

jest.mock('../../services/FaqServices', () => ({
  getFAQs: jest.fn(),
  createFAQ: jest.fn(),
  updateFAQ: jest.fn(),
  deleteFAQ: jest.fn(),
}));

const mockFAQs = [
  { _id: '1', question: 'What is ReNova?', answer: 'A platform for e-waste.' },
  { _id: '2', question: 'How to register?', answer: 'Click sign up.' },
];

describe('AdminFAQ Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders interface', () => {
    render(<AdminFAQ />);
    expect(screen.getByText(/manage faqs/i)).toBeInTheDocument();
  });

  test('loads FAQs', async () => {
    const { getFAQs } = require('../../services/FaqServices');
    getFAQs.mockResolvedValue(mockFAQs);

    await act(async () => {
      render(<AdminFAQ />);
    });

    await waitFor(() => {
      expect(screen.getByText('What is ReNova?')).toBeInTheDocument();
    });
  });

  test('adds FAQ', async () => {
    const { getFAQs, createFAQ } = require('../../services/FaqServices');
    getFAQs.mockResolvedValue([]);
    createFAQ.mockResolvedValue({ _id: '3' });

    render(<AdminFAQ />);

    fireEvent.change(screen.getByPlaceholderText(/question/i), {
      target: { value: 'New Q' },
    });

    fireEvent.change(screen.getByPlaceholderText(/answer/i), {
      target: { value: 'New A' },
    });

    fireEvent.click(screen.getByText(/add faq/i));

    await waitFor(() => {
      expect(createFAQ).toHaveBeenCalled();
    });
  });

  test('deletes FAQ', async () => {
    const { getFAQs, deleteFAQ } = require('../../services/FaqServices');
    getFAQs.mockResolvedValue(mockFAQs);
    deleteFAQ.mockResolvedValue(true);

    render(<AdminFAQ />);

    await waitFor(() => {
      fireEvent.click(screen.getAllByText(/delete/i)[0]);
    });

    await waitFor(() => {
      expect(deleteFAQ).toHaveBeenCalled();
    });
  });
});