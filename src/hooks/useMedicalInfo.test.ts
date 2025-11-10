import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMedicalInfo } from './useMedicalInfo';
import * as medicalOfficeApi from '@/api/medicalOffice.api';
import { MedicalInformation } from '@/models/MedicalInformation';

// Mock de la API
vi.mock('@/api/medicalOffice.api');

describe('useMedicalInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Estado inicial', () => {
    it('debería inicializar con valores por defecto antes de cargar', () => {
      // Arrange
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties).mockImplementation(
        () => new Promise(() => {}) // Promesa que nunca se resuelve
      );

      // Act
      const { result } = renderHook(() => useMedicalInfo());

      // Assert
      expect(result.current.medicalInfo).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.reload).toBeDefined();
      expect(typeof result.current.reload).toBe('function');
    });
  });

  describe('useEffect - Carga automática al montar', () => {
    it('debería cargar la información médica automáticamente al montar el hook', async () => {
      // Arrange
      const mockMedicalInfo: MedicalInformation = {
        clinics: [
          { idClinic: 1, name: 'Clínica Norte', type: 'Privada', location: 'Norte', phoneNumber: '123', status: 'Activo' },
          { idClinic: 2, name: 'Clínica Sur', type: 'Pública', location: 'Sur', phoneNumber: '456', status: 'Activo' }
        ],
        specialties: [
          { idSpecialty: 1, specialtyName: 'Cardiología' },
          { idSpecialty: 2, specialtyName: 'Neurología' }
        ]
      };
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties).mockResolvedValue(mockMedicalInfo);

      // Act
      const { result } = renderHook(() => useMedicalInfo());

      // Assert
      expect(medicalOfficeApi.findClinicsAndSpecialties).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(result.current.medicalInfo).toEqual(mockMedicalInfo);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('debería establecer isLoading en true durante la carga inicial', async () => {
      // Arrange
      let resolvePromise: (value: MedicalInformation) => void;
      const promise = new Promise<MedicalInformation>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties).mockReturnValue(promise);

      // Act
      const { result } = renderHook(() => useMedicalInfo());

      // Assert - Durante la carga
      expect(result.current.isLoading).toBe(true);
      expect(result.current.medicalInfo).toBeNull();

      // Resolver la promesa
      const mockData: MedicalInformation = {
        clinics: [],
        specialties: []
      };
      resolvePromise!(mockData);

      // Assert - Después de cargar
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.medicalInfo).toEqual(mockData);
      });
    });

    it('debería manejar errores durante la carga inicial', async () => {
      // Arrange
      const mockError = new Error('Error de red');
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties).mockRejectedValue(mockError);

      // Act
      const { result } = renderHook(() => useMedicalInfo());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('Error al cargar la información médica');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.medicalInfo).toBeNull();
      });
      expect(console.error).toHaveBeenCalledWith(mockError);
    });
  });

  describe('reload - Recarga manual', () => {
    it('debería recargar la información médica al llamar reload', async () => {
      // Arrange
      const initialData: MedicalInformation = {
        clinics: [{ idClinic: 1, name: 'Clínica A', type: 'Privada', location: 'Centro', phoneNumber: '111', status: 'Activo' }],
        specialties: [{ idSpecialty: 1, specialtyName: 'Pediatría' }]
      };
      const newData: MedicalInformation = {
        clinics: [
          { idClinic: 1, name: 'Clínica A', type: 'Privada', location: 'Centro', phoneNumber: '111', status: 'Activo' },
          { idClinic: 2, name: 'Clínica B', type: 'Pública', location: 'Norte', phoneNumber: '222', status: 'Activo' }
        ],
        specialties: [
          { idSpecialty: 1, specialtyName: 'Pediatría' },
          { idSpecialty: 2, specialtyName: 'Geriatría' }
        ]
      };
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties)
        .mockResolvedValueOnce(initialData);
      
      const { result } = renderHook(() => useMedicalInfo());

      // Esperar a que se cargue inicialmente
      await waitFor(() => {
        expect(result.current.medicalInfo).toEqual(initialData);
      });

      // Act - Recargar con nuevos datos
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties)
        .mockResolvedValueOnce(newData);
      await result.current.reload();

      // Assert
      await waitFor(() => {
        expect(result.current.medicalInfo).toEqual(newData);
      });
      expect(medicalOfficeApi.findClinicsAndSpecialties).toHaveBeenCalledTimes(2);
    });

    it('debería establecer isLoading durante la recarga manual', async () => {
      // Arrange
      const initialData: MedicalInformation = {
        clinics: [],
        specialties: []
      };
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties)
        .mockResolvedValueOnce(initialData);
      
      const { result } = renderHook(() => useMedicalInfo());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - Preparar recarga con promesa pendiente
      let resolvePromise: (value: MedicalInformation) => void;
      const promise = new Promise<MedicalInformation>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties).mockReturnValue(promise);
      
      const reloadPromise = result.current.reload();

      // Assert - Durante la recarga
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Completar la recarga
      resolvePromise!({ clinics: [], specialties: [] });
      await reloadPromise;

      // Assert - Después de la recarga
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('debería limpiar el error anterior al recargar exitosamente', async () => {
      // Arrange - Primera carga con error
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties)
        .mockRejectedValueOnce(new Error('Error inicial'));
      
      const { result } = renderHook(() => useMedicalInfo());

      await waitFor(() => {
        expect(result.current.error).toBe('Error al cargar la información médica');
      });

      // Act - Recarga exitosa
      const successData: MedicalInformation = {
        clinics: [{ idClinic: 1, name: 'Clínica X', type: 'Mixta', location: 'Este', phoneNumber: '333', status: 'Activo' }],
        specialties: []
      };
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties)
        .mockResolvedValueOnce(successData);
      
      await result.current.reload();

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.medicalInfo).toEqual(successData);
      });
    });

    it('debería actualizar el error al fallar la recarga', async () => {
      // Arrange - Carga inicial exitosa
      const initialData: MedicalInformation = {
        clinics: [],
        specialties: []
      };
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties)
        .mockResolvedValueOnce(initialData);
      
      const { result } = renderHook(() => useMedicalInfo());

      await waitFor(() => {
        expect(result.current.medicalInfo).toEqual(initialData);
      });

      // Act - Recarga con error
      const reloadError = new Error('Error al recargar');
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties)
        .mockRejectedValueOnce(reloadError);
      
      await result.current.reload();

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('Error al cargar la información médica');
      });
      expect(console.error).toHaveBeenCalledWith(reloadError);
    });
  });

  describe('Casos edge', () => {
    it('debería manejar datos vacíos correctamente', async () => {
      // Arrange
      const emptyData: MedicalInformation = {
        clinics: [],
        specialties: []
      };
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties).mockResolvedValue(emptyData);

      // Act
      const { result } = renderHook(() => useMedicalInfo());

      // Assert
      await waitFor(() => {
        expect(result.current.medicalInfo).toEqual(emptyData);
        expect(result.current.error).toBeNull();
      });
    });

    it('debería manejar respuestas con muchas clínicas y especialidades', async () => {
      // Arrange
      const largeData: MedicalInformation = {
        clinics: Array.from({ length: 100 }, (_, i) => ({
          idClinic: i + 1,
          name: `Clínica ${i + 1}`,
          type: 'Privada',
          location: `Ubicación ${i + 1}`,
          phoneNumber: `${3000000000 + i}`,
          status: 'Activo'
        })),
        specialties: Array.from({ length: 50 }, (_, i) => ({
          idSpecialty: i + 1,
          specialtyName: `Especialidad ${i + 1}`
        }))
      };
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties).mockResolvedValue(largeData);

      // Act
      const { result } = renderHook(() => useMedicalInfo());

      // Assert
      await waitFor(() => {
        expect(result.current.medicalInfo).toEqual(largeData);
        expect(result.current.medicalInfo?.clinics).toHaveLength(100);
        expect(result.current.medicalInfo?.specialties).toHaveLength(50);
      });
    });

    it('debería establecer isLoading en false incluso cuando hay error', async () => {
      // Arrange
      vi.mocked(medicalOfficeApi.findClinicsAndSpecialties)
        .mockRejectedValue(new Error('Fallo total'));

      // Act
      const { result } = renderHook(() => useMedicalInfo());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).not.toBeNull();
      });
    });
  });
});
