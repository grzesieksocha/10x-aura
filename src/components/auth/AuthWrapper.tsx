import { AuthProvider } from "../hooks/useAuth";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>;
}

export function AuthWrapperWithForm({ FormComponent }: { FormComponent: React.ComponentType }) {
  return (
    <AuthProvider>
      <FormComponent />
    </AuthProvider>
  );
}
