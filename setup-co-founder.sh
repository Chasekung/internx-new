#!/bin/bash

echo "🚀 Setting up InternX development environment for co-founder..."

# Clone the repository
echo "📥 Cloning repository..."
git clone https://github.com/Chasekung/internx-new.git
cd internx-new

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create develop branch
echo "🌿 Setting up develop branch..."
git checkout -b develop
git pull origin develop

# Create feature branch
echo "🔧 Creating feature branch..."
read -p "Enter your feature name (e.g., 'user-dashboard'): " feature_name
git checkout -b "feature/$feature_name"

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make your changes to the code"
echo "2. Test locally: npm run dev"
echo "3. Commit your changes:"
echo "   git add ."
echo "   git commit -m 'feat: Add your feature description'"
echo "4. Push your branch: git push origin feature/$feature_name"
echo "5. Create Pull Request to 'develop' branch on GitHub"
echo ""
echo "🔗 Repository: https://github.com/Chasekung/internx-new"
echo "📖 Read COLLABORATION_WORKFLOW.md for detailed instructions"
echo ""
echo "Happy coding! 🎉" 