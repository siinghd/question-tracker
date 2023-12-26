import { auth, signIn } from '@/auth';
import Image from 'next/image';
import { redirect } from 'next/navigation';

const LoginPage = async () => {
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }
  return (
    <div className="flex items-center h-dvh dark:bg-gray-800">
      <div className="mx-auto max-w-sm space-y-8  ">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Login Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Please login to your account.
          </p>
        </div>
        <div className="space-y-6">
          <form
            action={async () => {
              'use server';
              await signIn('discord', {}, 'scope=identify guilds email');
            }}
          >
            <button
              type="submit"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex justify-center items-center space-x-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Image
                alt="Discord logo"
                height="20"
                src="/images/discord-icon.svg"
                style={{
                  aspectRatio: '20/20',
                  objectFit: 'cover',
                }}
                width="20"
              />
              <span>Login with Discord</span>
            </button>
          </form>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Why should you log in with Discord? This is to ensure that only
          members of the Cohort server are granted access.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
