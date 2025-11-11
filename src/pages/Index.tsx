import { useState } from "react";
import { User } from "@/models/User";
import { LoginForm } from "@/components/LoginForm";
import { MedInfoTest } from "@/pages/medInfoTest";
import { ClinicRegistrationForm } from "@/components/ClinicRegistrationForm";
import { ClinicsDashboard } from "@/components/ClinicsDashboard";
import { AppSidebar } from "@/components/AppSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";

type AppState = "login" | "medical-info" | "clinic-registration" | "dashboard" | "unauthorized";

const Index = () => {
  const [currentView, setCurrentView] = useState<AppState>("login");
  const [user, setUser] = useState<User>()

  const handleLoginSuccess = (user: User) => {
    if (user.userRole === "administrador") {
      setUser(user)
      setCurrentView("dashboard");
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema de gestión de consultorios",
      });
    } else {
      setCurrentView("unauthorized");
      toast({
        title: "Acceso restringido",
        description: "No tienes permisos para acceder a este módulo",
        variant: "destructive",
      });
    }
  };

  const handleClinicCancel = () => {
    setCurrentView("dashboard");
  };

  const handleClinicSuccess = () => {
    toast({
      title: "Consultorio registrado",
      description: "El consultorio ha sido registrado exitosamente",
    });
    // In a real app, this would navigate to the dashboard
    setCurrentView("dashboard");
  };

  switch (currentView) {
    case "login":
      return <LoginForm onLoginSuccess={handleLoginSuccess} />;
    case "medical-info":
      return <MedInfoTest/>
    case "clinic-registration":
      return (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar name={user.name} lastName = {user.lastName} email={user.email} />
            <div className="flex-1">
              <ClinicRegistrationForm 
                onCancel={handleClinicCancel}
                onSuccess={handleClinicSuccess}
              />
            </div>
          </div>
        </SidebarProvider>
      );
    case "dashboard":
      return (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar name={user.name} lastName = {user.lastName} email={user.email} />
            <ClinicsDashboard onNewClinic={() => setCurrentView("clinic-registration")} />
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