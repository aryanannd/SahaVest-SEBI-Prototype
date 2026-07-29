import { red, green, yellow, bold } from 'colorette';

// A mock version of the NLP logic that would run on the backend to detect scams
function analyzeScamMessage(text: string): { isScam: boolean; score: number; flags: string[] } {
  const flags = [];
  let score = 0;
  const lowerText = text.toLowerCase();

  const urgencyKeywords = ['urgent', 'hurry', 'limited time', 'act now', 'deadline'];
  const guaranteeKeywords = ['guaranteed', 'risk-free', '100% safe', 'sure shot', 'double your money', 'multibagger'];
  const unofficialPaymentKeywords = ['gpay', 'upi', 'phonepe', 'paytm', 'crypto', 'wallet'];

  if (urgencyKeywords.some(k => lowerText.includes(k))) {
    flags.push('Urgency / pressure tactics detected');
    score += 35;
  }

  if (guaranteeKeywords.some(k => lowerText.includes(k))) {
    flags.push('Guaranteed return language detected');
    score += 45;
  }

  if (unofficialPaymentKeywords.some(k => lowerText.includes(k))) {
    flags.push('Unofficial payment channel requested');
    score += 30;
  }
  
  if (lowerText.includes('sebi registered') && (!text.match(/INA\d{9}/) && !text.match(/INZ\d{9}/))) {
     flags.push('Claims SEBI registration but no valid registration number found');
     score += 25;
  }

  return {
    isScam: score >= 60, // Threshold
    score,
    flags
  };
}

// Test Dataset
const TEST_DATASET = [
  {
    text: "URGENT: Multibagger alert! Buy ABC Corp now, guaranteed 100% safe returns in 1 month. Pay 5000 rs via UPI to join VIP group.",
    actualScam: true
  },
  {
    text: "Hi this is Ravi, SEBI registered advisor. I have a sure shot tip for you today. Act now before market closes!",
    actualScam: true
  },
  {
    text: "Your SIP of Rs 5000 in HDFC Flexi Cap is due tomorrow. Please ensure sufficient balance.",
    actualScam: false
  },
  {
    text: "Market update: Nifty falls 2% today amid global cues. Experts suggest staying invested.",
    actualScam: false
  },
  {
    text: "Double your money in crypto! Send to my wallet and I will trade for you. 100% safe.",
    actualScam: true
  },
  {
    text: "Thank you for opening an account with Zerodha. Your demat account number is 123456.",
    actualScam: false
  },
  {
    text: "Join my premium telegram channel for guaranteed multibagger stocks. Limited time offer, hurry!",
    actualScam: true
  },
  {
    text: "Please find attached your Consolidated Account Statement (CAS) for the month of October.",
    actualScam: false
  }
];

async function runTests() {
  console.log(bold('\n--- SahaVest Scam Detection NLP Test ---\n'));

  let truePositives = 0;
  let trueNegatives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (const item of TEST_DATASET) {
    const result = analyzeScamMessage(item.text);
    const isCorrect = result.isScam === item.actualScam;

    if (result.isScam && item.actualScam) truePositives++;
    if (!result.isScam && !item.actualScam) trueNegatives++;
    if (result.isScam && !item.actualScam) falsePositives++;
    if (!result.isScam && item.actualScam) falseNegatives++;

    const logColor = isCorrect ? green : red;
    console.log(logColor(`Message: "${item.text.substring(0, 50)}..."`));
    console.log(`Predicted: ${result.isScam ? 'Scam' : 'Safe'} | Actual: ${item.actualScam ? 'Scam' : 'Safe'}`);
    if (result.flags.length > 0) {
      console.log(`Flags: ${result.flags.join(', ')}`);
    }
    console.log('------------------------------------------------');
  }

  const total = TEST_DATASET.length;
  const accuracy = ((truePositives + trueNegatives) / total) * 100;

  console.log(bold('\n--- Results Summary ---'));
  console.log(`Total Tested: ${total}`);
  console.log(green(`True Positives (Scams correctly caught): ${truePositives}`));
  console.log(green(`True Negatives (Safe messages cleared): ${trueNegatives}`));
  console.log(red(`False Positives (Safe marked as scam): ${falsePositives}`));
  console.log(red(`False Negatives (Scams missed): ${falseNegatives}`));
  
  const accuracyColor = accuracy >= 90 ? green : yellow;
  console.log(bold(accuracyColor(`\nOverall Accuracy: ${accuracy.toFixed(2)}%\n`)));
}

runTests().catch(console.error);
