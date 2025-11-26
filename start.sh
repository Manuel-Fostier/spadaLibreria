#!/bin/bash

# Script de démarrage pour Ars Dimicatoria

echo "🎭 Ars Dimicatoria - Setup"
echo "=========================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé."
    echo "📦 Installation de Node.js via nvm..."
    
    # Installer nvm si nécessaire
    if [ ! -d "$HOME/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Installer Node.js LTS
    nvm install --lts
    nvm use --lts
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
else
    echo "✅ Dépendances déjà installées"
fi

echo ""
echo "🚀 Démarrage du serveur de développement..."
echo "🌐 L'application sera disponible sur http://localhost:3000"
echo ""

npm run dev
