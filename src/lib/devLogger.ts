/**
 * Development-only logging utility
 * Provides structured, throttled logging for math/code detection
 * Automatically disabled in production
 */

const isDev = process.env.NODE_ENV === 'development';

interface LogEntry {
  type: 'math' | 'code' | 'conversion' | 'ai_payload';
  message: string;
  data?: any;
  timestamp: number;
}

class DevLogger {
  private logQueue: LogEntry[] = [];
  private lastLogTime: number = 0;
  private throttleMs: number = 800; // Log at most once every 800ms
  private groupOpen: boolean = false;

  private shouldLog(): boolean {
    if (!isDev) return false;
    const now = Date.now();
    if (now - this.lastLogTime < this.throttleMs) {
      return false;
    }
    this.lastLogTime = now;
    return true;
  }

  private formatPreview(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  logMathDetected(content: string, stepCount: number) {
    if (!this.shouldLog()) return;
    
    console.group('📐 Math Input Detected');
    console.log(`Steps: ${stepCount}`);
    console.log(`Preview: ${this.formatPreview(content)}`);
    console.log('Status: ✓ Captured');
    console.groupEnd();
  }

  logMathConverted(latex: string, stepCount: number) {
    if (!this.shouldLog()) return;
    
    console.group('🔄 Math Conversion (Internal)');
    console.log(`Steps: ${stepCount}`);
    console.log(`LaTeX Preview: ${this.formatPreview(latex)}`);
    console.log('Status: ✓ Converted for AI');
    console.groupEnd();
  }

  logCodeDetected(language: string, lineCount: number) {
    if (!this.shouldLog()) return;
    
    console.group('💻 Code Input Detected');
    console.log(`Language: ${language}`);
    console.log(`Lines: ${lineCount}`);
    console.log('Status: ✓ Captured');
    console.groupEnd();
  }

  logAIPayload(includesMath: boolean, includesCode: boolean, payloadSize: number) {
    if (!this.shouldLog()) return;
    
    console.group('📤 AI Request Payload');
    console.log(`Includes Math: ${includesMath ? '✓' : '✗'}`);
    console.log(`Includes Code: ${includesCode ? '✓' : '✗'}`);
    console.log(`Payload Size: ~${Math.round(payloadSize / 1024)}KB`);
    console.log('Status: ✓ Ready for AI');
    console.groupEnd();
  }

  logConversionError(error: string) {
    if (!isDev) return;
    console.warn('⚠️ Conversion Error:', error);
  }

  // Force immediate log (bypass throttle) for critical events
  logCritical(message: string, data?: any) {
    if (!isDev) return;
    console.group('🚨 Critical Event');
    console.log(message);
    if (data) console.log(data);
    console.groupEnd();
  }
}

export const devLogger = new DevLogger();

