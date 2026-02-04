import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full fixed top-0 z-50 bg-teal-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight">LeaveMS</h2>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <button className="px-5 py-2 rounded-full bg-white text-teal-600 font-semibold hover:bg-teal-100 transition-all">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-5 py-2 rounded-full bg-white text-teal-600 font-semibold hover:bg-teal-100 transition-all">
              Register
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
