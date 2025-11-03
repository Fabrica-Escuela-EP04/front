import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface Clinic {
  idClinic: number;
  name: string;
  type: string;
  location: string;
  phoneNumber: string;
  status: string;
}

interface Specialty {
  idSpecialty: number;
  specialtyName: string;
}

interface MedicalInfo {
  clinics: Clinic[];
  specialties: Specialty[];
}

export function MedInfoTest() {

  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo | null>(null);

  const getMedicalInfo = async () => {
    try{
      const res = await fetch("/medical-offices");
      const data = await res.json();
      console.log("data recibida", data);
      setMedicalInfo(data);
    } catch (error){
      console.error("Error al cargar los listados", error);
    }
    
  }

  useEffect(()=>{
    getMedicalInfo();
  },[])

  return (
    <div className="min-h-screen bg-medical-light-gray">
      {/* Sidebar */}
      <div className="flex">
        <div className="w-64 bg-medical-light-gray border-r border-medical-border min-h-screen p-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-medical-primary rounded flex items-center justify-center">
              <Building2 className="h-5 w-5 text-medical-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-medical-dark">Medical</h1>
              <p className="text-sm text-medical-gray">Admin</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-medical-dark bg-medical-primary/10 rounded-md">
              <Building2 className="h-4 w-4" />
              DASHBOARD
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader className="text-center border-b border-medical-border">
              <CardTitle className="text-xl font-semibold text-medical-dark">
                NUEVO CONSULTORIO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <h3>CLINICAS</h3>
              <div>
                {
                    medicalInfo?.clinics?.map((clinic) =>(
                          <div >
                            <h5>{clinic.name}</h5>
                            <p>Tipo: {clinic.type}</p>
                            <p>Dirección: {clinic.location}</p>
                            <p>Telefono: {clinic.phoneNumber}</p>
                            <p>Estado: {clinic.status}</p>
                        </div>
                        ) 
                    ) 
                }
              </div>
              <h3>ESPECIALIDADES</h3>
              <div>
                {
                    medicalInfo?.specialties?.map((specialty) =>(
                        <div key={specialty.idSpecialty}>
                            <p>Nombre especialidad: {specialty.specialtyName}</p>
                        </div>
                        )
                    )
                }
              </div>
            </CardContent>
          </Card>

          {/* User info in bottom left */}
          <div className="fixed bottom-4 left-4 text-xs text-medical-gray">
            <p>ADMIN USER</p>
            <p>admin@medicaladmin.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}