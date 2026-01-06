# WebSlider

**Create stunning presentations using HTML slides**

WebSlider is a browser-based presentation tool that lets you build slideshows using HTML files.

![WebSlider](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **HTML-Based Slides**: Use HTML, CSS, and JavaScript to create beautiful slides
- **Multiple Preset Sizes**: PowerPoint 16:9, 4:3, A4, Letter, HD 1080p, Instagram, and more
- **Presentation Mode**: Full-screen presentation with keyboard navigation
- **PDF Export**: Export your presentation as a PDF document
- **Project Files**: Save and load projects with `.webslider` format
- **Sample Templates**: Start quickly with pre-built presentation templates
- **LocalStorage Persistence**: Projects are saved between page navigations

## 🚀 Getting Started

1. Open `index.html` in a modern web browser
2. Click **"New Presentation"** or choose a template
3. Click **"+ Add Slide"** to upload HTML files
4. Use **"▶️ Present"** to view fullscreen
5. Export as PDF or save your project

## 📁 Project Structure
```
webslider/
├── index.html           # Landing page
├── editor.html          # Slide editor
├── present.html         # Presentation mode
├── README.md            
├── css/
│   ├── common.css       # Shared styles
│   ├── index.css        # Landing page styles
│   ├── editor.css       # Editor styles
│   └── present.css      # Presentation styles
└── js/
    ├── common.js        # Shared utilities & storage
    ├── samples.js       # Sample templates
    ├── index.js         # Landing page logic
    ├── editor.js        # Editor logic
    └── present.js       # Presentation logic
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

## 🛠️ Technologies

- **Bootstrap 5.3** - UI framework
- **jsPDF** - PDF generation
- **html-to-image** - HTML to image conversion
- **LocalStorage** - Project persistence

## 📄 License

MIT License

---

**Made with ❤️ for the web development community**
