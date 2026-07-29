const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'src', 'features');
let output = "# Systematic Audit - Stage A\n\n";

const clusters = {
  onboarding: 'Cluster 1: Onboarding & KYC',
  dashboard: 'Cluster 2: Dashboard',
  portfolio: 'Cluster 3: Portfolio',
  trade: 'Cluster 4: Transactions',
  trading: 'Cluster 4: Transactions',
  profile: 'Cluster 5: Profile & Settings',
  trust: 'Cluster 6: Trust & Compliance',
  compliance: 'Cluster 6: Trust & Compliance',
  twin: 'Cluster 7: AI / Twin',
  ai: 'Cluster 7: AI / Twin',
  alerts: 'Cluster 8: Alerts',
  learning: 'Cluster 9: Learning / Simulator',
  simulation: 'Cluster 9: Learning / Simulator',
};

const results = {};

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const clusterKey = path.basename(path.dirname(fullPath));
      const clusterName = clusters[clusterKey] || `Other (${clusterKey})`;
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (!results[clusterName]) results[clusterName] = [];
      
      // Simple regex to find buttons, links, etc
      // We will just do a manual comprehensive review of the known explicit ones, but this helps catch others
      const matches = content.match(/<button.*?<\/button>|<a .*?<\/a>|<Link .*?<\/Link>|<input type="(checkbox|radio|submit)".*?>|<select.*?>.*?<\/select>/gs) || [];
      
      results[clusterName].push({
        file,
        elements: matches.length
      });
    }
  }
}
traverse(featuresDir);

console.log(JSON.stringify(results, null, 2));
