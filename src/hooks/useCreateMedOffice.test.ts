import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCreateMedOffice } from './useCreateMedOffice';
import * as medicalOfficeApi from '@/api/medicalOffice.api';
import { MedicalOffice } from '@/models/MedicalOffice';
import { MedicalOfficeCod } from '@/models/MedicalOfficeCod';

// Mock de la API
vi.mock('@/api/medicalOffice.api');

describe('useCreateMedOffice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Estado inicial', () => {
    it('debería inicializar con valores por defecto', () => {
      // Arrange & Act
      const { result } = renderHook(() => useCreateMedOffice());

      // Assert
      expect(result.current.medicalOfficeCod).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.handleCreateMedicalOffice).toBeDefined();
      expect(typeof result.current.handleCreateMedicalOffice).toBe('function');
    });
  });

  describe('handleCreateMedicalOffice - Caso exitoso', () => {
    it('debería crear un consultorio y actualizar el estado correctamente', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Norte',
        specialtyName: 'Cardiología',
        officeNumber: 101,
        status: 'Activo'
      };
      const mockCreatedOffice: MedicalOfficeCod = {
        idClinic: 1,
        idSpecialty: 1,
        officeNumber: 101,
        status: 'Activo'
      };
      vi.mocked(medicalOfficeApi.createMedicalOffice).mockResolvedValue(mockCreatedOffice);
      const { result } = renderHook(() => useCreateMedOffice());

      // Act
      const response = await result.current.handleCreateMedicalOffice(newOffice);

      // Assert
      expect(medicalOfficeApi.createMedicalOffice).toHaveBeenCalledWith(newOffice);
      expect(medicalOfficeApi.createMedicalOffice).toHaveBeenCalledTimes(1);
      expect(response?.createdOffice).toEqual(mockCreatedOffice);
      await waitFor(() => {
        expect(result.current.medicalOfficeCod).toEqual(mockCreatedOffice);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('debería establecer isLoading en true durante la llamada a la API', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Sur',
        specialtyName: 'Cirugía',
        officeNumber: 201,
        status: 'Disponible'
      };
      let resolvePromise: (value: MedicalOfficeCod) => void;
      const promise = new Promise<MedicalOfficeCod>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(medicalOfficeApi.createMedicalOffice).mockReturnValue(promise);
      const { result } = renderHook(() => useCreateMedOffice());

      // Act
      const callPromise = result.current.handleCreateMedicalOffice(newOffice);

      // Assert - Durante la carga
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Completar la promesa
      resolvePromise!({
        idClinic: 2,
        idSpecialty: 2,
        officeNumber: 201,
        status: 'Disponible'
      });

      await callPromise;

      // Assert - Después de completar
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('debería retornar el consultorio creado en el objeto de respuesta', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Este',
        specialtyName: 'Análisis',
        officeNumber: 301,
        status: 'Activo'
      };
      const mockCreatedOffice: MedicalOfficeCod = {
        idClinic: 3,
        idSpecialty: 3,
        officeNumber: 301,
        status: 'Activo'
      };
      vi.mocked(medicalOfficeApi.createMedicalOffice).mockResolvedValue(mockCreatedOffice);
      const { result } = renderHook(() => useCreateMedOffice());

      // Act
      const response = await result.current.handleCreateMedicalOffice(newOffice);

      // Assert
      expect(response).toBeDefined();
      expect(response?.createdOffice).toEqual(mockCreatedOffice);
      expect(response?.isLoading).toBe(false); // isLoading ya cambió a false en el finally
      expect(response?.error).toBeNull();
    });
  });

  describe('handleCreateMedicalOffice - Manejo de errores', () => {
    it('debería establecer el error cuando la API falla', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Oeste',
        specialtyName: 'Pediatría',
        officeNumber: 102,
        status: 'Activo'
      };
      const mockError = new Error('Error de red');
      vi.mocked(medicalOfficeApi.createMedicalOffice).mockRejectedValue(mockError);
      const { result } = renderHook(() => useCreateMedOffice());

      // Act
      await result.current.handleCreateMedicalOffice(newOffice);

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('Error al crear el nuevo consultorio');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.medicalOfficeCod).toBeNull();
      });
      expect(console.error).toHaveBeenCalledWith(mockError);
    });

    it('debería limpiar el error anterior en una nueva llamada exitosa', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Centro',
        specialtyName: 'Medicina General',
        officeNumber: 103,
        status: 'Activo'
      };
      const mockCreatedOffice: MedicalOfficeCod = {
        idClinic: 4,
        idSpecialty: 4,
        officeNumber: 103,
        status: 'Activo'
      };
      const { result } = renderHook(() => useCreateMedOffice());

      // Act - Primera llamada con error
      vi.mocked(medicalOfficeApi.createMedicalOffice).mockRejectedValueOnce(new Error('Error'));
      await result.current.handleCreateMedicalOffice(newOffice);

      await waitFor(() => {
        expect(result.current.error).toBe('Error al crear el nuevo consultorio');
      });

      // Act - Segunda llamada exitosa
      vi.mocked(medicalOfficeApi.createMedicalOffice).mockResolvedValueOnce(mockCreatedOffice);
      await result.current.handleCreateMedicalOffice(newOffice);

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.medicalOfficeCod).toEqual(mockCreatedOffice);
      });
    });

    it('debería establecer isLoading en false incluso cuando hay un error', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Hospital Central',
        specialtyName: 'Emergencias',
        officeNumber: 401,
        status: 'Disponible'
      };
      vi.mocked(medicalOfficeApi.createMedicalOffice).mockRejectedValue(new Error('Fallo'));
      const { result } = renderHook(() => useCreateMedOffice());

      // Act
      await result.current.handleCreateMedicalOffice(newOffice);

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Múltiples llamadas', () => {
    it('debería manejar múltiples creaciones de consultorios secuencialmente', async () => {
      // Arrange
      const office1: MedicalOffice = {
        clinicName: 'Clínica A',
        specialtyName: 'Neurología',
        officeNumber: 501,
        status: 'Activo'
      };
      const office2: MedicalOffice = {
        clinicName: 'Clínica B',
        specialtyName: 'Dermatología',
        officeNumber: 502,
        status: 'Activo'
      };
      const createdOffice1: MedicalOfficeCod = {
        idClinic: 5,
        idSpecialty: 5,
        officeNumber: 501,
        status: 'Activo'
      };
      const createdOffice2: MedicalOfficeCod = {
        idClinic: 6,
        idSpecialty: 6,
        officeNumber: 502,
        status: 'Activo'
      };
      const { result } = renderHook(() => useCreateMedOffice());

      // Act - Primera creación
      vi.mocked(medicalOfficeApi.createMedicalOffice).mockResolvedValueOnce(createdOffice1);
      await result.current.handleCreateMedicalOffice(office1);

      await waitFor(() => {
        expect(result.current.medicalOfficeCod).toEqual(createdOffice1);
      });

      // Act - Segunda creación
      vi.mocked(medicalOfficeApi.createMedicalOffice).mockResolvedValueOnce(createdOffice2);
      await result.current.handleCreateMedicalOffice(office2);

      // Assert
      await waitFor(() => {
        expect(result.current.medicalOfficeCod).toEqual(createdOffice2);
      });
      expect(medicalOfficeApi.createMedicalOffice).toHaveBeenCalledTimes(2);
    });
  });
});
