import { useState } from "react";
import { User } from "@/models/User";
import { LoginForm } from "@/components/LoginForm";
import { MedInfoTest } from "@/pages/medInfoTest";
import { ClinicRegistrationForm } from "@/components/ClinicRegistrationForm";
import { ClinicsDashboard } from "@/components/ClinicsDashboard";
import { AppSidebar } from "@/components/AppSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";
import { loadInitialDashboardData } from "@/services/medical.service";
import { MedicalInformation } from "@/models/MedicalInformation";
import { MedicalOfficeAndSchedule } from "@/models/MedicalOfficeAndSchedule";
import { MedicalOffice } from "@/models/MedicalOffice";
import { useLogout } from "@/hooks/useLogout";

type AppState = "login" | "medical-info" | "clinic-registration" | "dashboard" | "unauthorized";

const Index = () => {
  const [currentView, setCurrentView] = useState<AppState>("login");
  const [user, setUser] = useState<User>();
  const [error, setError] = useState<string | null>(null);
  const [medInfo, setMedInfo] = useState<MedicalInformation>();
  const [medOfficesSchedules, setMedOfficesSchedules] = useState<MedicalOfficeAndSchedule[]>();
   const { handleLogout } = useLogout();
  
  const normalizeStatus = (medOffices:MedicalOfficeAndSchedule[]) => {
      medOffices.map((office) => office.status = office.status.charAt(0) + office.status.slice(1).toLowerCase());
      return medOffices;
  }

  const addUserId = (medOffices:MedicalOfficeAndSchedule[], user) => {
      console.log("entre a esta funcion");
      console.log("idUser:" + user.idUser);
      medOffices.map((office) => office.idUser = user.idUser);
      return medOffices;
  }

  async function logout() {
    try {
      await handleLogout(); // ← llamada a tu backend
      setCurrentView("login");
      toast({
            title: "Cierre de sesión exitoso",
            description: "Ha cerrado correctamente su sesión",
          });
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  }

  const handleLoginSuccess = async (user: User) => {
    if (user.userRole !== "administrador") {
      setCurrentView("unauthorized");
      toast({
        title: "Acceso restringido",
        description: "No tienes permisos para acceder a este módulo",
        variant: "destructive",
      });
      return;
    }
    
    setUser(user)
    console.log("Login exitoso!");
    try{
      const { medicalInfo, medOfficesAndSchedules } = await loadInitialDashboardData();

      if (typeof medicalInfo === "object" && typeof medOfficesAndSchedules === "object"){
        
        if ("clinics" in medicalInfo && Array.isArray(medOfficesAndSchedules) 
            && medOfficesAndSchedules.length >0 && "idOffice" in medOfficesAndSchedules[0]){
          console.log("Info cargada correctamente!")
          setMedInfo(medicalInfo);
          let normalizedOffices = normalizeStatus(medOfficesAndSchedules);
          console.log("Normalizadas");
          normalizedOffices = addUserId(medOfficesAndSchedules, user);
         //console.log("Added user id");
          setMedOfficesSchedules(normalizedOffices);
          setCurrentView("dashboard");
          toast({
            title: "Inicio de sesión exitoso",
            description: "Bienvenido al sistema de gestión de consultorios",
          });
        }
        else if("detail" in medicalInfo || "detail" in medOfficesAndSchedules){
          setError("Hubo un error al iniciar sesión, por favor intente más tarde");
          setCurrentView("login");
        }
      } 
    } catch (err) {
      setError("Error de conexión. Inténtelo de nuevo más tarde.");
    }
    
  };

  const handleClinicCancel = () => {
    setCurrentView("dashboard");
  };

  const handleClinicSuccess = (newOffice:MedicalOffice) => {
    toast({
      title: "Consultorio registrado",
      description: "El consultorio ha sido registrado exitosamente",
    });
    // Update MedicalOffice Information with new office
    const createdOffice:MedicalOfficeAndSchedule = {
      "idOffice": newOffice.idOffice,
      "idUser": user.idUser,
      "officeNumber": newOffice.officeNumber,
      "clinicName": newOffice.clinicName,
      "specialtyName": newOffice.specialtyName,
      "status": newOffice.status
    }
    let updatedMedOfficesList = medOfficesSchedules;
    updatedMedOfficesList.push(createdOffice);
    setMedOfficesSchedules(updatedMedOfficesList);
    // In a real app, this would navigate to the dashboard
    setCurrentView("dashboard");
  };

  switch (currentView) {
    case "login":
      return <LoginForm errorMessage = {error} onLoginSuccess={handleLoginSuccess} />;
    case "medical-info":
      return <MedInfoTest/>
    case "clinic-registration":
      return (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar name={user.name} lastName = {user.lastName} email={user.email} 
                        onLogoutHandle={logout}/>
            <div className="flex-1">
              <ClinicRegistrationForm 
                onCancel={handleClinicCancel}
                onSuccess={handleClinicSuccess}
                medicalInfo={medInfo}
              />
            </div>
          </div>
        </SidebarProvider>
      );
    case "dashboard":
      return (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar name={user.name} lastName = {user.lastName} email={user.email} 
                        onLogoutHandle={logout}/>
            <ClinicsDashboard onNewClinic={() => setCurrentView("clinic-registration")} 
              medicalInfo={medInfo} medOfficesAndSchedules={medOfficesSchedules}  />
          </div>
        </SidebarProvider>
      );
    case "unauthorized":
      return (
        <div className="min-h-screen bg-medical-light-gray flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-medical-dark">Acceso Restringido</h1>
            <p className="text-medical-gray">No tienes permisos para acceder al módulo de gestión de consultorios.</p>
            <button
              onClick={() => setCurrentView("login")}
              className="text-medical-primary hover:underline"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default Index;