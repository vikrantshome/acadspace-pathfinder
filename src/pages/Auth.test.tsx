import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Auth from './Auth';
import { AuthProvider } from '@/components/AuthProvider';

// Mock the AuthProvider
jest.mock('@/components/AuthProvider', () => ({
  ...jest.requireActual('@/components/AuthProvider'),
  useAuth: () => ({
    user: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
  }),
}));

describe('Auth Component', () => {
  it('should allow selecting a school from the dropdown', async () => {
    render(
      <Router>
        <AuthProvider>
          <Auth />
        </AuthProvider>
      </Router>
    );

    // Switch to Sign Up form
    fireEvent.click(screen.getByText('Create Account'));

    const schoolInput = screen.getByPlaceholderText('Input school name...');
    fireEvent.change(schoolInput, { target: { value: 'Indian' } });

    // Wait for the dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('Indian Public School')).toBeInTheDocument();
    });

    // Click on the school
    fireEvent.click(screen.getByText('Indian Public School'));

    // Check if the input value is updated
    await waitFor(() => {
      expect(schoolInput.value).toBe('Indian Public School');
    });
  });
});
