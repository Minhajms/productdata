import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, TrendingUp, Layers, Zap, Clock, Shield, Star, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export function Landing() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [countdownValue, setCountdownValue] = useState("23:59:59");
  const [activeTab, setActiveTab] = useState("amazon");

  // FOMO notification data
  const fomoNotifications = [
    { name: "Alex from New York", action: "just enhanced 24 product listings", time: "2 minutes ago" },
    { name: "Sarah from California", action: "saved 4 hours with AI enhancement", time: "5 minutes ago" },
    { name: "Michael from Texas", action: "increased sales by 27% this month", time: "12 minutes ago" }
  ];
  
  const [currentFomo, setCurrentFomo] = useState(0);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownValue(prev => {
        const [hours, minutes, seconds] = prev.split(':').map(Number);
        let newSeconds = seconds - 1;
        let newMinutes = minutes;
        let newHours = hours;
        
        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes--;
        }
        
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours--;
        }
        
        if (newHours < 0) {
          // Reset to 23:59:59 when reaching 00:00:00
          return "23:59:59";
        }
        
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // FOMO notification rotation
  useEffect(() => {
    const rotationTimer = setInterval(() => {
      setCurrentFomo(prev => (prev + 1) % fomoNotifications.length);
    }, 8000);
    
    return () => clearInterval(rotationTimer);
  }, [fomoNotifications.length]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Marketplace tab examples
  const marketplaceExamples = {
    amazon: {
      before: {
        title: "Blue Wireless Headphones",
        description: "Good headphones with Bluetooth technology",
        bullets: ["Wireless", "Comfortable", "Good sound"]
      },
      after: {
        title: "Premium Noise-Cancelling Wireless Headphones with 30-Hour Battery Life (Blue)",
        description: "Experience immersive, high-fidelity sound with our premium wireless headphones. The active noise cancellation technology blocks out ambient noise, allowing you to enjoy your music without distractions. Perfect for travel, work, or everyday use.",
        bullets: [
          "Active Noise Cancellation eliminates up to 95% of ambient noise for immersive listening",
          "Industry-leading 30-hour battery life with quick charging (10 min = 5 hours playback)",
          "Premium 40mm dynamic drivers deliver crystal clear highs and deep, punchy bass",
          "Ultra-comfortable memory foam ear cushions for extended listening sessions",
          "Voice assistant compatible with Siri, Google Assistant, and Alexa for hands-free control"
        ]
      }
    },
    ebay: {
      before: {
        title: "Vintage Camera Kit",
        description: "Old camera in good condition, comes with case",
        highlights: "Works well, minor scratches"
      },
      after: {
        title: "Rare 1970s Vintage SLR Film Camera Kit with Original Leather Case - Fully Functional",
        description: "This authentic vintage SLR camera from the 1970s is a collector's dream. The camera is in excellent working condition with all mechanical functions operating smoothly. The body shows minimal signs of use with only slight patina that adds to its vintage appeal. Original leather case included in remarkable condition.",
        highlights: "Fully functional mechanical operation | Original leather case included | All dials and levers work smoothly | Light meter accurate | Viewfinder clear and bright | Film advance mechanism works perfectly"
      }
    },
    shopify: {
      before: {
        title: "Bamboo Cutting Board",
        description: "Kitchen cutting board made of bamboo",
        details: "Eco-friendly, sturdy"
      },
      after: {
        title: "Premium Organic Bamboo Cutting Board with Juice Groove | Eco-Friendly Kitchen Essential",
        description: "Elevate your cooking experience with our sustainably harvested bamboo cutting board. Crafted from 100% organic bamboo, this beautiful and functional board features an ingenious juice groove to capture liquids and prevent countertop messes. The naturally antibacterial surface is gentle on your knives while providing a sturdy, stable cutting platform for all your food prep needs.",
        details: "Sustainably harvested organic bamboo | Built-in juice groove prevents messes | Knife-friendly surface preserves blade sharpness | Naturally antibacterial properties for food safety | Easy to clean and maintain | Measures 18″ x 12″ x 0.75″ | Reversible design for versatile use"
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky notification bar - creates urgency */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-2 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center sm:justify-between items-center text-sm font-medium">
            <div className="flex items-center">
              <span className="hidden sm:inline">🔥 Special Launch Offer:</span> 
              <span className="sm:ml-2">50% OFF Premium Plan Ends In: </span>
              <span className="ml-2 bg-white/20 px-2 py-1 rounded font-mono">{countdownValue}</span>
            </div>
            <Link href="/app" className="mt-2 sm:mt-0 bg-white text-red-600 py-1 px-4 rounded-full text-xs font-bold hover:bg-red-50 transition-colors">
              CLAIM OFFER NOW
            </Link>
          </div>
        </div>
      </div>
      
      {/* Floating FOMO notification */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-xl p-3 max-w-xs z-30 animate-fade-in-up transition-opacity duration-300 border border-gray-200">
        <div className="flex items-start">
          <div className="bg-green-100 text-green-600 rounded-full p-2 mr-3">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{fomoNotifications[currentFomo].name}</p>
            <p className="text-gray-600">{fomoNotifications[currentFomo].action}</p>
            <p className="text-gray-400 text-xs mt-1">{fomoNotifications[currentFomo].time}</p>
          </div>
        </div>
      </div>

      {/* Hero Section - Using attention-grabbing power words and visual hierarchy */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-16 pb-24 relative overflow-hidden">
        {/* Abstract shapes for visual interest */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-0 right-0 bg-white/10 w-96 h-96 rounded-full -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 bg-white/5 w-64 h-64 rounded-full -mb-10 -ml-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              {/* Pattern interrupt badge */}
              <div className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-blue-100 uppercase bg-blue-700 bg-opacity-50 rounded-full mb-6 animate-pulse">
                AI-POWERED • NEW TECHNOLOGY • LIMITED ACCESS
              </div>
              
              {/* Primary headline with clearly identified pain point and solution */}
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                <span className="block mb-2">Stop Losing Sales</span>
                <span className="relative">
                  <span className="z-10 relative">
                    Transform <span className="underline decoration-yellow-400 decoration-4 underline-offset-2">Incomplete Data</span> into <span className="underline decoration-yellow-400 decoration-4 underline-offset-2">Sales-Generating</span> Listings
                  </span>
                  <span className="absolute -bottom-2 left-0 right-0 h-3 bg-indigo-500/30 transform -skew-y-1"></span>
                </span>
              </h1>
              
              {/* Clear value proposition with specific benefits */}
              <p className="text-xl text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0">
                Our AI instantly enhances your marketplace listings with SEO-optimized titles, compelling descriptions and high-converting features in <span className="font-bold text-white">under 2 minutes</span>.
              </p>
              
              {/* Urgency-triggering CTA */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/app">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold relative shadow-lg hover:shadow-xl transition-all group">
                    Transform Your Products Now 
                    <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </Button>
                </Link>
                <div className="hidden sm:flex items-center text-white/70 text-sm">
                  <Shield className="h-4 w-4 mr-2" /> 
                  <span>No credit card required</span>
                </div>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6">
                <div className="text-white/80 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                  Trusted by 1,200+ sellers
                </div>
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

            {/* Visual transformation with concrete examples */}
            <div className="relative mx-auto lg:mx-0 max-w-md">
              {/* Tab selection for different marketplace examples */}
              <div className="bg-white/10 rounded-t-lg p-1 flex justify-center space-x-1 mb-1">
                <button 
                  className={`px-3 py-1.5 text-xs font-medium rounded ${activeTab === 'amazon' ? 'bg-white text-blue-600' : 'text-white'}`}
                  onClick={() => setActiveTab('amazon')}
                >
                  Amazon
                </button>
                <button 
                  className={`px-3 py-1.5 text-xs font-medium rounded ${activeTab === 'ebay' ? 'bg-white text-blue-600' : 'text-white'}`}
                  onClick={() => setActiveTab('ebay')}
                >
                  eBay
                </button>
                <button 
                  className={`px-3 py-1.5 text-xs font-medium rounded ${activeTab === 'shopify' ? 'bg-white text-blue-600' : 'text-white'}`}
                  onClick={() => setActiveTab('shopify')}
                >
                  Shopify
                </button>
              </div>
              
              {/* Example container with shadow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg transform rotate-1"></div>
              <div className="relative bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                <div className="flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 mb-2">BEFORE</div>
                      <div className="p-3 bg-white rounded border border-gray-200 text-left shadow-sm">
                        <div className="mb-2">
                          <span className="text-xs text-gray-500">Title:</span>
                          <div className="font-medium text-red-500 text-sm mt-1">
                            {activeTab === 'amazon' && marketplaceExamples.amazon.before.title}
                            {activeTab === 'ebay' && marketplaceExamples.ebay.before.title}
                            {activeTab === 'shopify' && marketplaceExamples.shopify.before.title}
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="text-xs text-gray-500">Description:</span>
                          <div className="text-gray-600 text-xs mt-1">
                            {activeTab === 'amazon' && marketplaceExamples.amazon.before.description}
                            {activeTab === 'ebay' && marketplaceExamples.ebay.before.description}
                            {activeTab === 'shopify' && marketplaceExamples.shopify.before.description}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Features:</span>
                          <div className="text-gray-600 text-xs mt-1">
                            {activeTab === 'amazon' && (
                              <ul className="text-xs pl-3 space-y-0.5">
                                {marketplaceExamples.amazon.before.bullets.map((bullet, i) => (
                                  <li key={i}>• {bullet}</li>
                                ))}
                              </ul>
                            )}
                            {activeTab === 'ebay' && (
                              <div className="text-xs">{marketplaceExamples.ebay.before.highlights}</div>
                            )}
                            {activeTab === 'shopify' && (
                              <div className="text-xs">{marketplaceExamples.shopify.before.details}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-center">
                        <div className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                          Low conversion rate
                        </div>
                        <div className="ml-2 text-xs text-gray-500">~1.2%</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-yellow-500 text-white rounded-full p-2 shadow-md">
                      <ChevronRight className="h-5 w-5 transform rotate-90" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 mb-2">AFTER AI ENHANCEMENT</div>
                      <div className="p-3 bg-white rounded border border-green-200 text-left shadow-sm">
                        <div className="mb-2">
                          <span className="text-xs text-gray-500">Title:</span>
                          <div className="font-medium text-gray-900 text-sm mt-1">
                            {activeTab === 'amazon' && marketplaceExamples.amazon.after.title}
                            {activeTab === 'ebay' && marketplaceExamples.ebay.after.title}
                            {activeTab === 'shopify' && marketplaceExamples.shopify.after.title}
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="text-xs text-gray-500">Description:</span>
                          <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                            {activeTab === 'amazon' && marketplaceExamples.amazon.after.description}
                            {activeTab === 'ebay' && marketplaceExamples.ebay.after.description}
                            {activeTab === 'shopify' && marketplaceExamples.shopify.after.description}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Features:</span>
                          <div className="text-gray-600 text-xs mt-1">
                            {activeTab === 'amazon' && (
                              <ul className="text-xs pl-3 space-y-0.5 max-h-16 overflow-hidden">
                                {marketplaceExamples.amazon.after.bullets.map((bullet, i) => (
                                  <li key={i}>• {bullet}</li>
                                ))}
                              </ul>
                            )}
                            {activeTab === 'ebay' && (
                              <div className="text-xs line-clamp-2">{marketplaceExamples.ebay.after.highlights}</div>
                            )}
                            {activeTab === 'shopify' && (
                              <div className="text-xs line-clamp-2">{marketplaceExamples.shopify.after.details}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-center">
                        <div className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                          Higher conversion rate
                        </div>
                        <div className="ml-2 text-xs font-medium text-green-600">~5.4%</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t border-gray-200">
                  <span className="text-green-600 font-semibold">350% increase</span> in conversion rate!
                </div>
              </div>
              
              {/* Floating stats to reinforce value */}
              <div className="absolute -bottom-6 -left-6 bg-yellow-400 rounded-lg px-4 py-2 text-gray-900 font-medium text-sm shadow-lg animate-bounce-slow">
                ⚡ Ready in 2 minutes
              </div>
              <div className="absolute -top-6 -right-6 bg-indigo-800 text-white rounded-lg px-4 py-2 font-medium text-sm shadow-lg">
                📈 45% higher CTR
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instant validation section - Logos of companies */}
      <section className="py-10 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
            TRUSTED BY SELLERS ON ALL MAJOR MARKETPLACES
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16 opacity-70">
            <div className="h-8 flex items-center">
              <span className="text-2xl font-bold text-gray-400">amazon</span>
            </div>
            <div className="h-8 flex items-center">
              <span className="text-2xl font-bold text-gray-400">eBay</span>
            </div>
            <div className="h-8 flex items-center">
              <span className="text-2xl font-bold text-gray-400">Shopify</span>
            </div>
            <div className="h-8 flex items-center">
              <span className="text-2xl font-bold text-gray-400">walmart</span>
            </div>
            <div className="h-8 flex items-center">
              <span className="text-2xl font-bold text-gray-400">Etsy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points section - Leveraging loss aversion */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">WARNING</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-4">You're Losing Money Right Now If...</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Your product listings are suffering from these common issues that drive customers away:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-red-500 relative group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-semibold transform translate-x-2 -translate-y-2">
                FIXABLE
              </div>
              <div className="text-red-500 mb-4">
                <Clock className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Time is Being Wasted</h3>
              <p className="text-gray-600">
                <span className="font-semibold text-red-600">The Average Seller Wastes 15+ Hours Per Week</span> manually writing and optimizing product listings, time that could be spent on growing your business.
              </p>
              <div className="mt-4 text-sm text-gray-500 italic">
                "I used to spend entire weekends just writing product descriptions..."
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-red-500 relative group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-semibold transform translate-x-2 -translate-y-2">
                FIXABLE
              </div>
              <div className="text-red-500 mb-4">
                <TrendingUp className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sales Are Being Lost</h3>
              <p className="text-gray-600">
                <span className="font-semibold text-red-600">Generic Product Descriptions Lose 67% of Potential Customers</span> who need more information to make purchasing decisions. 
              </p>
              <div className="mt-4 text-sm text-gray-500 italic">
                "I never realized how many sales I was missing until I optimized my listings..."
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-red-500 relative group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-semibold transform translate-x-2 -translate-y-2">
                FIXABLE
              </div>
              <div className="text-red-500 mb-4">
                <Layers className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Platform Frustration</h3>
              <p className="text-gray-600">
                <span className="font-semibold text-red-600">Adapting Listings for Each Marketplace Takes 4X Longer</span> and creates inconsistency, formatting errors, and missed requirements.
              </p>
              <div className="mt-4 text-sm text-gray-500 italic">
                "Managing listings across multiple platforms was a nightmare before..."
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/app">
              <Button size="lg" className="mx-auto bg-red-600 hover:bg-red-700 text-base">
                Fix These Problems Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof section - Building trust with scarcity */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-4 py-2 rounded-full mb-3">
              ONLY 97 SPOTS REMAINING AT CURRENT PRICING
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join 1,200+ Successful Sellers</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how e-commerce businesses like yours are saving time and boosting sales with our AI-powered enhancement tool:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md relative group hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
              <div className="absolute -top-4 -right-4 text-6xl text-indigo-200 opacity-50">"</div>
              <div className="text-gray-600 mb-6 relative z-10">
                "This tool increased our product listing efficiency by 300%. Our team now focuses on strategy instead of data entry. The ROI was immediate and substantial."
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                  SJ
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Sarah J.</div>
                  <div className="text-sm text-gray-600">E-commerce Manager, HomeGoods Direct</div>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md relative group hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
              <div className="absolute -top-4 -right-4 text-6xl text-indigo-200 opacity-50">"</div>
              <div className="text-gray-600 mb-6 relative z-10">
                "We saw a 45% increase in click-through rates after optimizing our listings with this platform. The ROI is incredible - I wish we'd found this sooner!"
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                  MT
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Michael T.</div>
                  <div className="text-sm text-gray-600">Marketplace Seller, TechAccessories Pro</div>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md relative group hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
              <div className="absolute -top-4 -right-4 text-6xl text-indigo-200 opacity-50">"</div>
              <div className="text-gray-600 mb-6 relative z-10">
                "The AI enhancement saved us countless hours of copywriting and improved our product descriptions dramatically. Our conversion rate jumped by 28% in the first month."
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                  JW
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Jessica W.</div>
                  <div className="text-sm text-gray-600">Digital Marketing Lead, Fashion Forward</div>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-xl p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-indigo-500 rounded-full opacity-50"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-indigo-500 rounded-full opacity-30"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center relative z-10">
              <div className="col-span-1 md:col-span-1 text-center md:text-left">
                <h3 className="text-xl font-semibold text-white mb-2">Proven Results</h3>
                <p className="text-indigo-100">Average improvements our customers see:</p>
              </div>
              
              <div className="col-span-1 text-center">
                <div className="text-4xl font-bold text-white mb-2">45%</div>
                <p className="text-indigo-100 text-sm">Higher click-through rates</p>
              </div>
              
              <div className="col-span-1 text-center">
                <div className="text-4xl font-bold text-white mb-2">3.5x</div>
                <p className="text-indigo-100 text-sm">Faster listing creation</p>
              </div>
              
              <div className="col-span-1 text-center">
                <div className="text-4xl font-bold text-white mb-2">28%</div>
                <p className="text-indigo-100 text-sm">Increase in conversion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution section with pricing information - Creating clear value perception */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full mb-4">THE SOLUTION</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Effortless Product Enhancement</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transform incomplete product data into optimized listings in <span className="font-bold">just 2 minutes</span> without copywriting skills or technical knowledge.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className="flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 font-bold text-xs uppercase rounded-full px-3 py-1">
                    Limited Time Offer
                  </span>
                  <div className="ml-3 pl-3 border-l border-gray-300">
                    <div className="text-sm">
                      <span className="text-gray-500 line-through">$99/mo</span>
                      <span className="ml-2 text-green-600 font-semibold">$49/mo</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Premium Plan</h3>
                <p className="text-gray-600 mb-6">Everything you need to optimize your product listings</p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited product enhancements",
                    "AI-generated titles, descriptions & bullet points",
                    "Multi-marketplace format support",
                    "Bulk CSV import and export",
                    "API access for seamless integration",
                    "24/7 priority customer support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">50% discount ends soon</span>
                  </div>
                </div>
                
                <Link href="/app">
                  <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-base mb-4">
                    Get 50% OFF - Try Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-center text-sm text-gray-500">
                  No credit card required for 7-day free trial • Cancel anytime
                </p>
              </div>
              
              <div className="bg-gray-900 p-8 lg:p-12 text-white">
                <h3 className="text-xl font-bold mb-6">Why customers choose us</h3>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-4">
                      <Clock className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Save 12+ hours per week</h4>
                      <p className="text-gray-300 mt-1">
                        No more spending weekends writing product descriptions. Our AI handles it in minutes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-4">
                      <TrendingUp className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Increase sales by 28-45%</h4>
                      <p className="text-gray-300 mt-1">
                        Optimized listings with proper keywords and persuasive language drive more conversions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-4">
                      <Shield className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Risk-free 7-day trial</h4>
                      <p className="text-gray-300 mt-1">
                        Try all premium features for free. No credit card required. Cancel anytime.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <div className="flex items-center">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" 
                        alt="Customer" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400"
                      />
                      <div className="ml-4">
                        <p className="text-sm text-gray-300 italic">
                          "This tool paid for itself in the first month. My product listings now outperform my competitors consistently."
                        </p>
                        <p className="text-sm font-medium text-indigo-300 mt-1">
                          - Rachel K., Shopify Store Owner
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA with scarcity and FOMO */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-white rounded-full -mb-40 -mr-40"></div>
          <div className="absolute left-0 top-0 w-80 h-80 bg-white rounded-full -mt-40 -ml-40"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-6 animate-pulse">
            Special Launch Offer - 50% OFF Expires In: {countdownValue}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Don't Let Your Competitors Outsell You</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join the 1,200+ sellers who are already using our AI to create high-converting product listings in minutes instead of hours.
          </p>
          
          <div className="bg-white/10 rounded-lg p-6 mb-10 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-indigo-300 border-2 border-white"></div>
                ))}
                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-xs">
                  +42
                </div>
              </div>
              <div className="ml-3 text-sm text-white/80">
                <strong>47 new sellers</strong> started free trials in the last 24 hours
              </div>
            </div>
            
            <Link href="/app">
              <Button size="lg" className="w-full sm:w-auto text-xl px-12 py-7 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold mx-auto shadow-lg hover:shadow-xl transition-all">
                Start Your Free Trial Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <p className="mt-4 text-sm text-indigo-200">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-indigo-300 mr-2" />
              <span className="text-sm">100% Secure Checkout</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-indigo-300 mr-2" />
              <span className="text-sm">Instant Access</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-indigo-300 mr-2" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Video modal */}
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