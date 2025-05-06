import { db } from "./index";
import * as schema from "@shared/schema";

async function seed() {
  try {
    console.log("Starting database seed");

    // Check if there are already products in the database
    const existingProducts = await db.select().from(schema.products);
    
    if (existingProducts.length > 0) {
      console.log(`Database already has ${existingProducts.length} products. Skipping seed.`);
      return;
    }

    // Sample product data
    const sampleProducts = [
      {
        product_id: "BT-5501",
        title: "Premium Bluetooth Headphones with Active Noise Cancellation",
        description: "Experience premium audio quality with our flagship Bluetooth headphones. Designed for music enthusiasts and professionals alike, these headphones feature state-of-the-art Active Noise Cancellation technology that effectively blocks out ambient noise, allowing you to focus on your music or calls without distractions. The high-fidelity audio reproduction delivers rich, detailed sound across all frequencies.",
        price: 12999, // stored in cents
        brand: "TechAudio",
        category: "Electronics",
        bullet_points: [
          "Active Noise Cancellation technology blocks out external sounds for immersive listening experience",
          "Premium sound quality with deep bass and crystal clear highs for audiophile-grade performance",
          "Up to 30 hours of battery life on a single charge with quick charging capabilities",
          "Comfortable over-ear design with memory foam ear cushions for extended listening sessions",
          "Bluetooth 5.0 connectivity ensures stable, lag-free wireless audio streaming"
        ],
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1200",
          "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1200"
        ],
        asin: "B07XHTJ79J",
        status: "enhanced",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: "BT-5502",
        title: "Wireless Charging Station for iPhone and Apple Watch",
        description: "Simplify your charging routine with our sleek 3-in-1 wireless charging station. Designed specifically for Apple ecosystem users, this charging dock simultaneously powers your iPhone, Apple Watch, and AirPods with wireless charging capability. The thoughtful design keeps your devices organized and accessible while eliminating cable clutter from your nightstand or desk.",
        price: 4999, // stored in cents
        brand: "PowerTech",
        category: "Electronics",
        bullet_points: [
          "3-in-1 design charges iPhone, Apple Watch, and AirPods simultaneously",
          "Fast charging technology with up to 15W wireless power delivery",
          "Adjustable viewing angle perfect for FaceTime calls or watching videos while charging",
          "Premium aluminum construction with non-slip base keeps devices secure",
          "Compatible with iPhone 12 and newer models with MagSafe compatibility"
        ],
        images: [
          "https://images.unsplash.com/photo-1607434472257-d9f8e57a643d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1200"
        ],
        asin: "B08KPYKH3Z",
        status: "enhanced",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: "BT-5503",
        title: "Ultra HD 4K Smart TV with Built-in Streaming Apps",
        description: "Transform your home entertainment experience with our Ultra HD 4K Smart TV. This cutting-edge television delivers stunning visual clarity with over 8 million pixels for incredible detail and vibrant colors. The built-in streaming platform gives you instant access to thousands of apps including Netflix, Disney+, Prime Video, and more without requiring any additional devices.",
        price: 79999, // stored in cents
        category: "Electronics",
        bullet_points: [
          "Stunning 4K Ultra HD resolution brings content to life with incredible detail and realism",
          "Smart platform with thousands of streaming apps built in for endless entertainment options",
          "Advanced HDR technology enhances color, contrast, and brightness for a cinematic experience",
          "Voice control compatibility works with Alexa and Google Assistant for hands-free operation",
          "Multiple HDMI and USB ports for connecting all your gaming and entertainment devices"
        ],
        images: [
          "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1200"
        ],
        status: "needs_review",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: "HK-8901",
        title: "Professional Chef's Knife Set with Storage Block",
        description: "Elevate your culinary skills with our professional-grade chef's knife set. Crafted from high-carbon stainless steel, each knife features exceptional sharpness, edge retention, and corrosion resistance. The ergonomic handles ensure comfortable use even during long food preparation sessions. The beautiful wooden storage block keeps your knives organized, accessible, and safely stored when not in use.",
        price: 14999, // stored in cents
        brand: "CulinaryPro",
        category: "Home & Kitchen",
        bullet_points: [
          "High-carbon stainless steel blades offer superior sharpness and edge retention",
          "Full tang construction provides perfect balance and durability for precision cutting",
          "Ergonomic handles designed for comfort and secure grip during extended use",
          "Includes 8-inch chef's knife, 7-inch santoku, 8-inch bread knife, 5-inch utility knife, and 3.5-inch paring knife",
          "Handcrafted wooden storage block with built-in knife sharpener keeps knives organized and ready to use"
        ],
        images: [
          "https://images.unsplash.com/photo-1593618598340-1eaee6f7c0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1200",
          "https://images.unsplash.com/photo-1566454825481-9c31bd88af5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1200"
        ],
        asin: "B07H9MZF85",
        status: "enhanced",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: "BT-5505",
        title: "Smart Home Security Camera with Motion Detection",
        description: "Keep your home safe with our advanced smart security camera system. This versatile camera offers crystal clear 1080p HD video, night vision capabilities, and sophisticated motion detection with customizable activity zones. Receive instant alerts on your smartphone when movement is detected and easily communicate through the two-way audio system.",
        price: 6999, // stored in cents
        category: "Electronics",
        bullet_points: [
          "1080p HD video with 130° wide-angle lens provides comprehensive coverage of your space",
          "Advanced motion detection with customizable activity zones minimizes false alerts",
          "Night vision capability ensures clear video even in complete darkness up to 30 feet",
          "Two-way audio allows you to communicate through the camera from your smartphone",
          "Works with Alexa, Google Assistant, and other smart home systems for seamless integration"
        ],
        images: [],
        status: "error",
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert products
    for (const product of sampleProducts) {
      await db.insert(schema.products).values(product);
    }

    console.log(`Successfully seeded ${sampleProducts.length} sample products`);

    // Create sample export history
    const exportHistoryItems = [
      {
        marketplace: "Amazon",
        format: "amazon_seller",
        product_count: 3,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        marketplace: "eBay",
        format: "ebay_format",
        product_count: 2,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    for (const item of exportHistoryItems) {
      await db.insert(schema.exportHistory).values(item);
    }

    console.log(`Successfully seeded ${exportHistoryItems.length} export history records`);

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
