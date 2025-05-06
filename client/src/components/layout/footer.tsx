import { Code, FileText, HelpCircle } from "lucide-react";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={`bg-white border-t ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a 
              href="#" 
              className="text-gray-400 hover:text-gray-500"
              aria-label="Support"
            >
              <HelpCircle className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-gray-500"
              aria-label="Documentation"
            >
              <FileText className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-gray-500"
              aria-label="GitHub"
            >
              <Code className="h-5 w-5" />
            </a>
          </div>
          <p className="mt-8 text-center md:mt-0 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Product Data Enhancer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
