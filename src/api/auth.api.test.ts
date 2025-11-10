import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from './auth.api';
import * as httpClient from './httpClient';
import { User } from '../models/User';

// Mock del httpClient
vi.mock('./httpClient');

describe('auth.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('debería llamar al endpoint de login con las credenciales correctas', async () => {
      // Arrange
      const email = 'admin@hospital.com';
      const password = 'password123';
      const mockUser: User = {
        idUser: 1,
        name: 'Admin',
        lastName: 'User',
        email: 'admin@hospital.com',
        document: '12345678',
        documentType: 'CC',
        phoneNumber: '3001234567',
        idRole: 1,
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockUser);

      // Act
      const result = await login(email, password);

      // Assert
      expect(httpClient.http).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      expect(httpClient.http).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('debería retornar el usuario cuando el login es exitoso', async () => {
      // Arrange
      const email = 'user@test.com';
      const password = 'pass456';
      const mockUser: User = {
        idUser: 2,
        name: 'John',
        lastName: 'Doe',
        email: 'user@test.com',
        document: '87654321',
        documentType: 'CC',
        phoneNumber: '3009876543',
        idRole: 2,
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockUser);

      // Act
      const result = await login(email, password);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.name).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.idUser).toBe(2);
    });

    it('debería serializar correctamente el body como JSON', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'securePassword123';
      const mockUser: User = {
        idUser: 3,
        name: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        document: '11111111',
        documentType: 'TI',
        phoneNumber: '3001111111',
        idRole: 3,
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockUser);

      // Act
      await login(email, password);

      // Assert
      const expectedBody = JSON.stringify({ email, password });
      expect(httpClient.http).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({
          body: expectedBody,
        })
      );
    });

    it('debería propagar errores cuando el login falla', async () => {
      // Arrange
      const email = 'wrong@example.com';
      const password = 'wrongPassword';
      const error = new Error('HTTP error! status: 401');
      vi.mocked(httpClient.http).mockRejectedValue(error);

      // Act & Assert
      await expect(login(email, password)).rejects.toThrow('HTTP error! status: 401');
      expect(httpClient.http).toHaveBeenCalledTimes(1);
    });

    it('debería propagar errores de red', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password';
      const networkError = new Error('Network failure');
      vi.mocked(httpClient.http).mockRejectedValue(networkError);

      // Act & Assert
      await expect(login(email, password)).rejects.toThrow('Network failure');
    });

    it('debería manejar credenciales con caracteres especiales', async () => {
      // Arrange
      const email = 'user+test@example.com';
      const password = 'p@ssw0rd!#$%';
      const mockUser: User = {
        idUser: 4,
        name: 'Special',
        lastName: 'User',
        email: 'user+test@example.com',
        document: '22222222',
        documentType: 'CC',
        phoneNumber: '3002222222',
        idRole: 2,
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockUser);

      // Act
      await login(email, password);

      // Assert
      expect(httpClient.http).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({
          body: JSON.stringify({ email, password }),
        })
      );
    });

    it('debería manejar emails vacíos', async () => {
      // Arrange
      const email = '';
      const password = 'password123';
      const error = new Error('HTTP error! status: 400');
      vi.mocked(httpClient.http).mockRejectedValue(error);

      // Act & Assert
      await expect(login(email, password)).rejects.toThrow('HTTP error! status: 400');
    });

    it('debería manejar passwords vacías', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = '';
      const error = new Error('HTTP error! status: 400');
      vi.mocked(httpClient.http).mockRejectedValue(error);

      // Act & Assert
      await expect(login(email, password)).rejects.toThrow('HTTP error! status: 400');
    });

    it('debería usar el método POST correctamente', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password';
      const mockUser: User = {
        idUser: 5,
        name: 'Test',
        lastName: 'Method',
        email: 'test@example.com',
        document: '33333333',
        documentType: 'CC',
        phoneNumber: '3003333333',
        idRole: 2,
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockUser);

      // Act
      await login(email, password);

      // Assert
      expect(httpClient.http).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('debería retornar todos los campos del usuario', async () => {
      // Arrange
      const email = 'complete@example.com';
      const password = 'password';
      const mockUser: User = {
        idUser: 6,
        name: 'Complete',
        lastName: 'UserData',
        email: 'complete@example.com',
        document: '44444444',
        documentType: 'CE',
        phoneNumber: '3004444444',
        idRole: 1,
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockUser);

      // Act
      const result = await login(email, password);

      // Assert
      expect(result).toHaveProperty('idUser');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('document');
      expect(result).toHaveProperty('documentType');
      expect(result).toHaveProperty('phoneNumber');
      expect(result).toHaveProperty('idRole');
      expect(Object.keys(result)).toHaveLength(8);
    });

    it('debería manejar múltiples llamadas de login secuencialmente', async () => {
      // Arrange
      const user1: User = {
        idUser: 1,
        name: 'User',
        lastName: 'One',
        email: 'user1@test.com',
        document: '11111111',
        documentType: 'CC',
        phoneNumber: '3001111111',
        idRole: 1,
      };
      const user2: User = {
        idUser: 2,
        name: 'User',
        lastName: 'Two',
        email: 'user2@test.com',
        document: '22222222',
        documentType: 'CC',
        phoneNumber: '3002222222',
        idRole: 2,
      };

      vi.mocked(httpClient.http)
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      // Act
      const result1 = await login('user1@test.com', 'pass1');
      const result2 = await login('user2@test.com', 'pass2');

      // Assert
      expect(result1).toEqual(user1);
      expect(result2).toEqual(user2);
      expect(httpClient.http).toHaveBeenCalledTimes(2);
    });
  });
});
