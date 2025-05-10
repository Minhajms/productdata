import MarketMindAgent from "@/components/MarketMindAgent";

export default function MarketMindPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">MarketMind AI</h2>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">BETA</span>
            </div>
            <nav>
              <ul className="flex space-x-6">
                <li><a href="#" className="text-sm hover:underline">Dashboard</a></li>
                <li><a href="#" className="text-sm hover:underline">History</a></li>
                <li><a href="#" className="text-sm hover:underline">Settings</a></li>
                <li><a href="#" className="text-sm bg-white/20 px-3 py-1 rounded-md hover:bg-white/30">Help</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      <main>
        <MarketMindAgent />
      </main>
      
      <footer className="bg-gray-100 dark:bg-gray-900 py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} MarketMind AI. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Terms</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}