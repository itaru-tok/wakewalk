#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../assets/icons');
const OUTPUT_DIR = path.join(__dirname, '../components/icons');
const INDEX_FILE = path.join(OUTPUT_DIR, 'index.ts');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to convert kebab-case to PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
    .replace('.svg', '');
}

// Function to create component content
function createComponentContent(componentName, svgContent) {
  // Extract viewBox from SVG
  const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
  
  // Extract default width and height
  const widthMatch = svgContent.match(/width="(\d+)"/);
  const heightMatch = svgContent.match(/height="(\d+)"/);
  const defaultWidth = widthMatch ? widthMatch[1] : '24';
  const defaultHeight = heightMatch ? heightMatch[1] : '24';
  
  // Extract path data and other SVG elements
  const pathMatches = svgContent.match(/<path[^>]*>/g) || [];
  const rectMatches = svgContent.match(/<rect[^>]*>/g) || [];
  const circleMatches = svgContent.match(/<circle[^>]*>/g) || [];
  
  let svgElements = '';
  
  // Process paths
  pathMatches.forEach((pathTag) => {
    const dMatch = pathTag.match(/d="([^"]*)"/);
    if (dMatch) {
      svgElements += `      <Path d="${dMatch[1]}" fill={fill} />\n`;
    }
  });
  
  // Process rects
  rectMatches.forEach((rectTag) => {
    const xMatch = rectTag.match(/x="([^"]*)"/);
    const yMatch = rectTag.match(/y="([^"]*)"/);
    const widthMatch = rectTag.match(/width="([^"]*)"/);
    const heightMatch = rectTag.match(/height="([^"]*)"/);
    
    if (xMatch && yMatch && widthMatch && heightMatch) {
      svgElements += `      <Rect x="${xMatch[1]}" y="${yMatch[1]}" width="${widthMatch[1]}" height="${heightMatch[1]}" fill={fill} />\n`;
    }
  });
  
  // Process circles
  circleMatches.forEach((circleTag) => {
    const cxMatch = circleTag.match(/cx="([^"]*)"/);
    const cyMatch = circleTag.match(/cy="([^"]*)"/);
    const rMatch = circleTag.match(/r="([^"]*)"/);
    
    if (cxMatch && cyMatch && rMatch) {
      svgElements += `      <Circle cx="${cxMatch[1]}" cy="${cyMatch[1]}" r="${rMatch[1]}" fill={fill} />\n`;
    }
  });
  
  // Determine which SVG components to import
  const imports = ['Svg'];
  if (pathMatches.length > 0) imports.push('Path');
  if (rectMatches.length > 0) imports.push('Rect');
  if (circleMatches.length > 0) imports.push('Circle');
  
  return `import React from 'react';
import { ${imports.join(', ')} } from 'react-native-svg';

interface ${componentName}Props {
  width?: number;
  height?: number;
  fill?: string;
}

export default function ${componentName}({ 
  width = ${defaultWidth}, 
  height = ${defaultHeight}, 
  fill = "#D9D9D9" 
}: ${componentName}Props) {
  return (
    <Svg width={width} height={height} viewBox="${viewBox}" fill="none">
${svgElements.trimEnd()}
    </Svg>
  );
}`;
}

// Process all SVG files
const svgFiles = fs.readdirSync(ICONS_DIR).filter(file => file.endsWith('.svg'));
const exportStatements = [];

svgFiles.forEach(file => {
  const filePath = path.join(ICONS_DIR, file);
  const svgContent = fs.readFileSync(filePath, 'utf8');
  const componentName = toPascalCase(file);
  const outputPath = path.join(OUTPUT_DIR, `${componentName}.tsx`);
  
  const componentContent = createComponentContent(componentName, svgContent);
  
  fs.writeFileSync(outputPath, componentContent);
  console.log(`✅ Generated: ${componentName}.tsx`);
  
  exportStatements.push(`export { default as ${componentName} } from './${componentName}';`);
});

// Create index file
fs.writeFileSync(INDEX_FILE, exportStatements.join('\n') + '\n');
console.log(`\n✅ Generated index.ts with ${svgFiles.length} icons`);

console.log(`\n🎉 Successfully generated ${svgFiles.length} icon components!`);
console.log(`📁 Output directory: ${OUTPUT_DIR}`);