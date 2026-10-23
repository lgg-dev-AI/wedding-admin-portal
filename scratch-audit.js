const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Find all tab IDs
const tabMatches = html.match(/id=["']tab-([^"']+)["']/g) || [];
const tabs = tabMatches.map(m => m.replace(/id=["']tab-/, '').replace(/["']/, ''));

// Find all showTab calls in sidebar and buttons
const showTabMatches = html.match(/showTab\(['"]([^'"]+)['"]\)/g) || [];
const calledTabs = [...new Set(showTabMatches.map(m => m.replace(/showTab\(['"]/, '').replace(/['"]\)/, '')))];

console.log('--- Tabs Defined in HTML ---');
console.log(tabs);

console.log('\n--- Tabs Invoked in Navigation ---');
console.log(calledTabs);

// Check if any calledTab is missing a container
const missingContainers = calledTabs.filter(t => !tabs.includes(t));
console.log('\n--- Missing Containers for Navigation ---');
console.log(missingContainers);

// List script tags
const scriptMatches = html.match(/<script\s+src=["']([^"']+)["']/g) || [];
console.log('\n--- Script Tags Loaded in index.html ---');
scriptMatches.forEach(s => console.log(' ', s));
