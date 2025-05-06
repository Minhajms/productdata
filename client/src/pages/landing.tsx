import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, TrendingUp, Layers, Zap, Clock, Shield, Star } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export function Landing() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Social proof quotes from users
  const testimonials = [
    {
      quote: "This tool increased our product listing efficiency by 300%. Our team now focuses on strategy instead of data entry.",
      author: "Sarah J.",
      role: "E-commerce Manager",
      company: "HomeGoods Direct"
    },
    {
      quote: "We saw a 45% increase in click-through rates after optimizing our listings with this platform. The ROI is incredible.",
      author: "Michael T.",
      role: "Marketplace Seller",
      company: "TechAccessories Pro"
    },
    {
      quote: "The AI enhancement saved us countless hours of copywriting and improved our product descriptions dramatically.",
      author: "Jessica W.",
      role: "Digital Marketing Lead",
      company: "Fashion Forward"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Attention-grabbing first impression */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 relative overflow-hidden">
        {/* Abstract shapes for visual interest */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-0 right-0 bg-white/10 w-96 h-96 rounded-full -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 bg-white/5 w-64 h-64 rounded-full -mb-10 -ml-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              {/* Problem-solution framing in headline */}
              <div className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-blue-100 uppercase bg-blue-700 bg-opacity-50 rounded-full mb-6">
                AI-Powered Product Enhancement
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Transform <span className="underline decoration-yellow-400 decoration-4 underline-offset-2">incomplete data</span> into <span className="underline decoration-yellow-400 decoration-4 underline-offset-2">high-converting</span> marketplace listings
              </h1>
              
              {/* Clear value proposition */}
              <p className="text-xl text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0">
                Our AI instantly enhances product titles, descriptions and features to boost sales on Amazon, eBay, Shopify and more.
              </p>
              
              {/* Urgency + Clear CTA */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/app">
                  <Button size="lg" className="w-full sm:w-auto text-base bg-yellow-500 hover:bg-yellow-400 text-gray-900">
                    Transform Your Products <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto text-base border-white text-white hover:bg-white/10"
                  onClick={() => setVideoModalOpen(true)}
                >
                  Watch How It Works
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6">
                <div className="text-white/80 text-sm">Trusted by 1,200+ sellers</div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-blue-700"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-300 border-2 border-blue-700"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-300 border-2 border-blue-700"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-700 border-2 border-blue-700 flex items-center justify-center text-xs text-white">+</div>
                </div>
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-white/80 text-sm">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Visual transformation of products to aid understanding */}
            <div className="relative mx-auto lg:mx-0 max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg transform rotate-3"></div>
              <div className="relative bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                <div className="flex">
                  <div className="w-1/2 p-4 border-r border-gray-200">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 mb-2">BEFORE</div>
                      <div className="h-40 mb-4 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs p-2">
                        <div className="text-center space-y-1">
                          <div className="font-medium text-red-500">Bluetooth Headphones</div>
                          <div className="text-gray-500 text-xs italic">No description</div>
                          <div className="text-gray-500 text-xs italic">Missing features</div>
                          <div className="text-gray-500 text-xs italic">No brand info</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">Conversion Rate: 1.2%</div>
                    </div>
                  </div>
                  <div className="w-1/2 p-4 bg-green-50">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 mb-2">AFTER</div>
                      <div className="h-40 mb-4 bg-white rounded-lg border border-green-200 p-2 text-xs shadow-sm">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">Premium Wireless Bluetooth Headphones with Active Noise Cancellation</div>
                          <div className="text-gray-600 text-xs">Immersive sound quality with 30-hour battery life</div>
                          <ul className="text-xs text-gray-600 pl-3 space-y-0.5">
                            <li>• Active noise cancellation</li>
                            <li>• 30-hour battery life</li>
                            <li>• Bluetooth 5.0 connection</li>
                          </ul>
                          <div className="text-gray-600 text-xs">Brand: SoundElite</div>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-green-600">Conversion Rate: 5.4%</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t border-gray-200">
                  <span className="text-green-600 font-semibold">350% increase</span> in conversion rate!
                </div>
              </div>
              
              {/* Floating stats to reinforce value */}
              <div className="absolute -bottom-6 -left-6 bg-yellow-400 rounded-lg px-4 py-2 text-gray-900 font-medium text-sm shadow-lg">
                ⚡ 5 minutes to set up
              </div>
              <div className="absolute -top-6 -right-6 bg-indigo-800 text-white rounded-lg px-4 py-2 font-medium text-sm shadow-lg">
                📈 45% higher CTR
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points section - Show understanding of user problems */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stop Wasting Time on Product Listings</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Most sellers struggle with these common product data challenges that hurt sales performance:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-red-500">
              <div className="text-red-500 mb-4">
                <Clock className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Time-Consuming Process</h3>
              <p className="text-gray-600">
                Sellers spend 15+ hours per week writing and optimizing product listings manually, taking time away from growing their business.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-red-500">
              <div className="text-red-500 mb-4">
                <TrendingUp className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Poor Conversion Rates</h3>
              <p className="text-gray-600">
                Generic product descriptions and missing information lead to low click-through rates and lost sales opportunities.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-red-500">
              <div className="text-red-500 mb-4">
                <Layers className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Platform Stress</h3>
              <p className="text-gray-600">
                Adapting listings for different marketplace requirements creates inconsistency and formatting headaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section - Feature focusing on benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full mb-4">The Solution</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Enhancement in Three Simple Steps</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transform incomplete product data into optimized listings in minutes without copywriting skills or technical knowledge.
            </p>
          </div>
          
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-24 left-0 w-full h-0.5 bg-indigo-100 z-0 hidden md:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="bg-white p-8 rounded-lg shadow-md text-center relative">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-xl font-bold">1</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Your Data</h3>
                <p className="text-gray-600 mb-4">
                  Simply upload your CSV file with basic product information - even if it's incomplete or unformatted.
                </p>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-4xl text-gray-400">📊</div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-xl font-bold">2</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Select Marketplace</h3>
                <p className="text-gray-600 mb-4">
                  Choose your target marketplace and our AI automatically applies the right formatting requirements.
                </p>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-4xl text-gray-400">🏪</div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-xl font-bold">3</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Enhanced Listings</h3>
                <p className="text-gray-600 mb-4">
                  Our AI fills in missing information, optimizes titles, and creates compelling descriptions ready for export.
                </p>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-4xl text-gray-400">✨</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link href="/app">
                <Button size="lg" className="mx-auto bg-indigo-600 hover:bg-indigo-700">
                  Try It Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-gray-500 text-sm mt-4">No credit card required • Free for up to 10 products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof section - Builds trust */}
      <section className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Over 1,200 Sellers</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how e-commerce businesses are transforming their product listings and boosting sales.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md relative">
                <div className="absolute -top-4 -right-4 text-6xl text-indigo-200 opacity-50">"</div>
                <div className="text-gray-600 mb-6 relative z-10">
                  "{testimonial.quote}"
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
              <div className="col-span-1 md:col-span-1 text-center md:text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real Results</h3>
                <p className="text-gray-600">Average improvements seen by our customers:</p>
              </div>
              
              <div className="col-span-1 text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">45%</div>
                <p className="text-gray-600 text-sm">Higher click-through rates</p>
              </div>
              
              <div className="col-span-1 text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">3.5x</div>
                <p className="text-gray-600 text-sm">Faster listing creation</p>
              </div>
              
              <div className="col-span-1 text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">28%</div>
                <p className="text-gray-600 text-sm">Increase in conversion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Clear next step */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Product Listings?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join thousands of sellers who are saving time and increasing sales with AI-enhanced product listings.
          </p>
          <Link href="/app">
            <Button size="lg" className="mx-auto text-base bg-white text-indigo-700 hover:bg-indigo-50">
              Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-indigo-200">No credit card required • Free for up to 10 products</p>
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-indigo-300 mr-2" />
              <span className="text-sm">Secure & Private</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-indigo-300 mr-2" />
              <span className="text-sm">5-Minute Setup</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-indigo-300 mr-2" />
              <span className="text-sm">AI-Enhanced Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Video modal (simplified for this example) */}
      {videoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setVideoModalOpen(false)}>
          <div className="bg-white rounded-lg overflow-hidden max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">See How It Works</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setVideoModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-center p-8">
                <div className="text-5xl mb-4">🎬</div>
                <p>Video demonstration would play here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;