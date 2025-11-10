import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findClinicsAndSpecialties, createMedicalOffice } from './medicalOffice.api';
import * as httpClient from './httpClient';
import { MedicalInformation } from '@/models/MedicalInformation';
import { MedicalOffice } from '@/models/MedicalOffice';
import { MedicalOfficeCod } from '@/models/MedicalOfficeCod';

// Mock del httpClient
vi.mock('./httpClient');

describe('medicalOffice.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findClinicsAndSpecialties', () => {
    it('debería llamar al endpoint de medical-offices con método GET', async () => {
      // Arrange
      const mockData: MedicalInformation = {
        clinics: [],
        specialties: [],
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockData);

      // Act
      await findClinicsAndSpecialties();

      // Assert
      expect(httpClient.http).toHaveBeenCalledWith('/medical-offices', {
        method: 'GET',
      });
      expect(httpClient.http).toHaveBeenCalledTimes(1);
    });

    it('debería retornar clínicas y especialidades correctamente', async () => {
      // Arrange
      const mockData: MedicalInformation = {
        clinics: [
          {
            idClinic: 1,
            name: 'Clínica Norte',
            type: 'Privada',
            location: 'Norte',
            phoneNumber: '3001234567',
            status: 'Activo',
          },
          {
            idClinic: 2,
            name: 'Clínica Sur',
            type: 'Pública',
            location: 'Sur',
            phoneNumber: '3009876543',
            status: 'Activo',
          },
        ],
        specialties: [
          {
            idSpecialty: 1,
            specialtyName: 'Cardiología',
          },
          {
            idSpecialty: 2,
            specialtyName: 'Neurología',
          },
        ],
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockData);

      // Act
      const result = await findClinicsAndSpecialties();

      // Assert
      expect(result).toEqual(mockData);
      expect(result.clinics).toHaveLength(2);
      expect(result.specialties).toHaveLength(2);
    });

    it('debería retornar estructura vacía cuando no hay datos', async () => {
      // Arrange
      const mockData: MedicalInformation = {
        clinics: [],
        specialties: [],
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockData);

      // Act
      const result = await findClinicsAndSpecialties();

      // Assert
      expect(result.clinics).toEqual([]);
      expect(result.specialties).toEqual([]);
    });

    it('debería propagar errores de red', async () => {
      // Arrange
      const error = new Error('Network failure');
      vi.mocked(httpClient.http).mockRejectedValue(error);

      // Act & Assert
      await expect(findClinicsAndSpecialties()).rejects.toThrow('Network failure');
    });

    it('debería propagar errores HTTP', async () => {
      // Arrange
      const error = new Error('HTTP error! status: 500');
      vi.mocked(httpClient.http).mockRejectedValue(error);

      // Act & Assert
      await expect(findClinicsAndSpecialties()).rejects.toThrow('HTTP error! status: 500');
    });

    it('debería manejar respuestas con muchas clínicas', async () => {
      // Arrange
      const mockData: MedicalInformation = {
        clinics: Array.from({ length: 50 }, (_, i) => ({
          idClinic: i + 1,
          name: `Clínica ${i + 1}`,
          type: 'Privada',
          location: `Ubicación ${i + 1}`,
          phoneNumber: `300${i.toString().padStart(7, '0')}`,
          status: 'Activo',
        })),
        specialties: [],
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockData);

      // Act
      const result = await findClinicsAndSpecialties();

      // Assert
      expect(result.clinics).toHaveLength(50);
      expect(result.clinics?.[0].name).toBe('Clínica 1');
      expect(result.clinics?.[49].name).toBe('Clínica 50');
    });

    it('debería manejar respuestas con muchas especialidades', async () => {
      // Arrange
      const mockData: MedicalInformation = {
        clinics: [],
        specialties: Array.from({ length: 30 }, (_, i) => ({
          idSpecialty: i + 1,
          specialtyName: `Especialidad ${i + 1}`,
        })),
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockData);

      // Act
      const result = await findClinicsAndSpecialties();

      // Assert
      expect(result.specialties).toHaveLength(30);
      expect(result.specialties?.[0].specialtyName).toBe('Especialidad 1');
      expect(result.specialties?.[29].specialtyName).toBe('Especialidad 30');
    });

    it('debería retornar datos con estructura completa', async () => {
      // Arrange
      const mockData: MedicalInformation = {
        clinics: [
          {
            idClinic: 1,
            name: 'Hospital Central',
            type: 'Público',
            location: 'Centro',
            phoneNumber: '3001112222',
            status: 'Activo',
          },
        ],
        specialties: [
          {
            idSpecialty: 1,
            specialtyName: 'Pediatría',
          },
        ],
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockData);

      // Act
      const result = await findClinicsAndSpecialties();

      // Assert
      expect(result.clinics?.[0]).toHaveProperty('idClinic');
      expect(result.clinics?.[0]).toHaveProperty('name');
      expect(result.clinics?.[0]).toHaveProperty('type');
      expect(result.clinics?.[0]).toHaveProperty('location');
      expect(result.clinics?.[0]).toHaveProperty('phoneNumber');
      expect(result.clinics?.[0]).toHaveProperty('status');
      expect(result.specialties?.[0]).toHaveProperty('idSpecialty');
      expect(result.specialties?.[0]).toHaveProperty('specialtyName');
    });
  });

  describe('createMedicalOffice', () => {
    it('debería llamar al endpoint de creación con método POST', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Norte',
        specialtyName: 'Cardiología',
        officeNumber: 101,
        status: 'Activo',
      };
      const mockResponse: MedicalOfficeCod = {
        idClinic: 1,
        idSpecialty: 1,
        officeNumber: 101,
        status: 'Activo',
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockResponse);

      // Act
      await createMedicalOffice(newOffice);

      // Assert
      expect(httpClient.http).toHaveBeenCalledWith('/medical-offices/create-by-name', {
        method: 'POST',
        body: JSON.stringify(newOffice),
      });
      expect(httpClient.http).toHaveBeenCalledTimes(1);
    });

    it('debería retornar el consultorio creado con sus IDs', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Sur',
        specialtyName: 'Neurología',
        officeNumber: 202,
        status: 'Disponible',
      };
      const mockResponse: MedicalOfficeCod = {
        idClinic: 2,
        idSpecialty: 2,
        officeNumber: 202,
        status: 'Disponible',
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockResponse);

      // Act
      const result = await createMedicalOffice(newOffice);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.idClinic).toBe(2);
      expect(result.idSpecialty).toBe(2);
      expect(result.officeNumber).toBe(202);
      expect(result.status).toBe('Disponible');
    });

    it('debería serializar correctamente el body como JSON', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Hospital Central',
        specialtyName: 'Pediatría',
        officeNumber: 303,
        status: 'Activo',
      };
      const mockResponse: MedicalOfficeCod = {
        idClinic: 3,
        idSpecialty: 3,
        officeNumber: 303,
        status: 'Activo',
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockResponse);

      // Act
      await createMedicalOffice(newOffice);

      // Assert
      const expectedBody = JSON.stringify(newOffice);
      expect(httpClient.http).toHaveBeenCalledWith(
        '/medical-offices/create-by-name',
        expect.objectContaining({
          body: expectedBody,
        })
      );
    });

    it('debería propagar errores cuando falla la creación', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Inexistente',
        specialtyName: 'Especialidad Inválida',
        officeNumber: 999,
        status: 'Activo',
      };
      const error = new Error('HTTP error! status: 400');
      vi.mocked(httpClient.http).mockRejectedValue(error);

      // Act & Assert
      await expect(createMedicalOffice(newOffice)).rejects.toThrow('HTTP error! status: 400');
    });

    it('debería propagar errores de red', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Test',
        specialtyName: 'Test',
        officeNumber: 100,
        status: 'Activo',
      };
      const networkError = new Error('Network failure');
      vi.mocked(httpClient.http).mockRejectedValue(networkError);

      // Act & Assert
      await expect(createMedicalOffice(newOffice)).rejects.toThrow('Network failure');
    });

    it('debería manejar nombres de clínicas con caracteres especiales', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica San José & María',
        specialtyName: 'Ginecología',
        officeNumber: 401,
        status: 'Activo',
      };
      const mockResponse: MedicalOfficeCod = {
        idClinic: 4,
        idSpecialty: 4,
        officeNumber: 401,
        status: 'Activo',
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockResponse);

      // Act
      const result = await createMedicalOffice(newOffice);

      // Assert
      expect(httpClient.http).toHaveBeenCalledWith(
        '/medical-offices/create-by-name',
        expect.objectContaining({
          body: JSON.stringify(newOffice),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('debería manejar diferentes estados', async () => {
      // Arrange
      const statuses = ['Activo', 'Disponible', 'Mantenimiento', 'Fuera de servicio'];
      const offices: MedicalOffice[] = statuses.map((status, i) => ({
        clinicName: `Clínica ${i + 1}`,
        specialtyName: `Especialidad ${i + 1}`,
        officeNumber: 100 + i,
        status,
      }));

      offices.forEach((office, i) => {
        vi.mocked(httpClient.http).mockResolvedValueOnce({
          idClinic: i + 1,
          idSpecialty: i + 1,
          officeNumber: 100 + i,
          status: office.status,
        });
      });

      // Act & Assert
      for (const office of offices) {
        const result = await createMedicalOffice(office);
        expect(result.status).toBe(office.status);
      }

      expect(httpClient.http).toHaveBeenCalledTimes(4);
    });

    it('debería manejar números de consultorio grandes', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Grande',
        specialtyName: 'Cirugía',
        officeNumber: 9999,
        status: 'Activo',
      };
      const mockResponse: MedicalOfficeCod = {
        idClinic: 10,
        idSpecialty: 10,
        officeNumber: 9999,
        status: 'Activo',
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockResponse);

      // Act
      const result = await createMedicalOffice(newOffice);

      // Assert
      expect(result.officeNumber).toBe(9999);
    });

    it('debería enviar todos los campos requeridos', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Completa',
        specialtyName: 'Medicina General',
        officeNumber: 501,
        status: 'Disponible',
      };
      const mockResponse: MedicalOfficeCod = {
        idClinic: 5,
        idSpecialty: 5,
        officeNumber: 501,
        status: 'Disponible',
      };
      vi.mocked(httpClient.http).mockResolvedValue(mockResponse);

      // Act
      await createMedicalOffice(newOffice);

      // Assert
      const callArgs = vi.mocked(httpClient.http).mock.calls[0];
      const bodyData = JSON.parse(callArgs[1]?.body as string);
      expect(bodyData).toHaveProperty('clinicName');
      expect(bodyData).toHaveProperty('specialtyName');
      expect(bodyData).toHaveProperty('officeNumber');
      expect(bodyData).toHaveProperty('status');
      expect(Object.keys(bodyData)).toHaveLength(4);
    });

    it('debería manejar respuestas de conflicto (409)', async () => {
      // Arrange
      const newOffice: MedicalOffice = {
        clinicName: 'Clínica Norte',
        specialtyName: 'Cardiología',
        officeNumber: 101,
        status: 'Activo',
      };
      const error = new Error('HTTP error! status: 409');
      vi.mocked(httpClient.http).mockRejectedValue(error);

      // Act & Assert
      await expect(createMedicalOffice(newOffice)).rejects.toThrow('HTTP error! status: 409');
    });

    it('debería crear múltiples consultorios secuencialmente', async () => {
      // Arrange
      const offices: MedicalOffice[] = [
        { clinicName: 'Clínica A', specialtyName: 'Spec A', officeNumber: 1, status: 'Activo' },
        { clinicName: 'Clínica B', specialtyName: 'Spec B', officeNumber: 2, status: 'Activo' },
        { clinicName: 'Clínica C', specialtyName: 'Spec C', officeNumber: 3, status: 'Activo' },
      ];

      offices.forEach((_, i) => {
        vi.mocked(httpClient.http).mockResolvedValueOnce({
          idClinic: i + 1,
          idSpecialty: i + 1,
          officeNumber: i + 1,
          status: 'Activo',
        });
      });

      // Act
      const results = await Promise.all(offices.map((office) => createMedicalOffice(office)));

      // Assert
      expect(results).toHaveLength(3);
      expect(httpClient.http).toHaveBeenCalledTimes(3);
      results.forEach((result, i) => {
        expect(result.officeNumber).toBe(i + 1);
      });
    });
  });
});
