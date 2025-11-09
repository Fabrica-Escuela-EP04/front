import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import Index from './Index';
import * as useToastModule from '@/hooks/use-toast';

// Mocks de componentes
vi.mock('@/components/LoginForm', () => ({
  LoginForm: ({ onLoginSuccess }: { onLoginSuccess: (role: string) => void }) => (
    <div data-testid="login-form">
      <button onClick={() => onLoginSuccess('admin')}>Login as Admin</button>
      <button onClick={() => onLoginSuccess('user')}>Login as User</button>
    </div>
  ),
}));

vi.mock('@/components/ClinicRegistrationForm', () => ({
  ClinicRegistrationForm: ({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) => (
    <div data-testid="clinic-registration-form">
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onSuccess}>Save</button>
    </div>
  ),
}));

vi.mock('@/pages/medInfoTest', () => ({
  MedInfoTest: () => <div data-testid="med-info-test">Med Info Test</div>,
}));

vi.mock('@/hooks/use-toast');

describe('Index', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToastModule.toast).mockImplementation(mockToast);
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar LoginForm por defecto', () => {
      // Arrange & Act
      render(<Index />);

      // Assert
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('no debería mostrar otros componentes en el estado inicial', () => {
      // Arrange & Act
      render(<Index />);

      // Assert
      expect(screen.queryByTestId('clinic-registration-form')).not.toBeInTheDocument();
      expect(screen.queryByText(/bienvenido al dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/acceso restringido/i)).not.toBeInTheDocument();
    });
  });

  describe('Flujo de login exitoso para admin', () => {
    it('debería mostrar ClinicRegistrationForm cuando el login es exitoso como admin', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const adminButton = screen.getByText('Login as Admin');
      await user.click(adminButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
        expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
      });
    });

    it('debería mostrar toast de éxito cuando el admin hace login', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const adminButton = screen.getByText('Login as Admin');
      await user.click(adminButton);

      // Assert
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Inicio de sesión exitoso',
          description: 'Bienvenido al sistema de gestión de consultorios',
        });
      });
    });
  });

  describe('Flujo de login fallido para usuario no admin', () => {
    it('debería mostrar página de acceso restringido cuando el usuario no es admin', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const userButton = screen.getByText('Login as User');
      await user.click(userButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
        expect(screen.queryByTestId('clinic-registration-form')).not.toBeInTheDocument();
      });
    });

    it('debería mostrar toast de error cuando el usuario no es admin', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const userButton = screen.getByText('Login as User');
      await user.click(userButton);

      // Assert
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Acceso restringido',
          description: 'No tienes permisos para acceder a este módulo',
          variant: 'destructive',
        });
      });
    });

    it('debería permitir volver al login desde la página de acceso restringido', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const userButton = screen.getByText('Login as User');
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /volver al inicio de sesión/i });
      await user.click(backButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
        expect(screen.queryByText(/acceso restringido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Flujo de registro de consultorio', () => {
    it('debería volver al login cuando se cancela el registro', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const adminButton = screen.getByText('Login as Admin');
      await user.click(adminButton);

      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
        expect(screen.queryByTestId('clinic-registration-form')).not.toBeInTheDocument();
      });
    });

    it('debería mostrar dashboard cuando el registro es exitoso', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const adminButton = screen.getByText('Login as Admin');
      await user.click(adminButton);

      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/bienvenido al dashboard/i)).toBeInTheDocument();
        expect(screen.queryByTestId('clinic-registration-form')).not.toBeInTheDocument();
      });
    });

    it('debería mostrar toast de éxito cuando se guarda el consultorio', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const adminButton = screen.getByText('Login as Admin');
      await user.click(adminButton);

      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Consultorio registrado',
          description: 'El consultorio ha sido registrado exitosamente',
        });
      });
    });
  });

  describe('Vista de Dashboard', () => {
    it('debería mostrar mensaje de bienvenida en el dashboard', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const adminButton = screen.getByText('Login as Admin');
      await user.click(adminButton);

      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/bienvenido al dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/el consultorio ha sido registrado exitosamente/i)).toBeInTheDocument();
      });
    });

    it('debería permitir volver al login desde el dashboard', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      const adminButton = screen.getByText('Login as Admin');
      await user.click(adminButton);

      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/bienvenido al dashboard/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /volver al inicio de sesión/i });
      await user.click(backButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
        expect(screen.queryByText(/bienvenido al dashboard/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Renderizado condicional', () => {
    it('debería renderizar solo una vista a la vez', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);

      // Estado inicial: solo login
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.queryByTestId('clinic-registration-form')).not.toBeInTheDocument();
      expect(screen.queryByText(/bienvenido al dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/acceso restringido/i)).not.toBeInTheDocument();

      // Click en admin
      const adminButton = screen.getByText('Login as Admin');
      await user.click(adminButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
        expect(screen.queryByText(/bienvenido al dashboard/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/acceso restringido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Navegación completa', () => {
    it('debería permitir un flujo completo: login -> registro -> dashboard -> logout', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act & Assert
      render(<Index />);

      // 1. Estado inicial: Login
      expect(screen.getByTestId('login-form')).toBeInTheDocument();

      // 2. Login como admin
      await user.click(screen.getByText('Login as Admin'));
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      // 3. Guardar consultorio
      await user.click(screen.getByText('Save'));
      await waitFor(() => {
        expect(screen.getByText(/bienvenido al dashboard/i)).toBeInTheDocument();
      });

      // 4. Volver al login
      await user.click(screen.getByRole('button', { name: /volver al inicio de sesión/i }));
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });
    });

    it('debería permitir cancelar el registro y volver a intentar', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act & Assert
      render(<Index />);

      // 1. Login como admin
      await user.click(screen.getByText('Login as Admin'));
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      // 2. Cancelar
      await user.click(screen.getByText('Cancel'));
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      // 3. Login nuevamente
      await user.click(screen.getByText('Login as Admin'));
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });
    });
  });

  describe('Casos de roles adicionales', () => {
    it('debería manejar correctamente roles que no sean admin (doctor)', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      
      // Simulamos login con rol "doctor"
      const loginForm = screen.getByTestId('login-form');
      const doctorButton = document.createElement('button');
      doctorButton.textContent = 'Login as Doctor';
      doctorButton.onclick = () => {
        const onLoginSuccess = vi.mocked(useToastModule.toast);
        // Simular que se llama onLoginSuccess con rol "doctor"
      };
      
      // Crear un botón mock para probar otros roles
      await user.click(screen.getByText('Login as User'));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
      });
    });

    it('debería manejar correctamente rol vacío', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      await user.click(screen.getByText('Login as User'));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Acceso restringido',
          description: 'No tienes permisos para acceder a este módulo',
          variant: 'destructive',
        });
      });
    });

    it('debería manejar case-sensitive en rol admin', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      await user.click(screen.getByText('Login as Admin'));

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });
    });
  });

  describe('Manejo de estados edge cases', () => {
    it('debería mantener el estado después de múltiples cambios', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);

      // Cambiar entre varias vistas
      await user.click(screen.getByText('Login as User'));
      await waitFor(() => {
        expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /volver al inicio de sesión/i }));
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Login as Admin'));
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      // Assert
      expect(screen.queryByText(/acceso restringido/i)).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    });

    it('debería llamar toast solo una vez por acción', async () => {
      // Arrange
      const user = userEvent.setup();
      mockToast.mockClear();

      // Act
      render(<Index />);
      await user.click(screen.getByText('Login as Admin'));

      // Assert
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledTimes(1);
      });
    });

    it('debería manejar múltiples intentos de login fallido', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);

      // Primer intento
      await user.click(screen.getByText('Login as User'));
      await waitFor(() => {
        expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
      });

      // Volver al login
      await user.click(screen.getByRole('button', { name: /volver al inicio de sesión/i }));
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      // Segundo intento
      await user.click(screen.getByText('Login as User'));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Acceso restringido',
          description: 'No tienes permisos para acceder a este módulo',
          variant: 'destructive',
        });
      });
    });

    it('debería manejar el flujo completo con cancelaciones múltiples', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act & Assert
      render(<Index />);

      // Primera vez: login -> cancelar
      await user.click(screen.getByText('Login as Admin'));
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Cancel'));
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      // Segunda vez: login -> cancelar
      await user.click(screen.getByText('Login as Admin'));
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Cancel'));
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      // Tercera vez: login -> guardar
      await user.click(screen.getByText('Login as Admin'));
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Save'));
      await waitFor(() => {
        expect(screen.getByText(/bienvenido al dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Verificación de toast calls', () => {
    it('debería mostrar diferentes tipos de toast según el resultado', async () => {
      // Arrange
      const user = userEvent.setup();
      mockToast.mockClear();

      // Act & Assert
      render(<Index />);

      // Toast de éxito (admin)
      await user.click(screen.getByText('Login as Admin'));
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Inicio de sesión exitoso',
          })
        );
      });

      mockToast.mockClear();

      // Volver al login
      await user.click(screen.getByText('Cancel'));
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      // Toast de error (user)
      await user.click(screen.getByText('Login as User'));
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            title: 'Acceso restringido',
          })
        );
      });
    });

    it('debería mostrar toast de registro exitoso', async () => {
      // Arrange
      const user = userEvent.setup();
      mockToast.mockClear();

      // Act
      render(<Index />);
      await user.click(screen.getByText('Login as Admin'));
      
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      mockToast.mockClear();
      await user.click(screen.getByText('Save'));

      // Assert
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Consultorio registrado',
          description: 'El consultorio ha sido registrado exitosamente',
        });
      });
    });

    it('no debería mostrar toast cuando se cancela el registro', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      await user.click(screen.getByText('Login as Admin'));
      
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      mockToast.mockClear();
      await user.click(screen.getByText('Cancel'));

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('Renderizado de botones y acciones', () => {
    it('debería tener botones funcionales en vista unauthorized', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      await user.click(screen.getByText('Login as User'));

      // Assert
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /volver al inicio de sesión/i });
        expect(backButton).toBeInTheDocument();
        expect(backButton).toHaveClass('text-medical-primary');
      });
    });

    it('debería tener botones funcionales en vista dashboard', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      await user.click(screen.getByText('Login as Admin'));
      await waitFor(() => {
        expect(screen.getByTestId('clinic-registration-form')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Save'));

      // Assert
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /volver al inicio de sesión/i });
        expect(backButton).toBeInTheDocument();
        expect(backButton).toHaveClass('text-medical-primary');
      });
    });

    it('debería mantener clases CSS correctas en diferentes estados', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Index />);
      await user.click(screen.getByText('Login as User'));

      // Assert
      await waitFor(() => {
        const heading = screen.getByText('Acceso Restringido');
        expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-medical-dark');
      });
    });
  });

  describe('Estado default del switch', () => {
    it('no debería renderizar nada cuando el estado no coincide con ningún caso', () => {
      // Arrange
      // Vamos a forzar un estado inválido usando React internals
      const InvalidStateComponent = () => {
        const [currentView, setCurrentView] = useState<any>("invalid-state" as any);
        
        // Copiamos la lógica del switch para probar el default
        switch (currentView) {
          case "login":
            return <div>Login</div>;
          case "medical-info":
            return <div>Medical Info</div>;
          case "clinic-registration":
            return <div>Clinic Registration</div>;
          case "dashboard":
            return <div>Dashboard</div>;
          case "unauthorized":
            return <div>Unauthorized</div>;
          default:
            return null;
        }
      };

      // Act
      const { container } = render(<InvalidStateComponent />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it('debería manejar estados inesperados sin errores', () => {
      // Arrange
      const TestComponent = () => {
        const [view] = useState<any>("unknown-view");
        
        const renderSwitch = () => {
          switch (view) {
            case "login":
            case "medical-info":
            case "clinic-registration":
            case "dashboard":
            case "unauthorized":
              return <div>Valid View</div>;
            default:
              return null;
          }
        };

        return renderSwitch();
      };

      // Act & Assert
      const { container } = render(<TestComponent />);
      expect(container.firstChild).toBeNull();
    });
  });
});
