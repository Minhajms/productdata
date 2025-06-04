# ProductDataPro

ProductDataPro is a smart e-commerce product data enhancement platform powered by AI. It intelligently optimizes product listings across multiple marketplaces to improve visibility and conversions. The platform is fully developed using Replit with a "Yes Vibe" coding approach and is currently live
## 🚀 Features

- **Intelligent CSV Processing**
  - Smart column detection and mapping
  - Handles unstructured CSV files
  - Automatic product ID generation

- **AI-Powered Enhancement**
  - Automated product title optimization
  - Smart description generation
  - Bullet point enhancement
  - SEO optimization

- **Multi-Marketplace Support**
  - Amazon
  - eBay
  - Shopify
  - Custom marketplace templates

- **Advanced Analytics**
  - Listing quality scoring
  - Conversion rate optimization
  - Competitive analysis
  - Performance tracking

## 🛠️ Tech Stack

- **Frontend**
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn UI Components

- **Backend**
  - Node.js
  - Express
  - TypeScript
  - SQLite (Drizzle ORM)

- **AI Integration**
  - OpenRouter API
  - OpenAI GPT Models
  - Custom prompt engineering

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Minhajms/ProductDataPro.git
   cd ProductDataPro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📝 Usage

1. Upload your product CSV file
2. Select target marketplace
3. Choose enhancement options
4. Review and export enhanced data

## 🔧 Configuration

- Customize marketplace templates in `config/marketplace-templates.ts`
- Adjust AI prompts in `config/prompts.ts`
- Modify database schema in `db/schema.ts`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - MINHAJ S

## 🙏 Acknowledgments

- OpenRouter for AI capabilities
- Drizzle ORM for database management
- Shadcn UI for beautiful components
