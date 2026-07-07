import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />
      <main className="container mx-auto px-4 py-sp-6 max-w-6xl">
        {children}
      </main>
    </div>
  );
};

export default Layout;
