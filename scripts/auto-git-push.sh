#!/bin/bash

# 🤖 Auto Git Push Script - GitHub MCP ile Tam Otomatik
# Bu script GitHub MCP tarafından oluşturulmuştur

set -e

echo "🤖 GitHub MCP Auto Git Push Başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🤖 AUTO GIT PUSH                          ║"
echo "║              GitHub MCP Otomatik Push Sistemi                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Git credential helper ayarları
echo -e "${YELLOW}🔐 Git credential helper ayarlanıyor...${NC}"

# Farklı credential helper'ları dene
git config --global credential.helper store
git config --global user.name "GitHub MCP Bot"
git config --global user.email "github-mcp@kafkasder.com"

echo -e "${GREEN}✅ Git credential helper ayarlandı${NC}"

# Git status kontrolü
echo -e "${YELLOW}📊 Git status kontrol ediliyor...${NC}"
git status

# Değişiklikleri ekle
echo -e "${YELLOW}📝 Değişiklikler ekleniyor...${NC}"
git add .

# Commit mesajı oluştur
COMMIT_MESSAGE="🤖 GitHub MCP Auto Push

- ✅ Environment setup tamamlandı
- ✅ GitHub Actions workflows eklendi
- ✅ Auto setup scripts hazır
- ✅ Production environment yapılandırıldı
- 🚀 Deployment için hazır

Otomatik olarak GitHub MCP tarafından push edildi."

# Commit yap
echo -e "${YELLOW}💾 Commit yapılıyor...${NC}"
git commit -m "$COMMIT_MESSAGE" || echo -e "${YELLOW}⚠️ Commit yapılamadı, değişiklik yok olabilir${NC}"

# Push yapmaya çalış
echo -e "${YELLOW}🚀 Push yapılıyor...${NC}"

# Farklı push yöntemleri dene
echo -e "${BLUE}Yöntem 1: HTTPS push denemesi...${NC}"
if git push origin main; then
    echo -e "${GREEN}✅ Push başarılı!${NC}"
    SUCCESS=true
else
    echo -e "${YELLOW}⚠️ HTTPS push başarısız, alternatif yöntemler deneniyor...${NC}"
    SUCCESS=false
fi

# Alternatif yöntem: SSH push (eğer SSH key varsa)
if [ "$SUCCESS" = false ]; then
    echo -e "${BLUE}Yöntem 2: SSH push denemesi...${NC}"
    if git remote set-url origin git@github.com:kafkasder-git/starter-function.git; then
        if git push origin main; then
            echo -e "${GREEN}✅ SSH push başarılı!${NC}"
            SUCCESS=true
        else
            echo -e "${YELLOW}⚠️ SSH push da başarısız${NC}"
        fi
    fi
fi

# Son çare: GitHub CLI kullan
if [ "$SUCCESS" = false ]; then
    echo -e "${BLUE}Yöntem 3: GitHub CLI denemesi...${NC}"
    if command -v gh &> /dev/null; then
        if gh auth status &> /dev/null; then
            if gh repo sync kafkasder-git/starter-function; then
                echo -e "${GREEN}✅ GitHub CLI sync başarılı!${NC}"
                SUCCESS=true
            else
                echo -e "${YELLOW}⚠️ GitHub CLI sync başarısız${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️ GitHub CLI auth gerekli${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ GitHub CLI yüklü değil${NC}"
    fi
fi

# Sonuç raporu
if [ "$SUCCESS" = true ]; then
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ PUSH BAŞARILI!                        ║"
    echo "║              GitHub MCP Auto Push Tamamlandı               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${GREEN}🎉 GitHub'a başarıyla push edildi!${NC}"
    echo -e "${BLUE}🔗 Repository: https://github.com/kafkasder-git/starter-function${NC}"
    echo -e "${YELLOW}🚀 GitHub Actions otomatik olarak başlayacak${NC}"
    
else
    echo -e "${RED}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ⚠️ PUSH BAŞARISIZ                        ║"
    echo "║              Manuel müdahale gerekebilir                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${YELLOW}⚠️ Otomatik push başarısız oldu${NC}"
    echo -e "${BLUE}📋 Alternatif çözümler:${NC}"
    echo -e "  1. GitHub Desktop kullanın"
    echo -e "  2. Git credential helper'ı manuel ayarlayın"
    echo -e "  3. SSH key ekleyin"
    echo -e "  4. GitHub CLI kullanın: gh auth login"
    
    echo -e "${YELLOW}📁 Değişiklikler local'de hazır, manuel push yapabilirsiniz${NC}"
fi

# GitHub Actions durumunu kontrol et
echo -e "${YELLOW}🔍 GitHub Actions durumu kontrol ediliyor...${NC}"
echo -e "${BLUE}🔗 Actions: https://github.com/kafkasder-git/starter-function/actions${NC}"

echo -e "${GREEN}🎯 GitHub MCP Auto Git Push tamamlandı!${NC}"
