import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { execFile } from 'child_process';

export interface CASParserResult {
  investor_info?: any;
  folios?: any[];
  [key: string]: any;
}

export class CasParseError extends Error {
  public code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'CasParseError';
    this.code = code;
  }
}

/**
 * Parses a CAS PDF strictly using the local python casparser library.
 */
export async function parseCasPdf(filePath: string, password?: string): Promise<CASParserResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../scripts/parse_cas.py');
    
    // execFile is safer than exec or spawn without shell, mitigating shell injection
    execFile('python', [scriptPath, filePath, password || ''], (error, stdout, stderr) => {
      
      let parsedOutput: any = null;
      try {
        if (stdout) {
          parsedOutput = JSON.parse(stdout);
        }
      } catch (e) {}

      if (error) {
        console.error(`[CAS] Python script exited with code ${error.code}`);
        
        // Handle specific exit codes mapped in parse_cas.py
        if (error.code === 10 || (parsedOutput && parsedOutput.type === 'INCORRECT_PASSWORD')) {
          return reject(new CasParseError('Incorrect password', 'INCORRECT_PASSWORD'));
        }
        
        if (error.code === 11 || (parsedOutput && parsedOutput.type === 'PARSE_ERROR')) {
          return reject(new CasParseError(parsedOutput?.error || "Couldn't read this statement format", 'PARSE_ERROR'));
        }

        return reject(new CasParseError(parsedOutput?.error || stderr || 'Failed to parse CAS PDF via Python', 'UNKNOWN'));
      }
      
      if (!parsedOutput) {
        return reject(new CasParseError('Failed to parse Python output as JSON', 'UNKNOWN'));
      }

      if (parsedOutput.error) {
        return reject(new CasParseError(parsedOutput.error, parsedOutput.type || 'UNKNOWN'));
      }

      resolve(parsedOutput);
    });
  });
}
