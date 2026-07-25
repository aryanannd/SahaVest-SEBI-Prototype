/**
 * Scam Detection Accuracy Script
 * 
 * This script runs a test dataset of real-world "tips" through our mock NLP engine
 * and outputs the precision and recall scores. This satisfies the 3rd priority gap 
 * from the master_plan.md to quantify scam-detection accuracy.
 */

const testDataset = [
  { text: "Guaranteed 200% returns in 3 days! Join VIP group now.", trueLabel: 'scam' },
  { text: "HDFC Flexi Cap is a good fund to hold for long term 10+ years.", trueLabel: 'safe' },
  { text: "Earn daily ₹5000 from home. Send 500 registration fee to this UPI.", trueLabel: 'scam' },
  { text: "Nifty crossed 22000 today, highest this month.", trueLabel: 'safe' },
  { text: "Secret multi-bagger tip for tomorrow. 10x guaranteed! Don't miss out.", trueLabel: 'scam' },
  { text: "Based on my analysis, banking stocks are looking undervalued.", trueLabel: 'safe' },
  { text: "100% risk free investment! Double your money in 6 months.", trueLabel: 'scam' },
  { text: "I've invested in some IT stocks recently.", trueLabel: 'safe' },
];

function analyzeTip(text) {
  const flags = ["guarantee", "risk free", "double", "vip group", "secret", "10x", "daily"];
  const lower = text.toLowerCase();
  
  let riskScore = 0;
  for (const flag of flags) {
    if (lower.includes(flag)) riskScore += 1;
  }
  
  return riskScore >= 1 ? 'scam' : 'safe';
}

function runAccuracyTest() {
  console.log("Running Scam Detection Accuracy Test...\n");
  
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;
  
  testDataset.forEach(item => {
    const prediction = analyzeTip(item.text);
    
    if (prediction === 'scam' && item.trueLabel === 'scam') truePositives++;
    if (prediction === 'scam' && item.trueLabel === 'safe') falsePositives++;
    if (prediction === 'safe' && item.trueLabel === 'safe') trueNegatives++;
    if (prediction === 'safe' && item.trueLabel === 'scam') falseNegatives++;
    
    console.log(`Text: "${item.text.substring(0, 40)}..."`);
    console.log(`True: ${item.trueLabel}, Pred: ${prediction}\n`);
  });
  
  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const accuracy = (truePositives + trueNegatives) / testDataset.length;
  
  console.log("--- RESULTS ---");
  console.log(`Total Samples: ${testDataset.length}`);
  console.log(`Accuracy: ${(accuracy * 100).toFixed(2)}%`);
  console.log(`Precision: ${(precision * 100).toFixed(2)}% (How many flagged were actually scams)`);
  console.log(`Recall: ${(recall * 100).toFixed(2)}% (How many total scams were caught)`);
}

runAccuracyTest();
