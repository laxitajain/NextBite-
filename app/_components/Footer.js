import Logo from "./Logo";

function Footer() {
  return (
    <footer className="w-full mt-4 bg-primary px-8 pb-2">
      <div className="flex flex-col m-2 space-y-2 items-center justify-between px-4 w-full text-accent-rust">
        <Logo location="footer" />
        <span>&copy; Laxita Jain, 2025. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
