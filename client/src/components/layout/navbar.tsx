export const Navbar = () => {
  return (
    <div className="flex flex-col p-12 items-center justify-center">
      <nav className="fixed top-0 left-0 right-0 bg-neutral-800 border-b border-neutral-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-medium">Logo</div>
        </div>
      </nav>
    </div>
  );
};
