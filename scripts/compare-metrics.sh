#!/bin/bash

echo "📊 Metrik Karşılaştırma"
echo "====================="
echo ""

# Dosya sayısı
echo "📁 Dosya Sayısı:"
find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*" | wc -l
echo ""

# Satır sayısı
echo "📝 Toplam Satır Sayısı:"
find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*" -exec wc -l {} + | tail -1
echo ""

# Component sayısı
echo "🧩 Component Sayısı:"
find components -type f -name "*.tsx" 2>/dev/null | wc -l
echo ""

# Service sayısı
echo "⚙️  Service Sayısı:"
find services -type f -name "*.ts" ! -name "*.test.ts" 2>/dev/null | wc -l
echo ""

# Hook sayısı
echo "🪝 Hook Sayısı:"
find hooks -type f -name "*.ts" ! -name "*.test.ts" 2>/dev/null | wc -l
echo ""

# Type dosyası sayısı
echo "📋 Type Dosyası Sayısı:"
find types -type f -name "*.ts" ! -name "*.test.ts" 2>/dev/null | wc -l
echo ""

# Bundle size (eğer build edilmişse)
if [ -d "dist" ]; then
  echo "📦 Bundle Size:"
  du -sh dist/
  echo ""
  echo "📦 Chunk Detayları:"
  if [ -d "dist/assets" ]; then
    du -sh dist/assets/* 2>/dev/null | sort -h
  fi
  echo ""
fi

# Test coverage (eğer varsa)
if [ -f "coverage/coverage-summary.json" ]; then
  echo "🧪 Test Coverage:"
  cat coverage/coverage-summary.json | grep -A 4 '"total"'
  echo ""
fi

echo "====================="
echo "✅ Metrik analizi tamamlandı"
echo ""
echo "💡 Kullanım:"
echo "  # Temizlik öncesi"
echo "  npm run compare-metrics > metrics-before.txt"
echo ""
echo "  # Temizlik sonrası"
echo "  npm run compare-metrics > metrics-after.txt"
echo ""
echo "  # Karşılaştır"
echo "  diff metrics-before.txt metrics-after.txt"

