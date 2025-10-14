/**
 * @fileoverview Console Log Cleanup Script - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ConsoleLogStats {
  totalFiles: number;
  totalLogs: number;
  processedFiles: number;
  removedLogs: number;
  skippedFiles: string[];
}

/**
 * Console log temizleme script'i
 * Production build'de console.log'ları kaldırır veya conditional yapar
 */
class ConsoleLogCleaner {
  private stats: ConsoleLogStats = {
    totalFiles: 0,
    totalLogs: 0,
    processedFiles: 0,
    removedLogs: 0,
    skippedFiles: []
  };

  /**
   * TypeScript/JavaScript dosyalarında console.log'ları bulur
   */
  private findConsoleLogs(content: string): { logs: string[]; positions: number[] } {
    const logs: string[] = [];
    const positions: number[] = [];
    
    // console.log, console.warn, console.error, console.info pattern'leri
    const patterns = [
      /console\.(log|warn|error|info|debug)\s*\(/g,
      /console\.(log|warn|error|info|debug)\s*\([^)]*\)\s*;?/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        logs.push(match[0]);
        positions.push(match.index);
      }
    });

    return { logs, positions };
  }

  /**
   * Console.log'ları conditional yapar veya kaldırır
   */
  private processConsoleLog(content: string, mode: 'conditional' | 'remove'): string {
    const { logs, positions } = this.findConsoleLogs(content);
    
    if (logs.length === 0) return content;

    let processedContent = content;
    let offset = 0;

    // En sondan başlayarak değiştir (position'ları bozmamak için)
    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      const position = positions[i] + offset;
      
      if (mode === 'conditional') {
        // Development check ekle
        const conditionalLog = `if (process.env.NODE_ENV === 'development') ${log}`;
        processedContent = 
          processedContent.slice(0, position) + 
          conditionalLog + 
          processedContent.slice(position + log.length);
        offset += conditionalLog.length - log.length;
      } else {
        // Tamamen kaldır
        processedContent = 
          processedContent.slice(0, position) + 
          processedContent.slice(position + log.length);
        offset -= log.length;
      }
    }

    return processedContent;
  }

  /**
   * Tek dosyayı işler
   */
  private async processFile(filePath: string, mode: 'conditional' | 'remove'): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { logs } = this.findConsoleLogs(content);
      
      if (logs.length === 0) {
        this.stats.skippedFiles.push(filePath);
        return;
      }

      this.stats.totalLogs += logs.length;
      const processedContent = this.processConsoleLog(content, mode);
      
      // Dosyayı yaz
      fs.writeFileSync(filePath, processedContent, 'utf8');
      
      this.stats.processedFiles++;
      this.stats.removedLogs += logs.length;
      
      console.log(`✅ Processed ${filePath}: ${logs.length} console logs ${mode === 'conditional' ? 'made conditional' : 'removed'}`);
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
      this.stats.skippedFiles.push(filePath);
    }
  }

  /**
   * Tüm proje dosyalarını işler
   */
  async cleanProject(mode: 'conditional' | 'remove' = 'conditional'): Promise<ConsoleLogStats> {
    console.log(`🧹 Starting console log cleanup (mode: ${mode})...`);
    
    try {
      // TypeScript ve JavaScript dosyalarını bul
      const files = await glob('**/*.{ts,tsx,js,jsx}', {
        ignore: [
          'node_modules/**',
          'dist/**',
          'build/**',
          '.git/**',
          'scripts/**', // Script dosyalarını hariç tut
          '**/*.test.{ts,tsx,js,jsx}',
          '**/*.spec.{ts,tsx,js,jsx}'
        ]
      });

      this.stats.totalFiles = files.length;
      console.log(`📁 Found ${files.length} files to process`);

      // Dosyaları paralel olarak işle
      const batchSize = 10;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        await Promise.all(batch.map(file => this.processFile(file, mode)));
      }

      // Sonuçları göster
      console.log('\n📊 Cleanup Results:');
      console.log(`   Total files: ${this.stats.totalFiles}`);
      console.log(`   Processed files: ${this.stats.processedFiles}`);
      console.log(`   Skipped files: ${this.stats.skippedFiles.length}`);
      console.log(`   Total console logs: ${this.stats.totalLogs}`);
      console.log(`   ${mode === 'conditional' ? 'Made conditional' : 'Removed'}: ${this.stats.removedLogs}`);
      
      if (this.stats.skippedFiles.length > 0) {
        console.log('\n⚠️ Skipped files:');
        this.stats.skippedFiles.forEach(file => console.log(`   - ${file}`));
      }

      return this.stats;
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Production build için console.log'ları kaldır
   */
  async removeForProduction(): Promise<ConsoleLogStats> {
    return this.cleanProject('remove');
  }

  /**
   * Development için conditional yap
   */
  async makeConditionalForDev(): Promise<ConsoleLogStats> {
    return this.cleanProject('conditional');
  }
}

/**
 * CLI kullanımı
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] === 'remove' ? 'remove' : 'conditional';
  
  const cleaner = new ConsoleLogCleaner();
  
  try {
    if (mode === 'remove') {
      await cleaner.removeForProduction();
      console.log('\n🎉 Production cleanup completed!');
    } else {
      await cleaner.makeConditionalForDev();
      console.log('\n🎉 Development conditional cleanup completed!');
    }
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  }
}

// Script çalıştırma
if (require.main === module) {
  main();
}

export { ConsoleLogCleaner };
