import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  School, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LoaderCircle, 
  CheckCircle2,
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ identity: "", password: "" });
  const [generalError, setGeneralError] = useState("");

  const validateForm = () => {
    let isValid = true;
    const newErrors = { identity: "", password: "" };

    if (!identity.trim()) {
      newErrors.identity = "Email atau username wajib diisi.";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password wajib diisi.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const result = await login(identity, password);
    setIsLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setGeneralError(result.message || "Username atau password tidak sesuai.");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* Left Branding Area (Deep Blue with Yellow Accent) */}
        <div className="lg:col-span-5 bg-[var(--sidebar)] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Accent Background Glow */}
          <div className="absolute -top-16 -left-16 size-48 rounded-full bg-[var(--accent)]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 size-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-11 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md shrink-0">
                <School className="size-6" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold tracking-tight text-white my-0">
                  SMK Muhammadiyah 1 Playen
                </h2>
                <p className="text-xs text-amber-300 font-medium">
                  Sistem Presensi Digital
                </p>
              </div>
            </div>

            <div className="pt-6 hidden sm:block text-left space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight my-0">
                Efisiensi & Transparansi Presensi Sekolah
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pengelolaan presensi siswa dan tenaga pengajar secara cerdas, tepat waktu, dan terstruktur dalam satu platform terpadu.
              </p>
            </div>
          </div>

          {/* Key Value Points (Desktop) */}
          <div className="hidden lg:flex flex-col gap-3 py-6 relative z-10 text-left">
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="size-4 text-[var(--accent)] shrink-0" />
              <span>Pencatatan kehadiran real-time</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="size-4 text-[var(--accent)] shrink-0" />
              <span>Rekapitulasi otomatis & akurat</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="size-4 text-[var(--accent)] shrink-0" />
              <span>Akses terpusat untuk Guru dan Admin</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="relative z-10 pt-4 text-left">
            <p className="text-[11px] text-slate-400">
              &copy; {new Date().getFullYear()} SMK Muhammadiyah 1 Playen. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Form Area (Clean White Surface) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center text-left bg-card">
          <div className="mb-6 space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight my-0">
              Selamat Datang Kembali
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Masukkan kredensial akun Anda untuk mengakses sistem.
            </p>
          </div>

          {generalError && (
            <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identity Field */}
            <div className="space-y-1.5">
              <Label htmlFor="identity" className="text-xs font-semibold text-foreground">
                Email atau Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="identity"
                  type="text"
                  placeholder="Masukkan email atau username"
                  value={identity}
                  onChange={(e) => {
                    setIdentity(e.target.value);
                    if (errors.identity) setErrors((prev) => ({ ...prev, identity: "" }));
                  }}
                  className={`pl-9 ${errors.identity ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.identity && (
                <p className="text-[12px] text-destructive font-medium mt-1">
                  {errors.identity}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`pl-9 pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-[12px] text-destructive font-medium mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                disabled={isLoading}
              />
              <label
                htmlFor="remember"
                className="text-xs font-medium leading-none text-muted-foreground cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ingat saya
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full font-medium h-10 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
