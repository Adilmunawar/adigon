
import AuthForm from "@/components/AuthForm";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <AuthForm />
      <footer className="absolute bottom-4 text-center text-muted-foreground text-sm">
        proudly developed by "Adil Munawar"
      </footer>
    </div>
  );
};

export default AuthPage;
