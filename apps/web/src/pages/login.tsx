import LoginForm from '@/components/modules/auth/LoginForm';

const LoginPage = () => {
  return (
    <main className="relative flex min-h-dvh flex-col justify-center overflow-hidden p-8">
      <LoginForm className="mx-auto w-full max-w-3xl rounded-xl p-8 shadow-2xl" />
    </main>
  );
};

export default LoginPage;
