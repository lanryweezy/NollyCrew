const fs = require('fs');

function fixDuplicates(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const importLines = [];
  let inImport = false;

  const modifiedLines = lines.map(line => {
    if (line.includes('} from "lucide-react";') || line.includes("} from 'lucide-react';")) {
        inImport = false;
    }

    if (inImport && line.trim().startsWith('MessageSquare')) {
        if (importLines.includes('MessageSquare')) {
            return null; // skip
        }
        importLines.push('MessageSquare');
    }

    if (line.includes('import {') && (line.includes('lucide-react') || !line.includes('}'))) {
        inImport = true;
    }
    return line;
  }).filter(line => line !== null);

  fs.writeFileSync(filePath, modifiedLines.join('\n'));
}

fixDuplicates('client/src/components/LandingPage.tsx');
fixDuplicates('client/src/pages/Messages.tsx');
