import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User } from '@/models/User';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: "El correo electrónico es requerido" })
    .email({ message: "Ingrese un correo electrónico válido" })
    .max(255, { message: "El correo debe tener menos de 255 caracteres" }),
  password: z
    .string()
    .nonempty({ message: "La contraseña es requerida" })
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(100, { message: "La contraseña debe tener menos de 100 caracteres" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLoginSuccess: (userRole: string) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { handleLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try{
      const user = await handleLogin(data.email, data.password);
      // Check the role
      console.log("Entering to administrator step check")
      if(typeof user === "object" &&
      user !== null &&
      "idRole" in user &&
      typeof user.idRole === "number" &&
      user.idRole === 3) {
        console.log(user.idRole)
        onLoginSuccess("admin")
      } 
    } catch (err) {
      setError("Error de conexión. Inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-light-gray p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-medical-dark">
            Inicio de sesión
          </CardTitle>
          <CardDescription className="text-medical-gray">
            para acceder al módulo de gestión de consultorios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium text-medical-dark"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@medicaladmin.com"
                autoComplete="email"
                className={`transition-colors ${
                  errors.email 
                    ? "border-destructive focus:border-destructive" 
                    : "border-medical-border focus:border-medical-primary"
                }`}
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription id="email-error" className="text-sm">
                    {errors.email.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-medium text-medical-dark"
              >
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`pr-10 transition-colors ${
                    errors.password 
                      ? "border-destructive focus:border-destructive" 
                      : "border-medical-border focus:border-medical-primary"
                  }`}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-medical-gray hover:text-medical-dark transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription id="password-error" className="text-sm">
                    {errors.password.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              variant="medical"
              className="w-full h-11 text-base font-medium"
              disabled={!isDirty || !isValid || isLoading}
              aria-describedby="login-status"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            <div id="login-status" className="sr-only" aria-live="polite">
              {isLoading && "Procesando inicio de sesión"}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}