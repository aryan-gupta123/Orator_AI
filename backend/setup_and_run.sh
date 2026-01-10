#!/bin/bash

echo "🚀 Setting up Negotiation AI Backend..."

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env if doesn't exist
if [ ! -f .env ]; then
    cp .env.template .env
    echo "⚠️  Created .env file - PLEASE ADD YOUR API KEYS!"
    exit 1
fi

# Create directory structure
mkdir -p services
mkdir -p models
mkdir -p prompts

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your API keys to .env"
echo "2. Start server: python main.py"
echo ""
echo "🔥 Starting server..."
python main.py