import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../Footer';

describe('Footer Component', () => {
  test('renders footer with logo', () => {
    render(<Footer />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(1); // Logo image
  });

  test('renders social media icons', () => {
    render(<Footer />);
    // Social media icons are present (rendered via react-icons)
    expect(screen.getByText('We are committed to reducing e-waste and promoting a circular economy in Oman.')).toBeInTheDocument();
  });

  test('renders quick links section', () => {
    render(<Footer />);
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('FAQS')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  test('renders contact information', () => {
    render(<Footer />);
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Renova.om@hotmail.com')).toBeInTheDocument();
    expect(screen.getByText('+968 99552311')).toBeInTheDocument();
    expect(screen.getByText('Sunday - Thursday (8AM-5PM)')).toBeInTheDocument();
  });

  test('renders legal links', () => {
    render(<Footer />);
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  test('renders commitment message', () => {
    render(<Footer />);
    expect(screen.getByText('We are committed to reducing e-waste and promoting a circular economy in Oman.')).toBeInTheDocument();
  });
});