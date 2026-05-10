import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Log in — Henry" };

export default function LoginPage() {
  return (
    <AuthForm
      mode="login"
      title="Welcome back"
      subtitle="Log in to your Henry workspace."
    />
  );
}
