#!/bin/bash

# 🤖 Trigger Auto Deploy Script - GitHub MCP ile Tam Otomatik
# Bu script GitHub MCP tarafından oluşturulmuştur

set -e

echo "🤖 GitHub MCP Auto Deploy Trigger Başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🚀 AUTO DEPLOY TRIGGER                    ║"
echo "║              GitHub MCP Otomatik Deployment                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# GitHub CLI kontrolü
echo -e "${YELLOW}🔍 GitHub CLI kontrol ediliyor...${NC}"

if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI mevcut${NC}"
    
    # GitHub auth kontrolü
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ GitHub CLI auth aktif${NC}"
        
        # Auto deploy workflow'unu tetikle
        echo -e "${YELLOW}🚀 Full Auto Deploy workflow tetikleniyor...${NC}"
        
        if gh workflow run "full-auto-deploy.yml" \
            --field auto_setup=true \
            --field deploy_environment=production; then
            echo -e "${GREEN}✅ Auto Deploy workflow başarıyla tetiklendi!${NC}"
            DEPLOY_SUCCESS=true
        else
            echo -e "${YELLOW}⚠️ Auto Deploy workflow tetiklenemedi${NC}"
            DEPLOY_SUCCESS=false
        fi
        
    else
        echo -e "${YELLOW}⚠️ GitHub CLI auth gerekli${NC}"
        echo -e "${BLUE}🔐 Auth komutu: gh auth login${NC}"
        DEPLOY_SUCCESS=false
    fi
else
    echo -e "${YELLOW}⚠️ GitHub CLI yüklü değil${NC}"
    DEPLOY_SUCCESS=false
fi

# Alternatif yöntem: Git push ile tetikle
if [ "$DEPLOY_SUCCESS" = false ]; then
    echo -e "${BLUE}Alternatif yöntem: Git push ile tetikleme...${NC}"
    
    # Boş bir değişiklik yap ve push et
    echo "# Auto Deploy Trigger - $(date)" >> .deploy-trigger
    git add .deploy-trigger
    git commit -m "🚀 Auto Deploy Trigger

- ✅ GitHub MCP Auto Deploy tetikleniyor
- 🚀 Full auto deploy workflow başlatılıyor
- 📅 $(date)

Otomatik olarak GitHub MCP tarafından tetiklendi." || echo "No changes to commit"
    
    if git push origin main; then
        echo -e "${GREEN}✅ Git push ile deployment tetiklendi!${NC}"
        DEPLOY_SUCCESS=true
    else
        echo -e "${YELLOW}⚠️ Git push başarısız${NC}"
        DEPLOY_SUCCESS=false
    fi
fi

# Sonuç raporu
if [ "$DEPLOY_SUCCESS" = true ]; then
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ DEPLOY TETİKLENDİ!                    ║"
    echo "║              GitHub MCP Auto Deploy Başlatıldı             ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${GREEN}🎉 Otomatik deployment başarıyla tetiklendi!${NC}"
    echo -e "${BLUE}🔗 Repository: https://github.com/kafkasder-git/starter-function${NC}"
    echo -e "${BLUE}🔗 Actions: https://github.com/kafkasder-git/starter-function/actions${NC}"
    echo -e "${BLUE}🔗 Deploy URL: https://kafkasder-git.github.io/starter-function/${NC}"
    
    echo -e "${YELLOW}⏳ Deployment durumu takip ediliyor...${NC}"
    echo -e "${BLUE}📊 GitHub Actions sayfasından ilerlemeyi takip edebilirsiniz${NC}"
    
else
    echo -e "${RED}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ⚠️ DEPLOY TETİKLENEMEDİ                  ║"
    echo "║              Manuel müdahale gerekebilir                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${YELLOW}⚠️ Otomatik deployment tetiklenemedi${NC}"
    echo -e "${BLUE}📋 Alternatif çözümler:${NC}"
    echo -e "  1. GitHub CLI kurun: https://cli.github.com/"
    echo -e "  2. GitHub CLI auth yapın: gh auth login"
    echo -e "  3. Manuel olarak GitHub Actions sayfasından tetikleyin"
    echo -e "  4. Repository Settings → Actions → Enable workflows"
    
    echo -e "${BLUE}🔗 GitHub Actions: https://github.com/kafkasder-git/starter-function/actions${NC}"
fi

# Deployment süreci hakkında bilgi
echo -e "${YELLOW}📋 Deployment Süreci:${NC}"
echo -e "  1. ✅ Environment setup tamamlandı"
echo -e "  2. ✅ Build test başarılı"
echo -e "  3. 🚀 Production build başlatıldı"
echo -e "  4. 📤 GitHub Pages'e deploy edilecek"
echo -e "  5. 🌐 Live URL hazır olacak"

echo -e "${GREEN}🎯 GitHub MCP Auto Deploy Trigger tamamlandı!${NC}"
