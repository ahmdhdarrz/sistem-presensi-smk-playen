import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getRoleLabel } from "@/utils/roles";

function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-lg space-y-6">
        <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="size-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/15 text-destructive">
            403 - Akses Ditolak
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground my-0">
            Hak Akses Tidak Mencukupi
          </h1>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Akun Anda berkategori <strong className="text-foreground">{getRoleLabel(user?.role)}</strong> tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto font-semibold gap-2 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali</span>
          </Button>

          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2 cursor-pointer"
          >
            <Home className="size-4" />
            <span>Ke Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
