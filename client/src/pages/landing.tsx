import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, TrendingUp, Layers, Zap } from "lucide-react";
import { Link } from "wouter";

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Transform Incomplete Product Data into <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Marketplace-Ready</span> Listings
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Our AI-powered tool enhances your product data for Amazon, eBay, Shopify, and other major marketplaces with just a few clicks.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/app">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See Demo
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-full h-full absolute -top-2 -left-2 border-2 border-primary rounded-lg"></div>
                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
                  <div className="p-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-md font-semibold text-gray-700">Before Enhancement</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start">
                      <div className="text-red-500 mt-1 mr-2">✖</div>
                      <div className="text-sm text-gray-600">Missing product descriptions</div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-red-500 mt-1 mr-2">✖</div>
                      <div className="text-sm text-gray-600">Generic titles without keywords</div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-red-500 mt-1 mr-2">✖</div>
                      <div className="text-sm text-gray-600">No bullet points</div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-red-500 mt-1 mr-2">✖</div>
                      <div className="text-sm text-gray-600">Inconsistent data formats</div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-32 -right-4 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <div className="w-full h-full absolute -bottom-2 -right-2 border-2 border-primary rounded-lg mt-6">
                </div>
                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 mt-6">
                  <div className="p-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-md font-semibold text-gray-700">After Enhancement</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start">
                      <div className="text-green-500 mt-1 mr-2">✓</div>
                      <div className="text-sm text-gray-600">SEO-optimized titles with keywords</div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-green-500 mt-1 mr-2">✓</div>
                      <div className="text-sm text-gray-600">Detailed product descriptions</div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-green-500 mt-1 mr-2">✓</div>
                      <div className="text-sm text-gray-600">Feature-rich bullet points</div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-green-500 mt-1 mr-2">✓</div>
                      <div className="text-sm text-gray-600">Marketplace-ready formats</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform transforms incomplete product data into marketplace-ready listings with these powerful capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Enhancement</h3>
              <p className="text-gray-600">
                Our advanced AI fills in missing product information, creates SEO-friendly titles, and writes compelling descriptions.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Marketplace Support</h3>
              <p className="text-gray-600">
                Export your enhanced product data in formats compatible with Amazon, eBay, Shopify, Walmart, and more.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Conversion Optimization</h3>
              <p className="text-gray-600">
                Increase click-through rates and conversions with SEO-optimized titles and compelling product features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Results Our Customers See</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transform your product listings and see real business impact with our AI-powered enhancement tool.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-3">45%</div>
              <p className="text-gray-600">Average increase in click-through rates with enhanced product listings</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-3">3x</div>
              <p className="text-gray-600">Faster listing creation compared to manual enhancement processes</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-3">98%</div>
              <p className="text-gray-600">Of users report improved product visibility in marketplace search results</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About Us</h2>
              <p className="text-lg text-gray-600 mb-6">
                We're a team of e-commerce specialists and AI experts dedicated to solving the common challenges sellers face when listing products across multiple marketplaces.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our mission is to help e-commerce businesses save time, increase conversion rates, and grow their revenue through optimized product listings.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1" />
                  <p className="text-gray-600">Founded by e-commerce veterans with 15+ years of marketplace experience</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1" />
                  <p className="text-gray-600">Trusted by over 1,000 merchants across 20+ countries</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1" />
                  <p className="text-gray-600">Processed more than 10 million product listings to date</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Our team working" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Product Listings?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Join thousands of sellers who are using our platform to create marketplace-ready product listings in minutes.
          </p>
          <Link href="/app">
            <Button size="lg" variant="secondary" className="mx-auto">
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Landing;