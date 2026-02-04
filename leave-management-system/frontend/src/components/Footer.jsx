function Footer() {
  return (
    <footer className="bg-teal-600 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-xl font-bold tracking-tight">LeaveMS</h2>
        <div className="flex flex-wrap gap-6 text-sm md:text-base">
          <a href="#features" className="hover:text-teal-200 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-teal-200 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-teal-200 transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-teal-200 transition-colors">Contact</a>
          <a href="#" className="hover:text-teal-200 transition-colors">Privacy</a>
          <a href="#" className="hover:text-teal-200 transition-colors">Terms</a>
        </div>
        <p className="text-xs md:text-sm mt-4 md:mt-0">&copy; 2026 LeaveMS. Built for educational institutions.</p>
      </div>
    </footer>
  );
}

export default Footer;
