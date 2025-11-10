import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as authApi from '../api/auth.api';
import { User } from '../models/User';

// Mock de la API
vi.mock('../api/auth.api');

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('debería inicializar con user en null', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth());

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.handleLogin).toBeDefined();
      expect(typeof result.current.handleLogin).toBe('function');
    });
  });

  describe('handleLogin', () => {
    it('debería llamar a la API de login y actualizar el user correctamente', async () => {
      // Arrange
      const mockUser: User = {
        idUser: 1,
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        document: '12345678',
        documentType: 'CC',
        phoneNumber: '3001234567',
        idRole: 1
      };
      vi.mocked(authApi.login).mockResolvedValue(mockUser);
      const { result } = renderHook(() => useAuth());

      // Act
      const loggedUser = await result.current.handleLogin('juan@test.com', 'password123');

      // Assert
      expect(authApi.login).toHaveBeenCalledWith('juan@test.com', 'password123');
      expect(authApi.login).toHaveBeenCalledTimes(1);
      expect(loggedUser).toEqual(mockUser);
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('debería retornar el usuario logueado', async () => {
      // Arrange
      const mockUser: User = {
        idUser: 2,
        name: 'María',
        lastName: 'López',
        email: 'maria@test.com',
        document: '87654321',
        documentType: 'CC',
        phoneNumber: '3009876543',
        idRole: 2
      };
      vi.mocked(authApi.login).mockResolvedValue(mockUser);
      const { result } = renderHook(() => useAuth());

      // Act
      const returnedUser = await result.current.handleLogin('maria@test.com', 'pass456');

      // Assert
      expect(returnedUser).toEqual(mockUser);
      expect(returnedUser.email).toBe('maria@test.com');
    });

    it('debería actualizar el estado con diferentes usuarios en llamadas sucesivas', async () => {
      // Arrange
      const user1: User = {
        idUser: 1,
        name: 'Usuario',
        lastName: 'Uno',
        email: 'user1@test.com',
        document: '11111111',
        documentType: 'CC',
        phoneNumber: '3001111111',
        idRole: 1
      };
      const user2: User = {
        idUser: 2,
        name: 'Usuario',
        lastName: 'Dos',
        email: 'user2@test.com',
        document: '22222222',
        documentType: 'CC',
        phoneNumber: '3002222222',
        idRole: 2
      };
      const { result } = renderHook(() => useAuth());

      // Act - Primera llamada
      vi.mocked(authApi.login).mockResolvedValueOnce(user1);
      await result.current.handleLogin('user1@test.com', 'pass1');
      
      await waitFor(() => {
        expect(result.current.user).toEqual(user1);
      });

      // Act - Segunda llamada
      vi.mocked(authApi.login).mockResolvedValueOnce(user2);
      await result.current.handleLogin('user2@test.com', 'pass2');

      // Assert
      await waitFor(() => {
        expect(result.current.user).toEqual(user2);
      });
      expect(authApi.login).toHaveBeenCalledTimes(2);
    });

    it('debería propagar el error si la API falla', async () => {
      // Arrange
      const mockError = new Error('Credenciales inválidas');
      vi.mocked(authApi.login).mockRejectedValue(mockError);
      const { result } = renderHook(() => useAuth());

      // Act & Assert
      await expect(result.current.handleLogin('bad@test.com', 'wrongpass'))
        .rejects.toThrow('Credenciales inválidas');
      expect(result.current.user).toBeNull();
    });

    it('debería manejar respuestas vacías de la API', async () => {
      // Arrange
      vi.mocked(authApi.login).mockResolvedValue(null as any);
      const { result } = renderHook(() => useAuth());

      // Act
      const loggedUser = await result.current.handleLogin('test@test.com', 'pass');

      // Assert
      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
      expect(loggedUser).toBeNull();
    });
  });
});
