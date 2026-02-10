const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/home/banner.js');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove BannerSlider component (from "// Therapist Image Slider Component" to "};")
// Find the start
const bannerSliderStart = content.indexOf('// Therapist Image Slider Component');
const bannerSliderEnd = content.indexOf('};', bannerSliderStart) + 2;
const beforeNewline = content.indexOf('\n', bannerSliderEnd);

if (bannerSliderStart !== -1 && bannerSliderEnd !== -1) {
    content = content.substring(0, bannerSliderStart) + '\n' + content.substring(beforeNewline + 1);
    console.log('✓ Removed BannerSlider component');
}

// 2. Remove unused state variables
// Remove placeholderIndex
const placeholderIndexLine = '  const [placeholderIndex, setPlaceholderIndex] = useState(0);';
if (content.includes(placeholderIndexLine)) {
    content = content.replace(placeholderIndexLine + '\n', '');
    console.log('✓ Removed placeholderIndex state');
}

// Remove dynamicFeelingCards
const dynamicFeelingCardsLine = '  const [dynamicFeelingCards, setDynamicFeelingCards] = useState([]);';
if (content.includes(dynamicFeelingCardsLine)) {
    content = content.replace(dynamicFeelingCardsLine + '\n', '');
    console.log('✓ Removed dynamicFeelingCards state');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✓ All cleanup complete');
