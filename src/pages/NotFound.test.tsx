import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from './NotFound';

// Helper para renderizar con router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NotFound', () => {
  describe('Renderizado inicial', () => {
    it('debería renderizar el título 404', () => {
      // Arrange & Act
      renderWithRouter(<NotFound />);

      // Assert
      expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument();
    });

    it('debería mostrar el mensaje de página no encontrada', () => {
      // Arrange & Act
      renderWithRouter(<NotFound />);

      // Assert
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });

    it('debería renderizar el enlace para volver al inicio', () => {
      // Arrange & Act
      renderWithRouter(<NotFound />);

      // Assert
      const link = screen.getByRole('link', { name: /return to home/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('Estilos y estructura', () => {
    it('debería tener la estructura básica del componente', () => {
      // Arrange & Act
      const { container } = renderWithRouter(<NotFound />);

      // Assert
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('debería mostrar todos los elementos esperados', () => {
      // Arrange & Act
      renderWithRouter(<NotFound />);

      // Assert
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Accesibilidad', () => {
    it('debería tener un heading principal', () => {
      // Arrange & Act
      renderWithRouter(<NotFound />);

      // Assert
      const heading = screen.getByRole('heading', { name: /404/i });
      expect(heading).toBeInTheDocument();
    });

    it('debería tener un enlace navegable', () => {
      // Arrange & Act
      renderWithRouter(<NotFound />);

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href');
    });
  });
});
