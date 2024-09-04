export const Navbar = () => {
  return (
    <div className="flex border-b border-b-neutral-700 bg-neutral-800 py-2 px-8 items-center justify-between">
      <div>Ring Network Simulator</div>
      <div className="rounded-full grid place-items-center bg-neutral-500 w-8 h-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </div>
  );
};
