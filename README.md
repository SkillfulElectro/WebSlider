# WebSlider

**Create stunning presentations using HTML slides**

WebSlider is a browser-based presentation tool that lets you build slideshows using HTML files. Perfect for developers, designers, and anyone who wants full creative control over their presentation designs.

![WebSlider](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **HTML-Based Slides**: Use HTML, CSS, and JavaScript to create beautiful, animated slides
- **Multiple Preset Sizes**: PowerPoint 16:9, 4:3, A4, Letter, HD 1080p, Instagram, and more
- **Presentation Mode**: Full-screen presentation with keyboard navigation
- **PDF Export**: Export your presentation as a PDF document
- **Project Files**: Save and load projects with `.webslider` format
- **Sample Templates**: Start quickly with pre-built presentation templates
- **Slide Management**: Add, duplicate, edit, reorder, and delete slides
- **Keyboard Shortcuts**: Efficient workflow with keyboard controls
- **Responsive UI**: Works on desktop and tablet devices

## 🚀 Getting Started

### Quick Start

1. Open `index.html` in a modern web browser
2. Click **"New Presentation"** to create a project
3. Choose your slide size preset
4. Click **"+ Add Slide"** to upload HTML files
5. Use **"▶️ Present"** to view fullscreen
6. Export as PDF or save your project

### Creating Slides

Each slide is an HTML file. Here's a simple example:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-family: system-ui, sans-serif;
        }
        h1 {
            font-size: 72px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>Hello, WebSlider!</h1>
</body>
</html>
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F5` | Start presentation from beginning |
| `Shift + F5` | Start from current slide |
| `→` / `Space` | Next slide (presentation mode) |
| `←` / `Backspace` | Previous slide (presentation mode) |
| `Escape` | Exit presentation mode |
| `Ctrl + S` | Save/Export project |
| `Home` | Go to first slide (presentation mode) |
| `End` | Go to last slide (presentation mode) |

## 📁 Project Structure

```
webslider/
├── index.html          # Main entry point
├── README.md           # This file
├── css/
│   └── styles.css      # Custom styles
└── js/
    ├── app.js          # App initialization
    ├── state.js        # State management
    ├── utils.js        # Utility functions
    ├── modal.js        # Modal dialogs
    ├── slides.js       # Slide operations
    ├── samples.js      # Sample templates
    ├── export.js       # Import/export & PDF
    ├── events.js       # Event handlers
    └── renderer.js     # UI rendering
```

## 🛠️ Technologies

- **Bootstrap 5.3** - UI framework (via cdnjs)
- **jsPDF** - PDF generation (via cdnjs)
- **html-to-image** - HTML to image conversion

## 📋 Slide Size Presets

| Preset | Dimensions |
|--------|------------|
| PowerPoint 16:9 | 1280 × 720 |
| PowerPoint 4:3 | 1024 × 768 |
| A4 Portrait | 794 × 1123 |
| A4 Landscape | 1123 × 794 |
| Letter Portrait | 816 × 1056 |
| Letter Landscape | 1056 × 816 |
| HD 1080p | 1920 × 1080 |
| Instagram Post | 1080 × 1080 |
| Custom | User-defined |

## 💾 File Formats

### .webslider (Project File)

JSON file containing:
- Project name
- Slide size configuration
- All slide content (HTML)

### PDF Export

- High-quality image rendering
- Maintains slide dimensions
- Supports custom fonts and graphics

## 🎨 Tips for Great Slides

1. **Use viewport units**: `100vh` and `100vw` ensure content scales properly
2. **Embed fonts**: Use `@font-face` or Google Fonts for consistent typography
3. **Self-contained**: Include all CSS in `<style>` tags within each HTML file
4. **Test locally**: Preview your HTML files in a browser before importing
5. **Animations**: CSS animations and transitions work great in presentation mode

## ⚠️ Known Limitations

- Slides must be self-contained HTML files
- External resources need CORS headers to render properly
- PDF export works best with embedded styles and images
- Some advanced CSS features may not export perfectly to PDF

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Made with ❤️ for the web development community**
