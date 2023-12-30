import { auth, signOut } from '@/auth';

const CLogoutButton = async () => {
  const session = await auth();

  return (
    session !== null && (
      <div className="flex items-center">
        <form
          action={async () => {
            'use server';
            await signOut({
              redirectTo: '/login',
            });
          }}
          className="w-full flex"
        >
          <button type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
              />
            </svg>
          </button>
        </form>
      </div>
    )
  );
};
export default CLogoutButton;
