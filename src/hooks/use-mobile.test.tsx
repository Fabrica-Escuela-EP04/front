import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  let matchMediaMock: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock de matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(matchMediaMock),
    });

    // Mock de window.innerWidth (valor por defecto: desktop)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('debería inicializar con false en pantalla desktop (>= 768px)', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });

      // Act
      const { result } = renderHook(() => useIsMobile());

      // Assert
      expect(result.current).toBe(false);
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    });

    it('debería inicializar con true en pantalla móvil (< 768px)', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      });

      // Act
      const { result } = renderHook(() => useIsMobile());

      // Assert
      expect(result.current).toBe(true);
    });

    it('debería retornar false exactamente en 768px (límite)', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768,
      });

      // Act
      const { result } = renderHook(() => useIsMobile());

      // Assert
      expect(result.current).toBe(false);
    });

    it('debería retornar true exactamente en 767px (justo debajo del límite)', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 767,
      });

      // Act
      const { result } = renderHook(() => useIsMobile());

      // Assert
      expect(result.current).toBe(true);
    });
  });

  describe('Listener de cambios de tamaño', () => {
    it('debería registrar un listener para cambios de media query', () => {
      // Arrange & Act
      renderHook(() => useIsMobile());

      // Assert
      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('debería actualizar isMobile cuando el tamaño de ventana cambia de desktop a móvil', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);

      // Act - Simular cambio a móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      });

      // Obtener el callback del addEventListener y ejecutarlo
      const changeCallback = matchMediaMock.addEventListener.mock.calls[0][1];
      act(() => {
        changeCallback();
      });

      // Assert
      expect(result.current).toBe(true);
    });

    it('debería actualizar isMobile cuando el tamaño de ventana cambia de móvil a desktop', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      });
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);

      // Act - Simular cambio a desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });

      // Obtener el callback y ejecutarlo
      const changeCallback = matchMediaMock.addEventListener.mock.calls[0][1];
      act(() => {
        changeCallback();
      });

      // Assert
      expect(result.current).toBe(false);
    });

    it('debería detectar correctamente tamaños de tablet (768-1023px)', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800,
      });

      // Act
      const { result } = renderHook(() => useIsMobile());

      // Assert - Tablet se considera desktop (>= 768px)
      expect(result.current).toBe(false);
    });
  });

  describe('Cleanup del efecto', () => {
    it('debería remover el listener al desmontar el hook', () => {
      // Arrange
      const { unmount } = renderHook(() => useIsMobile());

      // Act
      unmount();

      // Assert
      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('debería remover el mismo callback que agregó', () => {
      // Arrange
      const { unmount } = renderHook(() => useIsMobile());

      // Obtener el callback agregado
      const addedCallback = matchMediaMock.addEventListener.mock.calls[0][1];

      // Act
      unmount();

      // Assert
      const removedCallback = matchMediaMock.removeEventListener.mock.calls[0][1];
      expect(removedCallback).toBe(addedCallback);
    });
  });

  describe('Casos edge', () => {
    it('debería manejar valores extremadamente pequeños de innerWidth', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320,
      });

      // Act
      const { result } = renderHook(() => useIsMobile());

      // Assert
      expect(result.current).toBe(true);
    });

    it('debería manejar valores extremadamente grandes de innerWidth', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 3840, // 4K
      });

      // Act
      const { result } = renderHook(() => useIsMobile());

      // Assert
      expect(result.current).toBe(false);
    });

    it('debería convertir undefined a false con !!', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: undefined,
      });

      // Act
      const { result } = renderHook(() => useIsMobile());

      // Assert
      // !! convierte undefined a false
      expect(result.current).toBe(false);
    });

    it('debería manejar múltiples cambios de tamaño consecutivos', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });
      const { result } = renderHook(() => useIsMobile());
      const changeCallback = matchMediaMock.addEventListener.mock.calls[0][1];

      // Act - Múltiples cambios
      act(() => {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
        changeCallback();
      });
      expect(result.current).toBe(true);

      act(() => {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
        changeCallback();
      });
      expect(result.current).toBe(false);

      act(() => {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 500 });
        changeCallback();
      });

      // Assert
      expect(result.current).toBe(true);
    });
  });
});
