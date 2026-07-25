const fs = require('fs');
const path = require('path');

const mapping = {
  account_balance: 'Landmark',
  account_balance_wallet: 'Wallet',
  account_circle: 'User',
  account_tree: 'Network',
  add: 'Plus',
  add_circle: 'PlusCircle',
  analytics: 'BarChart2',
  arrow_back: 'ArrowLeft',
  arrow_downward: 'ArrowDown',
  arrow_forward: 'ArrowRight',
  arrow_upward: 'ArrowUp',
  assignment_turned_in: 'ClipboardCheck',
  assured_workload: 'Briefcase',
  auto_awesome: 'Sparkles',
  autorenew: 'RefreshCw',
  badge: 'IdCard',
  balance: 'Scale',
  block: 'Ban',
  business: 'Building2',
  business_center: 'Briefcase',
  calendar_month: 'CalendarDays',
  calendar_today: 'Calendar',
  cancel: 'X',
  check: 'Check',
  check_circle: 'CheckCircle2',
  chevron_left: 'ChevronLeft',
  chevron_right: 'ChevronRight',
  close: 'X',
  cloud_off: 'CloudOff',
  corporate_fare: 'Building',
  dangerous: 'AlertOctagon',
  dashboard: 'LayoutDashboard',
  database: 'Database',
  delete: 'Trash2',
  description: 'FileText',
  devices: 'MonitorSmartphone',
  dialpad: 'Grip',
  diamond: 'Gem',
  domain: 'Globe',
  done_all: 'CheckCheck',
  donut_large: 'PieChart',
  download: 'Download',
  drive_file_rename_outline: 'PenSquare',
  edit: 'Edit2',
  elderly: 'Users',
  error: 'AlertTriangle',
  event_repeat: 'CalendarSync',
  expand_more: 'ChevronDown',
  explore: 'Compass',
  filter_list: 'Filter',
  finance: 'LineChart',
  fingerprint: 'Fingerprint',
  flag: 'Flag',
  food_bank: 'Home',
  format_image_left: 'AlignLeft',
  gavel: 'Gavel',
  gpp_maybe: 'ShieldAlert',
  grid_view: 'Grid',
  group: 'Users',
  health_and_safety: 'ShieldCheck',
  history: 'History',
  history_edu: 'ScrollText',
  home: 'Home',
  home_pin: 'MapPin',
  horizontal_rule: 'Minus',
  image: 'Image',
  info: 'Info',
  landscape: 'Mountain',
  laptop_mac: 'Laptop',
  lightbulb: 'Lightbulb',
  link: 'Link',
  local_fire_department: 'Flame',
  local_police: 'BadgeCheck',
  lock: 'Lock',
  lock_reset: 'Unlock',
  logout: 'LogOut',
  mail: 'Mail',
  menu: 'Menu',
  menu_book: 'BookOpen',
  military_tech: 'Medal',
  monitoring: 'Activity',
  more_vert: 'MoreVertical',
  notifications: 'Bell',
  notifications_active: 'BellRing',
  open_in_new: 'ExternalLink',
  payments: 'Banknote',
  pending: 'Clock',
  percent: 'Percent',
  person: 'User',
  pie_chart: 'PieChart',
  plagiarism: 'SearchX',
  play_arrow: 'Play',
  policy: 'FileBadge',
  progress_activity: 'Loader2',
  psychology: 'Brain',
  public: 'Globe2',
  report: 'Flag',
  robot_2: 'Bot',
  save: 'Save',
  savings: 'PiggyBank',
  schedule: 'Clock',
  school: 'GraduationCap',
  search: 'Search',
  security: 'Shield',
  send: 'Send',
  settings: 'Settings',
  shield: 'Shield',
  shield_lock: 'ShieldAlert',
  shield_locked: 'ShieldAlert',
  shield_person: 'ShieldCheck',
  shield_with_heart: 'ShieldCheck',
  show_chart: 'LineChart',
  smart_toy: 'Bot',
  smartphone: 'Smartphone',
  storefront: 'Store',
  sync: 'RefreshCw',
  sync_alt: 'ArrowLeftRight',
  task_alt: 'CheckCircle',
  timeline: 'TrendingUp',
  timer: 'Timer',
  timer_off: 'TimerOff',
  trending_up: 'TrendingUp',
  tune: 'Sliders',
  update: 'RotateCw',
  upload_file: 'Upload',
  verified: 'BadgeCheck',
  verified_user: 'ShieldCheck',
  wallet: 'Wallet',
  warning: 'AlertTriangle',
  work: 'Briefcase'
};

const regex = /<span className="[^"]*material-symbols-outlined[^"]*"[^>]*>([^<]+)<\/span>/g;
const regexInline = /<span className='[^']*material-symbols-outlined[^']*'[^>]*>([^<]+)<\/span>/g;
const regexNoClass = /<span className="material-symbols-outlined"[^>]*>([^<]+)<\/span>/g;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let iconsUsed = new Set();
  
  let newContent = content.replace(regex, (match, iconName) => {
    let cleanIcon = iconName.trim();
    if (mapping[cleanIcon]) {
      iconsUsed.add(mapping[cleanIcon]);
      const classMatch = match.match(/className="([^"]+)"/);
      let classes = '';
      if (classMatch) {
         classes = classMatch[1].replace('material-symbols-outlined', '').replace('icon-fill', '').replace(/\s+/g, ' ').trim();
      }
      return '<' + mapping[cleanIcon] + (classes ? ' className="' + classes + '"' : '') + ' />';
    }
    return match;
  });

  if (iconsUsed.size > 0 && newContent !== content) {
    const iconList = Array.from(iconsUsed).join(', ');
    const iconImportStr = `import { ${iconList} } from "lucide-react";\n`;
    
    if (newContent.includes('lucide-react')) {
      const existingImportRegex = /import\s+\{[^}]+\}\s+from\s+['"]lucide-react['"];/;
      const match = newContent.match(existingImportRegex);
      if (match) {
         let inner = match[0].match(/\{([^}]+)\}/)[1];
         let existingIcons = inner.split(',').map(s => s.trim());
         iconsUsed.forEach(i => {
           if(!existingIcons.includes(i)) existingIcons.push(i);
         });
         newContent = newContent.replace(existingImportRegex, `import { ${existingIcons.join(', ')} } from "lucide-react";`);
      } else {
         newContent = iconImportStr + newContent;
      }
    } else {
       const firstImport = newContent.indexOf('import');
       if (firstImport !== -1) {
         const endOfLine = newContent.indexOf('\n', firstImport);
         newContent = newContent.slice(0, endOfLine + 1) + iconImportStr + newContent.slice(endOfLine + 1);
       } else {
         newContent = iconImportStr + newContent;
       }
    }
    
    fs.writeFileSync(filePath, newContent);
    console.log('Updated ' + filePath + ' with icons: ' + iconList);
  }
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src');
files.forEach(f => processFile(f));
