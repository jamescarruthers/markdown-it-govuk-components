'use strict';

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const govukComponents = require('../');

// Initialize markdown-it with the plugin
const md = new MarkdownIt({ html: true });
md.use(govukComponents);

// Read the example markdown file
const markdown = fs.readFileSync(path.join(__dirname, 'basic.md'), 'utf8');

// Convert to HTML
const html = md.render(markdown);

// Create a complete HTML page
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GOV.UK Components Demo</title>
    <link rel="stylesheet" href="https://unpkg.com/govuk-frontend@5.0.0/dist/govuk/govuk-frontend.min.css">
    <script src="https://unpkg.com/govuk-frontend@5.0.0/dist/govuk/govuk-frontend.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>mermaid.initialize({ startOnLoad: true });</script>
</head>
<body>
    <div class="govuk-width-container">
        <main class="govuk-main-wrapper">
            ${html}
        </main>
    </div>
    <script>window.GOVUKFrontend.initAll()</script>
</body>
</html>`;

// Write the output
const outputPath = path.join(__dirname, 'demo.html');
fs.writeFileSync(outputPath, fullHtml);

console.log(`Demo HTML generated at: ${outputPath}`);
console.log('Open this file in a browser to see the rendered components.');
