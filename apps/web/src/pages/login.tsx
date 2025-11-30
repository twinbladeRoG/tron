import LoginForm from '@/components/modules/auth/LoginForm';
import Navbar from '@/components/modules/shared/Navbar';

const LoginPage = () => {
  return (
    <main className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-gray-100 p-8 dark:bg-gray-950">
      <Navbar backTo="/" className="fixed top-0 left-0 z-10 w-full p-4" />
      <LoginForm className="mx-auto w-full max-w-xl rounded-xl p-8 shadow-2xl" />
    </main>
  );
};

export default LoginPage;
