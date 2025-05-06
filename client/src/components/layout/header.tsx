import { Link } from "wouter";
import { ShoppingBasket, HelpCircle } from "lucide-react";

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
              <Link href="/">
                <a className="text-gray-600 hover:text-primary text-sm font-medium">Dashboard</a>
              </Link>
            </li>
            <li>
              <Link href="/history">
                <a className="text-gray-600 hover:text-primary text-sm font-medium">History</a>
              </Link>
            </li>
            <li>
              <Link href="/settings">
                <a className="text-gray-600 hover:text-primary text-sm font-medium">Settings</a>
              </Link>
            </li>
            <li>
              <button className="flex items-center text-gray-600 hover:text-primary text-sm font-medium">
                <HelpCircle className="h-4 w-4 mr-1" />
                Help
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
