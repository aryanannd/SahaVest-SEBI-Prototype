/**
 * CAS (Consolidated Account Statement) Parser for Bonds & SGB
 * 
 * As noted in the master plan, Sovereign Gold Bonds (RBI Retail Direct) 
 * and certain Corporate Bonds (NSE goBID) are not yet integrated into 
 * the Account Aggregator (AA) framework as FIPs. 
 * 
 * To bridge this gap (Phase 2), SahaVest parses the user's NSDL/CDSL CAS PDF.
 * This script is a mock parser demonstrating extraction of bond holdings.
 */

const mockPdfContent = `
CONSOLIDATED ACCOUNT STATEMENT
Name: Anand V.
PAN: ABCDE1234F
Statement Period: 01-Jan-2026 to 31-Jan-2026

HOLDINGS:
1. HDFC Flexi Cap Fund - Direct Plan | ISIN: INF179KA1XX1 | Qty: 125.4
2. 7.5% GOI 2034 (SGB) | ISIN: IN0020140049 | Qty: 15
3. Reliance Industries Ltd | ISIN: INE002A01018 | Qty: 50
4. NHAI Tax Free Bond 2029 | ISIN: INE906B07538 | Qty: 20
`;

function parseCAS(text) {
  console.log("Parsing CAS for non-AA assets (Bonds/SGB)...\n");
  
  const lines = text.split('\n');
  const extractedBonds = [];
  
  // Simple heuristic: look for "SGB", "Bond", "GOI"
  const bondKeywords = ['sgb', 'bond', 'goi'];
  
  for (const line of lines) {
    if (line.includes('ISIN:')) {
      const lowerLine = line.toLowerCase();
      const isBond = bondKeywords.some(keyword => lowerLine.includes(keyword));
      
      if (isBond) {
        // Simple regex to extract data
        const parts = line.split('|').map(s => s.trim());
        const name = parts[0].replace(/^\d+\.\s*/, '');
        const isin = parts[1].replace('ISIN:', '').trim();
        const qty = parts[2].replace('Qty:', '').trim();
        
        extractedBonds.push({
          assetClass: name.includes('SGB') ? 'Sovereign Gold Bond' : 'Corporate/Govt Bond',
          name,
          isin,
          quantity: Number(qty)
        });
      }
    }
  }
  
  return extractedBonds;
}

function runParser() {
  const result = parseCAS(mockPdfContent);
  console.log("--- EXTRACTION RESULTS ---");
  console.log(`Found ${result.length} Bond/SGB assets missing from AA:`);
  console.log(JSON.stringify(result, null, 2));
}

runParser();
