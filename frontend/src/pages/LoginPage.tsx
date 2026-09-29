import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { ClipboardList, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button, Input } from "@/components/ui-kit";
import { useAuth } from "@/contexts/auth.context";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { ApiError } from "@/services/api";

export function LoginPage() {
  const navigate = useNavigate({ from: "/" });
  const { user, loading, signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, navigate]);

  async function submit(data: LoginFormData) {
    setAuthError("");
    try {
      await signIn(data.username, data.password);
      navigate({ to: "/dashboard" });
    } catch (error) {
      setAuthError(error instanceof ApiError ? error.message : "Não foi possível autenticar.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5 sm:p-10">
      <section className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-display text-lg font-bold">Bit - Portal de Solicitações</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Bem-vindo de volta</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Acesse sua conta</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Entre para registrar e acompanhar solicitações internas de forma simples e centralizada.
          </p>
        </div>
        {authError && (
          <div className="mt-6 rounded-md border border-destructive/25 bg-danger-subtle p-3 text-sm text-destructive">
            {authError}
          </div>
        )}
        <form className="mt-7 grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
          <Input
            label="Usuário"
            placeholder="Digite seu usuário"
            {...register("username", { onChange: () => setAuthError("") })}
            error={errors.username?.message}
            autoComplete="username"
          />
          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              {...register("password", { onChange: () => setAuthError("") })}
              error={errors.password?.message}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-2 top-7 grid size-8 place-items-center text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </section>
    </main>
  );
}
