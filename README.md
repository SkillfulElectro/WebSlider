# WebSlider

**Create stunning presentations using HTML slides with full asset support**

WebSlider is a browser-based presentation tool that lets you build slideshows using HTML files, with full support for relative paths and local assets (images, CSS, JS, fonts, etc.) using the browser's Cache API.

** if you had problem with converting your slides to pdf ![WebSlider2Pdf](https://github.com/SkillfulElectro/WebSlider2Pdf.git) **

![WebSlider](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **HTML-Based Slides**: Use HTML, CSS, and JavaScript to create beautiful slides
- **Asset Support**: Upload entire folders with images, CSS, JS, fonts - relative paths work!
- **Cache API Storage**: Assets stored in browser cache for proper path resolution
- **TAR Project Format**: Save projects as `.webslider` files (TAR format) including all assets
- **Multiple Preset Sizes**: PowerPoint 16:9, 4:3, A4, Letter, HD 1080p, Instagram, and more
- **Presentation Mode**: Full-screen presentation with keyboard navigation
- **PDF Export**: Export your presentation as a PDF document
- **Sample Templates**: Start quickly with pre-built presentation templates

## 🚀 Getting Started

1. Open `index.html` in a modern web browser
2. Click **"New Presentation"** or choose a template
3. Click **"+ Add Slide"** to upload HTML files or folders with assets
4. Use **"▶️ Present"** to view fullscreen
5. Export as PDF or save your project as `.webslider`

## 📁 Project Structure

```
webslider/
├── index.html           # Landing page
├── editor.html          # Slide editor
├── present.html         # Presentation mode
├── README.md            # This documentation
├── css/
│   ├── common.css       # Shared styles
│   ├── index.css        # Landing page styles
│   ├── editor.css       # Editor styles
│   └── present.css      # Presentation styles
└── js/
    ├── common.js        # Shared utilities, TAR, Cache API, Storage
    ├── samples.js       # Sample templates
    ├── index.js         # Landing page logic
    ├── editor.js        # Editor logic
    └── present.js       # Presentation 

```

## 🗂️ File Format

### .webslider Format (TAR Archive)

Projects are saved as TAR archives with the following structure:

```
project.webslider (TAR)
├── manifest.json           # Project metadata
└── slides/
    ├── 0/
    │   ├── index.html      # Slide HTML content
    │   ├── images/         # Slide assets (preserved structure)
    │   │   └── logo.png
    │   ├── css/
    │   │   └── styles.css
    │   └── js/
    │       └── script.js
    ├── 1/
    │   ├── index.html
    │   └── ...
    └── ...
```

### manifest.json Structure

```json
{
  "name": "My Presentation",
  "slideSize": {
    "width": 1280,
    "height": 720,
    "name": "PowerPoint 16:9"
  },
  "slides": [
    {
      "source": "title.html",
      "hasAssets": true
    },
    {
      "source": "content.html",
      "hasAssets": false
    }
  ]
}
```

## 💾 Cache API Usage

WebSlider uses the browser's Cache API to store slide assets:

### How It Works

1. **On Main Page Load**: All caches are cleared to ensure fresh state
2. **When Adding Folder**: All files are stored in cache at `/webslider-cache/{slide_index}/{relative_path}`
3. **When Rendering Slides**: HTML is processed to resolve relative paths from cache
4. **On Going Home**: Caches are cleared when user confirms

### Cache Structure

```
Cache: 'webslider-assets-v1'
├── /webslider-cache/0/images/logo.png
├── /webslider-cache/0/css/styles.css
├── /webslider-cache/0/js/animations.js
├── /webslider-cache/1/background.jpg
└── ...
```

### Path Resolution

When a slide with assets is rendered:
1. Parse the HTML document
2. Find all resource references (img src, link href, script src, url())
3. For each relative path, fetch from cache
4. Convert to blob URLs
5. Inject the modified HTML into iframe

## 📤 Adding Slides

### Option 1: HTML File Only

Upload a single HTML file. All styles and content must be inline or from external CDNs.

### Option 2: Folder with Assets

Upload a folder containing:
- `index.html` (or any `.html` file - first one found is used)
- Any local assets (images, CSS, JS, fonts, etc.)

The folder structure is preserved in the cache:

```
my-slide/
├── index.html           → Stored as slide content
├── images/
│   ├── logo.png        → Cached at /webslider-cache/{slide}/images/logo.png
│   └── hero.jpg        → Cached at /webslider-cache/{slide}/images/hero.jpg
├── css/
│   └── styles.css      → Cached at /webslider-cache/{slide}/css/styles.css
└── js/
    └── app.js          → Cached at /webslider-cache/{slide}/js/app.js
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
| `F` | Toggle fullscreen (presentation mode) |
| `Home` | Go to first slide |
| `End` | Go to last slide |

## 🛠️ Technologies

- **Bootstrap 5.3** - UI framework
- **jsPDF** - PDF generation
- **html-to-image** - HTML to image conversion
- **Cache API** - Browser cache for asset storage
- **TAR Format** - Project file packaging (pure JavaScript implementation)

## 🔧 Technical Details

### JavaScript Files

| File | Purpose |
|------|---------|
| `common.js` | Shared utilities: TAR encoder/decoder, Cache manager, Storage, Utils |
| `samples.js` | Built-in sample presentation templates |
| `index.js` | Landing page: project creation, import, sample selection |
| `editor.js` | Slide editor: thumbnails, main view, file uploads, PDF export |
| `present.js` | Presentation mode: fullscreen display, navigation |

### Supported Asset Types

there are more types , some common ones :

| Type | Extensions |
|------|------------|
| HTML | .html, .htm |
| CSS | .css |
| JavaScript | .js |
| Images | .png, .jpg, .jpeg, .gif, .svg, .webp, .ico |
| Fonts | .woff, .woff2, .ttf, .eot |
| Audio | .mp3 |
| Video | .mp4, .webm |
| Other | .json, .pdf |

### Browser Compatibility

- Chrome 40+ (full support)
- Firefox 39+ (full support)
- Safari 11.1+ (full support)
- Edge 17+ (full support)

**Note**: Folder upload requires `webkitdirectory` support (all modern browsers).

## ⚠️ Limitations

1. **Cache Size**: Browser cache has size limits (varies by browser, typically 50-100MB)
2. **Session Persistence**: Cache persists during navigation between editor/present pages
3. **Same Origin**: Assets must be local files; external URLs are not cached
4. **Folder Upload**: Uses `webkitdirectory` attribute (Chrome, Firefox, Edge, Safari)

## 🐛 Troubleshooting

### Slides show blank/black in presentation mode
- Check browser console for errors
- Ensure the folder was uploaded correctly (look for 📁 badge on slide)
- Try re-uploading the folder

### Assets not loading
- Make sure relative paths in HTML match the folder structure
- Use `./images/logo.png` or `images/logo.png` (not absolute paths)
- Check console for "Not in cache" messages

### Export doesn't include assets
- Verify slides show 📁 badge indicating they have assets
- Check console during export for asset count

## 📝 Creating Custom Slides

### Basic Structure

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="slide">
        <img src="images/logo.png" alt="Logo">
        <h1>My Slide Title</h1>
        <p>Content goes here</p>
    </div>
    <script src="js/animations.js"></script>
</body>
</html>
```

### Folder Structure

```
my-slide/
├── index.html       # Main slide file
├── css/
│   └── style.css    # Slide styles
├── js/
│   └── animations.js # Optional JavaScript
└── images/
    ├── logo.png
    └── background.jpg
```

### Tips

- Use relative paths (`./images/logo.png` or `images/logo.png`)
- Set `height: 100vh` on body for full-slide layouts
- Include all assets in the folder
- Test your slide by opening `index.html` directly first

## 📄 License

MIT License

---

**Made with ❤️ for the web development community**
