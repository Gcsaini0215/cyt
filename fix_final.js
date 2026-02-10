const fs = require('fs');
const file = 'src/components/home/banner.js';
let content = fs.readFileSync(file, 'utf-8');

// Remove Mic from imports
content = content.replace(/,\s*Mic\s*\n\}/m, '\n}');

// Remove placeholderIndex state
content = content.replace(/\s*const \[placeholderIndex, setPlaceholderIndex\] = useState\(0\);\n/g, '');

// Remove dynamicFeelingCards state
content = content.replace(/\s*const \[dynamicFeelingCards, setDynamicFeelingCards\] = useState\(\[\]\);\n/g, '');

fs.writeFileSync(file, content);
console.log('Done fixing remaining issues');
