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
  AlertCircle,
  Users,
  ArrowRight,
  ShieldCheck,
  Clock
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

    if (!validateForm()) return;

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#F4F7FB] relative overflow-hidden font-sans text-left">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#E3E3F5]/60 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/60 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      {/* Subtle Dotted Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00008B 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="w-full max-w-[1040px] bg-white border border-[#E3E3F5] rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,120,0.15)] flex flex-col md:flex-row overflow-hidden relative z-10 min-h-[600px]">
        
        {/* Left Branding Panel */}
        <div className="w-full md:w-[48%] bg-[#0B3B82] text-white p-8 md:p-10 lg:p-12 flex flex-col relative overflow-hidden shrink-0">
          
          {/* Subtle Background Overlay (to simulate building / gradients) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B3B82] via-[#082E6B] to-[#041B44] opacity-90"></div>
          
          {/* Yellow and Blue Curves at bottom */}
          <svg className="absolute bottom-0 left-0 w-full h-auto" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '35%', bottom: 0, left: 0, transform: 'translateY(2px)' }}>
            <path d="M0,80 Q25,30 50,60 T100,20 L100,100 L0,100 Z" fill="#041B44" opacity="0.6" />
            <path d="M0,100 Q40,60 80,95 T100,50 L100,100 L0,100 Z" fill="#F5C518" />
            <path d="M0,100 Q40,65 80,98 T100,55 L100,100 L0,100 Z" fill="#002D72" />
          </svg>

          {/* Logo & School Name */}
          <div className="relative z-10 flex items-center gap-3 mb-10">
            {/* Simulated School Emblem */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-[#F5C518] rounded-full scale-[0.8] shadow-sm"></div>
              <div className="absolute inset-0 rotate-45 bg-[#F5C518] rounded-full scale-[0.8] shadow-sm"></div>
              <div className="absolute inset-0 rotate-12 bg-[#F5C518] rounded-[20%] scale-[0.9] shadow-sm"></div>
              <div className="absolute inset-[4px] bg-[#002D72] rounded-full flex items-center justify-center z-10">
                <School className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-[17px] font-bold leading-[1.1] tracking-wide m-0 !text-white">
                SMK Muhammadiyah 1<br/>Playen
              </h2>
              <p className="text-[11px] font-medium text-[#A6C0E3] m-0 mt-0.5">
                Sistem Presensi Digital
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="relative z-10 mb-8">
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-[1.2] tracking-tight mb-4 !text-white m-0">
              Efisiensi &<br/>Transparansi<br/>
              <span className="text-[#F5C518]">Presensi Sekolah</span>
            </h1>
            <p className="text-[#A6C0E3] text-sm leading-relaxed max-w-[90%] font-medium m-0">
              Pengelolaan presensi siswa dan tenaga pengajar secara cerdas, tepat waktu, dan terstruktur dalam satu platform terpadu.
            </p>
          </div>

          {/* Benefits List */}
          <div className="relative z-10 space-y-5 flex-grow">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold !text-white m-0">Pencatatan kehadiran real-time</h3>
                <p className="text-[11px] text-[#A6C0E3] mt-0.5 m-0 font-medium">Data presensi selalu terupdate</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold !text-white m-0">Rekapitulasi otomatis & akurat</h3>
                <p className="text-[11px] text-[#A6C0E3] mt-0.5 m-0 font-medium">Minim kesalahan, maksimal efisiensi</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold !text-white m-0">Akses terpusat untuk Guru dan Admin</h3>
                <p className="text-[11px] text-[#A6C0E3] mt-0.5 m-0 font-medium">Kelola data dengan mudah dan aman</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="w-full md:w-[52%] bg-white p-8 md:p-12 lg:p-14 flex flex-col justify-between">
          <div className="w-full max-w-[360px] mx-auto">
            
            {/* Form Header */}
            <div className="mb-8">
              <div className="w-12 h-12 rounded-full bg-[#F0F4F8] flex items-center justify-center mb-6 text-[#002D72]">
                <Users className="w-6 h-6 fill-current" />
              </div>
              <h2 className="text-[26px] font-extrabold text-[#002D72] mb-2 m-0 tracking-tight">
                Selamat Datang Kembali
              </h2>
              <p className="text-[#64748B] text-sm m-0 font-medium">
                Masukkan kredensial akun Anda untuk mengakses sistem.
              </p>
            </div>

            {/* Error Message Alert */}
            {generalError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{generalError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Identity Field */}
              <div className="space-y-1.5">
                <Label htmlFor="identity" className="text-[13px] font-bold text-[#002D72]">
                  Email atau Username
                </Label>
                <div className="relative group">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${errors.identity ? 'text-red-500' : 'text-[#64748B] group-focus-within:text-[#002D72]'}`} />
                  <Input
                    id="identity"
                    type="text"
                    placeholder="admin_piket_1"
                    value={identity}
                    onChange={(e) => {
                      setIdentity(e.target.value);
                      if (errors.identity) setErrors((prev) => ({ ...prev, identity: "" }));
                    }}
                    className={`h-[46px] pl-[38px] pr-4 bg-[#F4F7FB] border-[#E2E8F0] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#002D72] focus-visible:border-[#002D72] rounded-xl text-[14px] shadow-none transition-all font-medium placeholder:font-normal placeholder:text-[#94A3B8] ${errors.identity ? "border-red-300 bg-red-50 focus-visible:ring-red-200 focus-visible:border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.identity && (
                  <p className="text-sm text-red-500 font-medium mt-1.5 animate-in slide-in-from-top-1">
                    {errors.identity}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[13px] font-bold text-[#002D72]">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${errors.password ? 'text-red-500' : 'text-[#64748B] group-focus-within:text-[#002D72]'}`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={`h-[46px] pl-[38px] pr-12 bg-[#F4F7FB] border-[#E2E8F0] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#002D72] focus-visible:border-[#002D72] rounded-xl text-[14px] shadow-none transition-all font-medium placeholder:font-normal placeholder:text-[#94A3B8] tracking-widest ${errors.password ? "border-red-300 bg-red-50 focus-visible:ring-red-200 focus-visible:border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#002D72] hover:bg-black/5 transition-colors focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 font-medium mt-1.5 animate-in slide-in-from-top-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  disabled={isLoading}
                  className="rounded border-[#CBD5E1] data-[state=checked]:bg-[#002D72] data-[state=checked]:text-white w-4 h-4 shadow-none"
                />
                <label
                  htmlFor="remember"
                  className="text-[13px] font-medium leading-none text-[#64748B] cursor-pointer select-none"
                >
                  Ingat saya
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-[46px] text-[15px] font-bold rounded-xl bg-[#0047AB] text-white hover:bg-[#003C8F] active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(0,71,171,0.39)] hover:shadow-[0_6px_20px_rgba(0,71,171,0.23)] flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer Area: Watermark & Copyright */}
          <div className="w-full max-w-[360px] mx-auto mt-12 pt-6 border-t border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center opacity-40 grayscale shrink-0">
                 {/* KKN Logo placeholder (two leaf shapes) */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.06 19.43 4 16.05 4 12C4 7.95 7.06 4.57 11 4.07V19.93ZM13 4.07C16.94 4.57 20 7.95 20 12C20 16.05 16.94 19.43 13 19.93V4.07Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase leading-none">
                  KKN TEMATIK SEKOLAH
                </span>
                <span className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase leading-none mt-1">
                  UNIT I.C.1 - UAD
                </span>
              </div>
            </div>
            
            <p className="text-[10px] text-[#94A3B8] font-medium m-0">
              &copy; {new Date().getFullYear()} SMK Muhammadiyah 1 Playen. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
