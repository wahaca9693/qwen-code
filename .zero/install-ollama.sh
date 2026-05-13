#!/bin/bash

# ZERO Agent - Auto Install for Coding
# Best lightweight coding models - prioritized by power

echo "🤖 ZERO Agent - Coding Setup..."

# Install Ollama if needed
if ! command -v ollama &> /dev/null; then
    echo "📥 Installing Ollama..."
    curl -fsSL https://ollama.com/install | sh
    export PATH="$PATH:$HOME/.ollama/bin"
fi

# Start Ollama
echo "▶️ Starting Ollama..."
ollama serve &
sleep 3

# CODING MODELS - Best to Worst for code:
CODING_MODELS=(
    "deepseek-coder:6.7b"      # 51% HumanEval - KING! ~4GB
    "phi:3.5b"                # 44% HumanEval - Microsoft ~2GB  
    "qwen2.5-coder:3b"         # Alibaba coding ~2GB
    "codellama:7b"              # Meta coding ~4GB
    "llama3.2:1b"             # Fastest backup ~1GB
)

for model in "${CODING_MODELS[@]}"; do
    echo "📥 Pulling: $model..."
    if ollama pull "$model" 2>&1 | grep -q "success"; then
        echo "✅ Loaded: $model"
        break
    fi
done

echo ""
echo "🎉 Ready for coding!"
echo "💬 Say: 'Write a React button component'"