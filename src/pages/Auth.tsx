
import AuthForm from "@/components/AuthForm";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          {/* Primary floating orb */}
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/30 opacity-60 blur-[100px] animate-pulse"></div>
          
          {/* Secondary floating orbs */}
          <div className="absolute left-1/3 right-0 bottom-0 -z-10 h-[200px] w-[200px] rounded-full bg-secondary/25 opacity-50 blur-[80px] animate-pulse delay-1000"></div>
          
          <div className="absolute right-1/4 top-1/4 -z-10 h-[150px] w-[150px] rounded-full bg-accent/20 opacity-40 blur-[60px] animate-pulse delay-2000"></div>
          
          {/* Moving gradient orbs */}
          <div className="absolute left-1/4 bottom-1/3 -z-10 h-[180px] w-[180px] rounded-full bg-gradient-to-r from-primary/20 to-accent/20 opacity-30 blur-[70px] animate-float"></div>
          
          <div className="absolute right-1/3 top-1/3 -z-10 h-[120px] w-[120px] rounded-full bg-gradient-to-l from-secondary/25 to-primary/15 opacity-35 blur-[50px] animate-float delay-1500"></div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="w-full max-w-md animate-scale-in">
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
