import { SigninForm } from "@/components/auth/signin-form";

const SignInPage = () => {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center p-6 md:p-10 relative z-0 bg-gradient-purple overflow-auto">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SigninForm />
      </div>
    </div>
  );
};

export default SignInPage;
