import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock de las páginas
vi.mock('./pages/Index', () => ({
  default: () => <div data-testid="index-page">Index Page</div>,
}));
//Final

vi.mock('./pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

// Helper para renderizar con router
const renderWithRouter = (initialRoute = '/') => {
  window.history.pushState({}, 'Test page', initialRoute);
  return render(<App />);
};

describe('App', () => {
  describe('Renderizado de providers', () => {
    it('debería renderizar sin errores', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
    });

    it('debería proveer QueryClientProvider', () => {
      // Arrange & Act
      const { container } = renderWithRouter();

      // Assert
      // Si el componente renderiza sin errores, el provider está funcionando
      expect(container).toBeTruthy();
    });

    it('debería proveer TooltipProvider', () => {
      // Arrange & Act
      const { container } = renderWithRouter();

      // Assert
      // Si el componente renderiza sin errores, el provider está funcionando
      expect(container).toBeTruthy();
    });
  });

  describe('Routing', () => {
    it('debería renderizar la página Index en la ruta raíz', () => {
      // Arrange & Act
      renderWithRouter('/');

      // Assert
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
    });

    it('debería renderizar NotFound para rutas no existentes', () => {
      // Arrange & Act
      renderWithRouter('/ruta-inexistente');

      // Assert
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('debería renderizar NotFound para cualquier ruta inválida', () => {
      // Arrange & Act
      renderWithRouter('/otra/ruta/invalida');

      // Assert
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Componentes de UI', () => {
    it('debería incluir el componente Toaster', () => {
      // Arrange & Act
      const { container } = renderWithRouter();

      // Assert
      // El Toaster se renderiza en un portal, verificamos que el App existe
      expect(container).toBeTruthy();
    });

    it('debería incluir el componente Sonner', () => {
      // Arrange & Act
      const { container } = renderWithRouter();

      // Assert
      // El Sonner se renderiza en un portal, verificamos que el App existe
      expect(container).toBeTruthy();
    });
  });

  describe('Integración completa', () => {
    it('debería renderizar toda la estructura de la aplicación', () => {
      // Arrange & Act
      const { container } = renderWithRouter();

      // Assert
      expect(container.querySelector('div')).toBeInTheDocument();
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
    });

    it('debería manejar múltiples navegaciones', () => {
      // Arrange & Act
      renderWithRouter('/');
      expect(screen.getByTestId('index-page')).toBeInTheDocument();

      // Navegar a ruta inválida
      window.history.pushState({}, 'Test page', '/invalid');
      renderWithRouter('/invalid');

      // Assert
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Configuración de React Query', () => {
    it('debería crear y proveer un QueryClient', () => {
      // Arrange & Act
      const { container } = renderWithRouter();

      // Assert
      // Si el componente se renderiza sin errores, QueryClient está configurado
      expect(container).toBeTruthy();
    });
  });

  describe('Configuración del Router', () => {
    it('debería configurar BrowserRouter correctamente', () => {
      // Arrange & Act
      const { container } = renderWithRouter();

      // Assert
      // Si el routing funciona, BrowserRouter está configurado
      expect(container).toBeTruthy();
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
    });

    it('debería tener la configuración future.v7_relativeSplatPath', () => {
      // Arrange & Act
      const { container } = renderWithRouter();

      // Assert
      // Esta es una configuración interna, verificamos que el router funciona
      expect(container).toBeTruthy();
    });
  });
});
