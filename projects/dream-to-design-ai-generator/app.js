// Dream-to-Design AI Generator Core Logic

function randomPalette() {
    // Generate random color palette
    const colors = [];
    for (let i = 0; i < 5; i++) {
        colors.push('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
    }
    return colors;
}

function randomFonts() {
    // Pick random fonts from a list
    const fontList = [
        'Montserrat', 'Roboto', 'Lato', 'Poppins', 'Merriweather', 'Inter', 'Nunito', 'Oswald', 'Raleway', 'Playfair Display'
    ];
    return [fontList[Math.floor(Math.random()*fontList.length)], fontList[Math.floor(Math.random()*fontList.length)]];
}

function randomLayout() {
    // Suggest random layout blocks
    const layouts = [
        'Hero + Features + CTA',
        'Sidebar + Content + Footer',
        'Grid Gallery + Cards',
        'Header + Tabs + Main',
        'Split Screen + Form',
        'List + Details + Actions'
    ];
    return layouts[Math.floor(Math.random()*layouts.length)];
}

function randomWireframe() {
    // Generate simple wireframe SVG
    return `<svg width="400" height="200" style="background:#eee;border-radius:12px;">
        <rect x="20" y="20" width="360" height="40" rx="8" fill="#ccc" />
        <rect x="20" y="70" width="160" height="100" rx="8" fill="#ddd" />
        <rect x="200" y="70" width="180" height="100" rx="8" fill="#ddd" />
        <rect x="20" y="180" width="360" height="10" rx="4" fill="#bbb" />
    </svg>`;
}

function generateStyleGuide(prompt) {
    const palette = randomPalette();
    const fonts = randomFonts();
    const layout = randomLayout();
    return {
        palette,
        fonts,
        layout,
        typography: `Primary: ${fonts[0]}, Secondary: ${fonts[1]}`
    };
}

function generateWireframe(prompt) {
    return randomWireframe();
}

function generateExportTokens(styleGuide) {
    // Export CSS tokens
    let css = ':root {\n';
    styleGuide.palette.forEach((color, i) => {
        css += `  --color${i+1}: ${color};\n`;
    });
    css += `  --font-primary: '${styleGuide.fonts[0]}';\n`;
    css += `  --font-secondary: '${styleGuide.fonts[1]}';\n`;
    css += '}';
    return css;
}

function handleGenerate() {
    const prompt = document.getElementById('prompt-input').value;
    const styleGuide = generateStyleGuide(prompt);
    const wireframeSVG = generateWireframe(prompt);
    const exportCSS = generateExportTokens(styleGuide);

    // Render style guide
    const styleGuideDiv = document.getElementById('style-guide');
    styleGuideDiv.innerHTML = `<h2>Style Guide</h2>
        <div class="palette">
            ${styleGuide.palette.map(color => `<div class="palette-color" style="background:${color}"></div>`).join('')}
        </div>
        <div class="font-sample" style="font-family:${styleGuide.fonts[0]}">Primary Font: ${styleGuide.fonts[0]}</div>
        <div class="font-sample" style="font-family:${styleGuide.fonts[1]}">Secondary Font: ${styleGuide.fonts[1]}</div>
        <div>Layout Suggestion: <strong>${styleGuide.layout}</strong></div>
        <div>Typography: ${styleGuide.typography}</div>`;

    // Render wireframe
    const wireframeDiv = document.getElementById('wireframe');
    wireframeDiv.innerHTML = `<h2>Wireframe Suggestion</h2>${wireframeSVG}`;

    // Render export
    const exportDiv = document.getElementById('export');
    exportDiv.innerHTML = `<h2>Export</h2>
        <button id="copy-css">Copy CSS Tokens</button>
        <pre>${exportCSS}</pre>`;
    document.getElementById('copy-css').onclick = () => {
        navigator.clipboard.writeText(exportCSS);
        alert('CSS tokens copied!');
    };
}

document.getElementById('generate-btn').addEventListener('click', handleGenerate);
