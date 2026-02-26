/**
 * @vidflow/ui - URLInput Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { URLInput } from '../URLInput';

describe('URLInput', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders URL input with correct data-testid', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId('url-input')).toBeInTheDocument();
  });

  it('renders input field with placeholder', () => {
    render(<URLInput onSubmit={mockOnSubmit} placeholder="Enter video URL" />);
    expect(screen.getByPlaceholderText('Enter video URL')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=test' } });
    const submitBtn = screen.getByTestId('submit-button');
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('https://www.youtube.com/watch?v=test');
  });

  it('validates YouTube URL', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=test123' } });
    const submitBtn = screen.getByTestId('submit-button');
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('https://www.youtube.com/watch?v=test123');
  });

  it('validates TikTok URL', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'https://www.tiktok.com/@user/video/123' } });
    const submitBtn = screen.getByTestId('submit-button');
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('https://www.tiktok.com/@user/video/123');
  });

  it('validates Instagram URL', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'https://www.instagram.com/reel/abc123' } });
    const submitBtn = screen.getByTestId('submit-button');
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('https://www.instagram.com/reel/abc123');
  });

  it('validates Twitter/X URL', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'https://twitter.com/user/status/123' } });
    const submitBtn = screen.getByTestId('submit-button');
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('https://twitter.com/user/status/123');
  });

  it('validates Facebook URL', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'https://www.facebook.com/watch?v=123' } });
    const submitBtn = screen.getByTestId('submit-button');
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('https://www.facebook.com/watch?v=123');
  });

  it('validates Vimeo URL', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'https://vimeo.com/123456789' } });
    const submitBtn = screen.getByTestId('submit-button');
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('https://vimeo.com/123456789');
  });

  it('validates Twitch URL', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'https://www.twitch.tv/videos/123' } });
    const submitBtn = screen.getByTestId('submit-button');
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('https://www.twitch.tv/videos/123');
  });

  it('shows error for invalid URL format', async () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'not-a-valid-url' } });
    // Submit the form directly to trigger validation
    const form = input.closest('form');
    fireEvent.submit(form!);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid URL');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates against supported platforms when specified', () => {
    render(<URLInput onSubmit={mockOnSubmit} supportedPlatforms={['youtube', 'tiktok']} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'https://vimeo.com/123' } });
    const form = input.closest('form');
    fireEvent.submit(form!);
    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Please enter a valid URL from: youtube, tiktok'
    );
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('disables submit button when loading', () => {
    render(<URLInput onSubmit={mockOnSubmit} loading />);
    const submitBtn = screen.getByTestId('submit-button');
    expect(submitBtn).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<URLInput onSubmit={mockOnSubmit} loading />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows paste button', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Paste')).toBeInTheDocument();
  });

  it('disables input when loading', () => {
    render(<URLInput onSubmit={mockOnSubmit} loading />);
    const input = screen.getByTestId('url-input-field');
    expect(input).toBeDisabled();
  });

  it('shows supported platforms when specified', () => {
    render(
      <URLInput onSubmit={mockOnSubmit} supportedPlatforms={['youtube', 'tiktok', 'instagram']} />
    );
    expect(screen.getByText('Supported:')).toBeInTheDocument();
    expect(screen.getByText('youtube')).toBeInTheDocument();
    expect(screen.getByText('tiktok')).toBeInTheDocument();
    expect(screen.getByText('instagram')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<URLInput onSubmit={mockOnSubmit} className="custom-class" />);
    expect(screen.getByTestId('url-input')).toHaveClass('custom-class');
  });

  it('has correct aria-label on input', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByLabelText('Video URL');
    expect(input).toBeInTheDocument();
  });

  it('shows error message in alert role', () => {
    render(<URLInput onSubmit={mockOnSubmit} />);
    const input = screen.getByTestId('url-input-field');
    fireEvent.change(input, { target: { value: 'invalid' } });
    const form = input.closest('form');
    fireEvent.submit(form!);
    const error = screen.getByTestId('error-message');
    expect(error).toHaveTextContent('Please enter a valid URL');
  });
});
