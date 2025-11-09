import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import * as useAuthModule from '@/hooks/useAuth';

// Mock del hook useAuth
vi.mock('@/hooks/useAuth');

describe('LoginForm', () => {
  // Mock de la función handleLogin
  const mockHandleLogin = vi.fn();
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup del mock de useAuth
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: null,
      handleLogin: mockHandleLogin,
    });
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar el formulario con todos los campos', () => {
      // Arrange
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);

      // Assert
      expect(screen.getByRole('heading', { name: /inicio de sesión/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('debería mostrar el botón de submit deshabilitado inicialmente', () => {
      // Arrange
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);

      // Assert
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      expect(submitButton).toBeDisabled();
    });

    it('debería renderizar el campo de contraseña como tipo password', () => {
      // Arrange
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);

      // Assert
      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Validación de campos', () => {
    it('debería mostrar error cuando el email está vacío', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'a');
      await user.clear(emailInput);
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error cuando el email no es válido', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'correo-invalido');
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/ingrese un correo electrónico válido/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error cuando la contraseña es muy corta', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      await user.type(passwordInput, '12345');
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error cuando la contraseña está vacía', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      await user.type(passwordInput, 'a');
      await user.clear(passwordInput);
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidad de mostrar/ocultar contraseña', () => {
    it('debería cambiar el tipo de input al hacer click en el icono de ojo', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);

      // Assert
      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('type', 'text');
      });
    });

    it('debería volver a ocultar la contraseña al hacer click nuevamente', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
      
      await user.click(toggleButton);
      await user.click(toggleButton);

      // Assert
      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('type', 'password');
      });
    });
  });

  describe('Submit del formulario', () => {
    it('debería habilitar el botón cuando los campos son válidos', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Assert
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('debería llamar handleLogin con las credenciales correctas cuando el usuario es admin', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockUser = { idRole: 3, email: 'admin@test.com' };
      mockHandleLogin.mockResolvedValue(mockUser);
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'admin@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockHandleLogin).toHaveBeenCalledWith('admin@test.com', 'password123');
        expect(mockOnLoginSuccess).toHaveBeenCalledWith('admin');
      });
    });

    it('debería mostrar estado de cargando durante el login', async () => {
      // Arrange
      const user = userEvent.setup();
      mockHandleLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert
      expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
    });

    it('debería mostrar mensaje de error cuando falla el login', async () => {
      // Arrange
      const user = userEvent.setup();
      mockHandleLogin.mockRejectedValue(new Error('Network error'));
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
      });
    });

    it('no debería llamar onLoginSuccess si el usuario no es admin', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockUser = { idRole: 1, email: 'user@test.com' };
      mockHandleLogin.mockResolvedValue(mockUser);
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'user@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockHandleLogin).toHaveBeenCalled();
        expect(mockOnLoginSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accesibilidad', () => {
    it('debería tener labels asociados correctamente a los inputs', () => {
      // Arrange
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);

      // Assert
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('debería tener aria-invalid en campos con errores', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('debería tener aria-describedby en campos con errores', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onLoginSuccess: mockOnLoginSuccess };

      // Act
      render(<LoginForm {...props} />);
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      });
    });
  });
});
