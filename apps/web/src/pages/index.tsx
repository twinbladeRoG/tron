import { useNavigate } from 'react-router';
import { Button } from '@mantine/core';

import Navbar from '@/components/modules/shared/Navbar';
import { BackgroundLines } from '@/components/ui/background-lines';

const Home = () => {
  const navigate = useNavigate();

  const handleChat = async () => {
    await navigate('/chat');
  };

  const handleLogin = async () => {
    await navigate('/login');
  };

  return (
    <main className="flow-root">
      <Navbar className="fixed top-0 z-10 w-full p-4" />
      <section className="relative h-dvh w-full">
        <BackgroundLines className="flex w-full flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
          <div className="absolute top-1/2 left-1/2 flex -translate-1/2 flex-col items-center">
            <h1 className="mb-6 text-center">
              <span className="pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-center text-7xl leading-none font-bold tracking-tighter whitespace-pre-wrap text-transparent">
                {import.meta.env.VITE_APP_NAME}
              </span>
            </h1>
            <h2 className="mb-6">AI Agentic Orchestration</h2>

            <div className="flex gap-4">
              <Button
                variant="gradient"
                gradient={{ from: 'red', to: 'indigo', deg: 127 }}
                onClick={handleChat}>
                Chat
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: 'red', to: 'indigo', deg: 127 }}
                onClick={handleLogin}>
                Login
              </Button>
            </div>
          </div>
        </BackgroundLines>
      </section>
    </main>
  );
};

export default Home;
