import { CustomConnectButton } from "./CustomConnectButton";

export const Navbar = () => {
  return (
    <nav className="w-full flex items-center justify-end p-3 border-b border-white/10">
      <CustomConnectButton />
    </nav>
  );
};
