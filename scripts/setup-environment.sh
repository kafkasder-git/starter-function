#!/bin/bash

# 🔧 Environment Setup Script - GitHub MCP ile Otomatik Setup
# Bu script GitHub MCP tarafından oluşturulmuştur

set -e

echo "🚀 GitHub MCP Environment Setup Başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🤖 GITHUB MCP SETUP                       ║"
echo "║              Dernek Yönetim Sistemi Environment              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Environment dosyalarını kontrol et
echo -e "${YELLOW}📋 1. Environment dosyalarını kontrol ediliyor...${NC}"

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example dosyası mevcut${NC}"
else
    echo -e "${RED}❌ .env.example dosyası bulunamadı${NC}"
    exit 1
fi

# 2. .env dosyasını oluştur
echo -e "${YELLOW}📝 2. .env dosyası oluşturuluyor...${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env dosyası oluşturuldu${NC}"
else
    echo -e "${YELLOW}⚠️ .env dosyası zaten mevcut${NC}"
fi

# 3. Production environment dosyasını oluştur
echo -e "${YELLOW}🏭 3. Production environment dosyası oluşturuluyor...${NC}"

if [ ! -f ".env.production" ]; then
    sed 's/NODE_ENV=development/NODE_ENV=production/g; s/VITE_NODE_ENV=development/VITE_NODE_ENV=production/g' .env.example > .env.production
    echo -e "${GREEN}✅ .env.production dosyası oluşturuldu${NC}"
else
    echo -e "${YELLOW}⚠️ .env.production dosyası zaten mevcut${NC}"
fi

# 4. Dependencies kontrolü
echo -e "${YELLOW}📦 4. Dependencies kontrol ediliyor...${NC}"

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json dosyası mevcut${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Dependencies yükleniyor...${NC}"
        npm install
        echo -e "${GREEN}✅ Dependencies yüklendi${NC}"
    else
        echo -e "${GREEN}✅ Dependencies zaten yüklü${NC}"
    fi
else
    echo -e "${RED}❌ package.json dosyası bulunamadı${NC}"
    exit 1
fi

# 5. GitHub Actions workflow kontrolü
echo -e "${YELLOW}🔧 5. GitHub Actions workflow kontrol ediliyor...${NC}"

if [ -d ".github/workflows" ]; then
    echo -e "${GREEN}✅ GitHub Actions workflows klasörü mevcut${NC}"
    
    workflow_count=$(find .github/workflows -name "*.yml" -o -name "*.yaml" | wc -l)
    echo -e "${BLUE}📊 Toplam $workflow_count workflow dosyası bulundu${NC}"
    
    # Workflow dosyalarını listele
    for workflow in .github/workflows/*.yml .github/workflows/*.yaml; do
        if [ -f "$workflow" ]; then
            echo -e "${GREEN}  ✅ $(basename "$workflow")${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️ GitHub Actions workflows klasörü bulunamadı${NC}"
fi

# 6. Appwrite configuration kontrolü
echo -e "${YELLOW}🔧 6. Appwrite configuration kontrol ediliyor...${NC}"

if [ -f "appwrite.config.json" ]; then
    echo -e "${GREEN}✅ appwrite.config.json dosyası mevcut${NC}"
else
    echo -e "${YELLOW}⚠️ appwrite.config.json dosyası bulunamadı${NC}"
fi

# 7. Environment variables özeti
echo -e "${YELLOW}📋 7. Environment variables özeti:${NC}"
echo -e "${BLUE}Gerekli Environment Variables:${NC}"
echo -e "  • VITE_APPWRITE_ENDPOINT"
echo -e "  • VITE_APPWRITE_PROJECT_ID"
echo -e "  • VITE_APPWRITE_PROJECT_NAME"
echo -e "  • VITE_APPWRITE_DATABASE_ID"
echo -e "  • APPWRITE_API_KEY"

# 8. Sonraki adımlar
echo -e "${YELLOW}🎯 8. Sonraki adımlar:${NC}"
echo -e "${BLUE}GitHub Secrets ayarlama:${NC}"
echo -e "  1. GitHub repository Settings → Secrets and variables → Actions"
echo -e "  2. New repository secret ile yukarıdaki değişkenleri ekleyin"
echo -e "  3. APPWRITE_API_KEY değerini gerçek API key ile güncelleyin"
echo ""
echo -e "${BLUE}Deployment başlatma:${NC}"
echo -e "  1. git add ."
echo -e "  2. git commit -m '🔧 Environment setup tamamlandı'"
echo -e "  3. git push origin main"
echo ""

# 9. Başarı mesajı
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ SETUP TAMAMLANDI!                      ║"
echo "║              GitHub MCP Environment Setup Başarılı           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}🎉 GitHub MCP Environment Setup başarıyla tamamlandı!${NC}"
echo -e "${YELLOW}📝 GitHub Secrets'ları ayarlamayı unutmayın!${NC}"
echo -e "${BLUE}🚀 Deployment için hazır!${NC}"
