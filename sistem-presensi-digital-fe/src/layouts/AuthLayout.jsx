import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center selection:bg-primary selection:text-primary-foreground">
      <Outlet />
    </div>
  );
}

export default AuthLayout;
