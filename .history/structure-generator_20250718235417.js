const fs = require('fs');
const path = require('path');

const structure = {
  // PASTE THE ENTIRE JSON STRUCTURE HERE
};

function createStructure(currentPath, node) {
  const nodePath = path.join(currentPath, node.name);
  
  if (node.type === 'directory') {
    if (!fs.existsSync(nodePath)) {
      fs.mkdirSync(nodePath, { recursive: true });
      console.log(`Created directory: ${nodePath}`);
    }
    
    if (node.children) {
      node.children.forEach(child => createStructure(nodePath, child));
    }
  } else if (node.type === 'file') {
    fs.writeFileSync(nodePath, '');
    console.log(`Created file: ${nodePath}`);
  }
}

// Start creation
createStructure(process.cwd(), structure);
console.log('✅ File structure generated!');