const fs = require('fs');
const filePath = 'c:\\\\Users\\\\Maruf\\\\Downloads\\\\verifiedvault\\\\verifiedvault\\\\site_data.js';
let content = fs.readFileSync(filePath, 'utf8');

// We know the first blog ends at line 424.
// Let's split by lines.
let lines = content.split(/\r?\n/);

// Find "var blogs = ["
let blogsStartIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('var blogs = [')) {
        blogsStartIndex = i;
        break;
    }
}

let firstBlogEndIndex = -1;
if (blogsStartIndex !== -1) {
    let openBraces = 0;
    let foundFirstBrace = false;
    for (let i = blogsStartIndex; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('{')) {
            openBraces += (line.match(/\{/g) || []).length;
            foundFirstBrace = true;
        }
        if (line.includes('}')) {
            openBraces -= (line.match(/\}/g) || []).length;
        }
        
        if (foundFirstBrace && openBraces === 0) {
            firstBlogEndIndex = i;
            break;
        }
    }
}

if (blogsStartIndex !== -1 && firstBlogEndIndex !== -1) {
    // Find the end of the blogs array "];"
    let blogsEndIndex = -1;
    for (let i = firstBlogEndIndex + 1; i < lines.length; i++) {
        if (lines[i].startsWith('];') || lines[i] === '];') {
            blogsEndIndex = i;
            break;
        }
    }

    if (blogsEndIndex !== -1) {
        // Keep lines before blogs + first blog + "];" + lines after blogs
        // Fix the comma on the first blog's last line if it exists
        lines[firstBlogEndIndex] = lines[firstBlogEndIndex].replace(',', '');
        
        const newLines = [
            ...lines.slice(0, firstBlogEndIndex + 1),
            '];',
            ...lines.slice(blogsEndIndex + 1)
        ];
        
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        console.log('Successfully updated site_data.js to keep only the first blog.');
    } else {
        console.log('Could not find the end of the blogs array.');
    }
} else {
    console.log('Could not parse blogs array boundaries.');
}
