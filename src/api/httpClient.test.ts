import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, API_URL } from './httpClient';

describe('httpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Llamadas exitosas', () => {
    it('debería realizar una petición GET exitosa', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      const result = await http<typeof mockData>('/test-endpoint');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/test-endpoint`,
        expect.objectContaining({
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockData);
    });

    it('debería realizar una petición POST exitosa con body', async () => {
      // Arrange
      const requestBody = { email: 'test@example.com', password: '123456' };
      const mockData = { token: 'abc123', userId: 1 };
      const mockResponse = {
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      const result = await http<typeof mockData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockData);
    });

    it('debería realizar una petición PUT exitosa', async () => {
      // Arrange
      const updateData = { name: 'Updated Name', status: 'active' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(updateData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      const result = await http<typeof updateData>('/users/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/users/1`,
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
        })
      );
      expect(result).toEqual(updateData);
    });

    it('debería realizar una petición DELETE exitosa', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 204,
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      const result = await http<{}>('/users/1', {
        method: 'DELETE',
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/users/1`,
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
        })
      );
      expect(result).toEqual({});
    });
  });

  describe('Headers personalizados', () => {
    it('debería sobrescribir headers cuando se proporcionan', async () => {
      // Arrange
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);
      const customHeaders = {
        Authorization: 'Bearer token123',
        'X-Custom-Header': 'custom-value',
      };

      // Act
      await http<typeof mockData>('/protected-endpoint', {
        headers: customHeaders,
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/protected-endpoint`,
        expect.objectContaining({
          credentials: 'include',
          headers: customHeaders,
        })
      );
    });

    it('debería permitir agregar headers personalizados sin Content-Type', async () => {
      // Arrange
      const mockData = { data: 'test' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      await http<typeof mockData>('/endpoint', {
        headers: {
          'X-Request-ID': 'req-123',
        },
      });

      // Assert
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      expect(callArgs[0]).toBe(`${API_URL}/endpoint`);
      expect(callArgs[1]).toHaveProperty('headers');
      expect(callArgs[1]?.headers).toEqual({
        'X-Request-ID': 'req-123',
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debería lanzar error cuando la respuesta tiene status 404', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(http('/not-found')).rejects.toThrow('HTTP error! status: 404');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar error cuando la respuesta tiene status 500', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(http('/server-error')).rejects.toThrow('HTTP error! status: 500');
    });

    it('debería lanzar error cuando la respuesta tiene status 401', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(http('/protected')).rejects.toThrow('HTTP error! status: 401');
    });

    it('debería lanzar error cuando la respuesta tiene status 403', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(http('/forbidden')).rejects.toThrow('HTTP error! status: 403');
    });

    it('debería propagar errores de red', async () => {
      // Arrange
      const networkError = new Error('Network failure');
      vi.mocked(global.fetch).mockRejectedValue(networkError);

      // Act & Assert
      await expect(http('/endpoint')).rejects.toThrow('Network failure');
    });

    it('debería propagar errores de timeout', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      vi.mocked(global.fetch).mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(http('/slow-endpoint')).rejects.toThrow('Request timeout');
    });
  });

  describe('Configuración de credentials', () => {
    it('debería enviar cookies con credentials: include', async () => {
      // Arrange
      const mockData = { authenticated: true };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      await http<typeof mockData>('/auth/check');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  describe('API_URL', () => {
    it('debería construir la URL completa correctamente', async () => {
      // Arrange
      const mockData = { test: true };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      await http<typeof mockData>('/users');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/users`,
        expect.any(Object)
      );
    });

    it('debería manejar endpoints con múltiples segmentos', async () => {
      // Arrange
      const mockData = { data: 'response' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      await http<typeof mockData>('/api/v2/users/123/profile');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/api/v2/users/123/profile`,
        expect.any(Object)
      );
    });
  });

  describe('Parseo de respuestas', () => {
    it('debería parsear correctamente respuestas JSON complejas', async () => {
      // Arrange
      const complexData = {
        user: {
          id: 1,
          name: 'John Doe',
          roles: ['admin', 'user'],
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(complexData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      const result = await http<typeof complexData>('/complex-data');

      // Assert
      expect(result).toEqual(complexData);
      expect(result.user.roles).toHaveLength(2);
      expect(result.metadata.version).toBe('1.0.0');
    });

    it('debería manejar respuestas con arrays', async () => {
      // Arrange
      const arrayData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(arrayData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      const result = await http<typeof arrayData>('/items');

      // Assert
      expect(result).toEqual(arrayData);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('debería manejar respuestas vacías', async () => {
      // Arrange
      const emptyData = {};
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(emptyData),
      } as unknown as Response;
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      // Act
      const result = await http<typeof emptyData>('/empty');

      // Assert
      expect(result).toEqual({});
    });
  });
});
