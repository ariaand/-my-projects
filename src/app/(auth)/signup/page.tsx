import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign up — Henry" };

export default function SignupPage() {
  return (
    <AuthForm
      mode="signup"
      title="Hire your AI coworker"
      subtitle="Create an account to spin up your Henry workspace."
    />
  );
}
