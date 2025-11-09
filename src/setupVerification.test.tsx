import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Testing Setup Verification', () => {
  it('should render a button component', () => {
    // Arrange
    const buttonText = 'Click me';

    // Act
    render(<Button>{buttonText}</Button>);

    // Assert
    expect(screen.getByRole('button', { name: buttonText })).toBeInTheDocument();
  });

  it('should pass a simple math test', () => {
    // Arrange & Act
    const result = 2 + 2;

    // Assert
    expect(result).toBe(4);
  });
});
