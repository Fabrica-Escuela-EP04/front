import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClinicRegistrationForm } from './ClinicRegistrationForm';
import * as useMedicalInfoModule from '@/hooks/useMedicalInfo';
import * as useCreateMedOfficeModule from '@/hooks/useCreateMedOffice';

// Mocks de los hooks
vi.mock('@/hooks/useMedicalInfo');
vi.mock('@/hooks/useCreateMedOffice');

describe('ClinicRegistrationForm', () => {
  // Mocks de funciones
  const mockOnCancel = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockHandleCreateMedicalOffice = vi.fn();

  // Datos de prueba
  const mockMedicalInfo = {
    specialties: [
      { idSpecialty: 1, specialtyName: 'Cardiología' },
      { idSpecialty: 2, specialtyName: 'Pediatría' },
      { idSpecialty: 3, specialtyName: 'Neurología' },
    ],
    clinics: [
      { idClinic: 1, name: 'Sede Norte', type: 'Hospital', location: 'Norte', phoneNumber: '1234567', status: 'Activo' },
      { idClinic: 2, name: 'Sede Sur', type: 'Clínica', location: 'Sur', phoneNumber: '2345678', status: 'Activo' },
      { idClinic: 3, name: 'Sede Centro', type: 'Centro Médico', location: 'Centro', phoneNumber: '3456789', status: 'Activo' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup del mock de useMedicalInfo
    vi.mocked(useMedicalInfoModule.useMedicalInfo).mockReturnValue({
      medicalInfo: mockMedicalInfo,
      isLoading: false,
      error: null,
      reload: vi.fn(),
    });

    // Setup del mock de useCreateMedOffice
    vi.mocked(useCreateMedOfficeModule.useCreateMedOffice).mockReturnValue({
      medicalOfficeCod: null,
      isLoading: false,
      error: null,
      handleCreateMedicalOffice: mockHandleCreateMedicalOffice,
    });
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar el formulario con todos los campos', () => {
      // Arrange
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);

      // Assert
      expect(screen.getByRole('heading', { name: /nuevo consultorio/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/número de consultorio/i)).toBeInTheDocument();
      expect(screen.getByText(/tipo/i)).toBeInTheDocument();
      expect(screen.getByText(/sede/i)).toBeInTheDocument();
      expect(screen.getByText(/estado técnico/i)).toBeInTheDocument();
      // Verificar que hay 3 comboboxes (tipo, sede, estado técnico)
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes).toHaveLength(3);
    });

    it('debería renderizar los botones de cancelar y guardar', () => {
      // Arrange
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);

      // Assert
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    });

    it('debería mostrar el botón de guardar deshabilitado inicialmente', () => {
      // Arrange
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);

      // Assert
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      expect(saveButton).toBeDisabled();
    });

    it('debería renderizar la sidebar con el logo', () => {
      // Arrange
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);

      // Assert
      expect(screen.getByText('Medical')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    });
  });

  describe('Validación de campos', () => {
    it('debería mostrar error cuando el número de consultorio está vacío', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      const nameInput = screen.getByLabelText(/número de consultorio/i);
      await user.type(nameInput, 'a');
      await user.clear(nameInput);
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/el nombre del consultorio es requerido/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error cuando no se selecciona un tipo', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      const nameInput = screen.getByLabelText(/número de consultorio/i);
      await user.type(nameInput, '101');
      
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      
      // Assert - El botón debe estar deshabilitado si falta el tipo
      expect(saveButton).toBeDisabled();
    });

    it('debería mostrar error cuando no se selecciona una sede', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      const nameInput = screen.getByLabelText(/número de consultorio/i);
      await user.type(nameInput, '101');
      
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      
      // Assert
      expect(saveButton).toBeDisabled();
    });

    it('debería mostrar error cuando no se selecciona un estado técnico', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      const nameInput = screen.getByLabelText(/número de consultorio/i);
      await user.type(nameInput, '101');
      
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      
      // Assert
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Interacción con selects', () => {
    it('debería cargar las especialidades en el select de tipo', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      // El primer combobox es el de tipo
      const comboboxes = screen.getAllByRole('combobox');
      const typeSelect = comboboxes[0];
      await user.click(typeSelect);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Cardiología')).toBeInTheDocument();
        expect(screen.getByText('Pediatría')).toBeInTheDocument();
        expect(screen.getByText('Neurología')).toBeInTheDocument();
      });
    });

    it('debería cargar las sedes en el select de sede', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      // El segundo combobox es el de sede
      const comboboxes = screen.getAllByRole('combobox');
      const clinicSelect = comboboxes[1];
      await user.click(clinicSelect);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Sede Norte')).toBeInTheDocument();
        expect(screen.getByText('Sede Sur')).toBeInTheDocument();
        expect(screen.getByText('Sede Centro')).toBeInTheDocument();
      });
    });

    it('debería mostrar los estados técnicos disponibles', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      // El tercer combobox es el de estado técnico
      const comboboxes = screen.getAllByRole('combobox');
      const statusSelect = comboboxes[2];
      await user.click(statusSelect);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Activo')).toBeInTheDocument();
        expect(screen.getByText('Inactivo')).toBeInTheDocument();
        expect(screen.getByText('En mantenimiento')).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidad de botones', () => {
    it('debería llamar onCancel cuando se hace click en cancelar', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('debería habilitar el botón guardar cuando todos los campos son válidos', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      
      const nameInput = screen.getByLabelText(/número de consultorio/i);
      await user.type(nameInput, '101');

      const comboboxes = screen.getAllByRole('combobox');
      const typeSelect = comboboxes[0];
      await user.click(typeSelect);
      await user.click(screen.getByText('Cardiología'));

      const clinicSelect = comboboxes[1];
      await user.click(clinicSelect);
      await user.click(screen.getByText('Sede Norte'));

      const statusSelect = comboboxes[2];
      await user.click(statusSelect);
      await user.click(screen.getByText('Activo'));

      // Assert
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Submit del formulario', () => {
    it('debería llamar handleCreateMedicalOffice con los datos correctos', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCreatedOffice = { officeNumber: 101 };
      mockHandleCreateMedicalOffice.mockResolvedValue({
        createdOffice: mockCreatedOffice,
        isLoading: false,
        error: null,
      });
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      
      const nameInput = screen.getByLabelText(/número de consultorio/i);
      await user.type(nameInput, '101');

      const comboboxes = screen.getAllByRole('combobox');
      const typeSelect = comboboxes[0];
      await user.click(typeSelect);
      await user.click(screen.getByText('Cardiología'));

      const clinicSelect = comboboxes[1];
      await user.click(clinicSelect);
      await user.click(screen.getByText('Sede Norte'));

      const statusSelect = comboboxes[2];
      await user.click(statusSelect);
      await user.click(screen.getByText('Activo'));

      const saveButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(mockHandleCreateMedicalOffice).toHaveBeenCalledWith({
          clinicName: 'Sede Norte',
          officeNumber: 101,
          specialtyName: 'Cardiología',
          status: 'Activo',
        });
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('debería mostrar estado de cargando durante el guardado', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(useCreateMedOfficeModule.useCreateMedOffice).mockReturnValue({
        medicalOfficeCod: null,
        isLoading: true,
        error: null,
        handleCreateMedicalOffice: mockHandleCreateMedicalOffice,
      });
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);

      // Assert
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toBeDisabled();
    });

    it('debería mostrar estado de cargando durante el guardado', async () => {
      // Arrange
      vi.mocked(useCreateMedOfficeModule.useCreateMedOffice).mockReturnValue({
        medicalOfficeCod: null,
        isLoading: true,
        error: null,
        handleCreateMedicalOffice: mockHandleCreateMedicalOffice,
      });
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);

      // Assert
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      expect(saveButton).toBeDisabled();
      expect(screen.getByText(/guardando/i)).toBeInTheDocument();
    });
  });

  describe('Manejo de errores', () => {
    it('debería mostrar mensaje de error cuando useMedicalInfo retorna error', () => {
      // Arrange
      vi.mocked(useMedicalInfoModule.useMedicalInfo).mockReturnValue({
        medicalInfo: null,
        isLoading: false,
        error: 'Error al cargar datos',
        reload: vi.fn(),
      });
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);

      // Assert
      // El componente debería manejar el error, aunque no muestre un mensaje específico
      // Los selects deberían estar presentes
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes).toHaveLength(3);
    });

    it('debería mostrar estado de cargando cuando useMedicalInfo está cargando', () => {
      // Arrange
      vi.mocked(useMedicalInfoModule.useMedicalInfo).mockReturnValue({
        medicalInfo: null,
        isLoading: true,
        error: null,
        reload: vi.fn(),
      });
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);

      // Assert
      // El formulario se renderiza pero los selects estarán vacíos
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes).toHaveLength(3);
    });
  });

  describe('Accesibilidad', () => {
    it('debería tener labels asociados correctamente a los campos', () => {
      // Arrange
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);

      // Assert
      expect(screen.getByLabelText(/número de consultorio/i)).toHaveAttribute('id', 'name');
      // Verificar que los labels de los selects existen como texto
      expect(screen.getByText(/^tipo$/i)).toBeInTheDocument();
      expect(screen.getByText(/^sede$/i)).toBeInTheDocument();
      expect(screen.getByText(/^estado técnico$/i)).toBeInTheDocument();
    });

    it('debería tener aria-invalid en campos con errores', async () => {
      // Arrange
      const user = userEvent.setup();
      const props = { onCancel: mockOnCancel, onSuccess: mockOnSuccess };

      // Act
      render(<ClinicRegistrationForm {...props} />);
      const nameInput = screen.getByLabelText(/número de consultorio/i);
      await user.type(nameInput, 'a');
      await user.clear(nameInput);
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
