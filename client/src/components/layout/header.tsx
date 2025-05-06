import { Link } from "wouter";
import { ShoppingBasket } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={`bg-white shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <ShoppingBasket className="text-primary mr-2 h-6 w-6" />
          <h1 className="text-xl font-semibold text-gray-900">Product Data Enhancer</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-gray-600 hover:text-primary text-sm font-medium">
                Home
              </Link>
            </li>
            <li>
              <Link href="/app" className="text-gray-600 hover:text-primary text-sm font-medium">
                Get Started
              </Link>
            </li>
            <li>
              <Link href="#features" className="text-gray-600 hover:text-primary text-sm font-medium">
                Features
              </Link>
            </li>
            <li>
              <Link href="#about" className="text-gray-600 hover:text-primary text-sm font-medium">
                About Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
