
# 🚀 Markdown Studio

_A powerful, AI-enhanced markdown editor for modern content creation._

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

<details>
<summary>📖 Table of Contents</summary>

1. [🎯 Overview](#overview)
2. [✨ Features](#features)
3. [🛠️ Technology Stack](#technology-stack)
4. [🚀 Quick Start](#quick-start)
5. [📝 Usage Guide](#usage-guide)
6. [🤖 AI Integration](#ai-integration)
7. [🎨 Themes](#themes)
8. [📤 Export Options](#export-options)
9. [🔧 Development](#development)
10. [🚀 Deployment](#deployment)
11. [🤝 Contributing](#contributing)
12. [📄 License](#license)

</details>

## 🎯 Overview

Markdown Studio is a next-generation markdown editor that combines the simplicity of markdown with the power of AI. Built for writers, developers, and content creators who demand a seamless, feature-rich editing experience.

**Key Highlights:**
- 🤖 AI-powered content formatting and enhancement (via Groq API)
- 📱 Responsive design that works on all devices
- 🔄 Real-time preview with synchronized scrolling
- 💾 Auto-save to browser localStorage
- 🎨 Multiple beautiful themes to choose from
- 📊 Advanced export capabilities (PDF, DOCX, HTML, LaTeX)

## ✨ Features

### ✍️ Editor Features
- **Real-time Preview**: Split-screen editing with live markdown preview
- **Smart Text Selection**: Context-aware formatting suggestions
- **Auto-completion**: Intelligent markdown syntax completion
- **Smart Paste**: Automatically formats URLs, code snippets, and other content
- **Template System**: Quick insertion of tables, code blocks, checklists, and more
- **Command Palette**: Quick access to all editor functions
- **Focus Mode**: Distraction-free writing environment
- **Mobile Support**: Adaptive UI for phones and tablets
- **Auto-save**: Content automatically saved to browser localStorage

### 🤖 AI-Powered Enhancements
- **AI Formatting**: Automatically enhance content structure and readability
- **Smart Suggestions**: Context-aware formatting recommendations
- **Content Enhancement**: Improve grammar, style, and presentation
- **Template Generation**: AI-assisted content templates

### 🎨 Customization
- **8 Beautiful Themes**: Light, Dark, Cyberpunk, Forest, Ocean, Sunset, Minimal, High Contrast
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Customizable Toolbar**: Personalize your editing experience

### 📤 Export & Import
- **PDF Export**: Professional-quality PDF generation
- **DOCX Export**: Microsoft Word compatibility
- **HTML Export**: Clean, semantic HTML output
- **LaTeX Export**: Academic and scientific document formatting
- **Plain Text**: Clean text extraction
- **Smart Import**: Paste content from various sources with auto-formatting

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality component library
- **React Router** - Client-side routing

### AI & Processing
- **Groq AI** - Fast AI inference for content formatting (user provides API key)
- **Marked** - Markdown parsing and rendering

### Additional Libraries
- **Lucide React** - Beautiful icons
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas conversion
- **docx** - Word document generation
- **file-saver** - File download utilities
- **Framer Motion** - Smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RexO77/MarkdownStudioX.git
cd MarkdownStudioX
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173`

### First Time Setup

1. **Set your API Key** - Click the "Set API Key" button to configure your Groq API key for AI features
2. **Explore themes** - Try different themes from the toolbar
3. **Start writing** - Your content auto-saves to localStorage
4. **Try AI formatting** - Use the "AI Format" button to enhance your content

## 📝 Usage Guide

### Basic Editing
1. **Start Typing**: Begin writing with standard markdown syntax
2. **Live Preview**: See your formatted content in real-time on the right panel
3. **Auto-save**: Your work is saved automatically to browser localStorage

### Advanced Features

#### Smart Text Selection
- Select text to see context-aware formatting options
- Get intelligent suggestions based on content type
- Quick access to bold, italic, code, links, and headings

#### Templates
- Access pre-built templates from the toolbar
- Insert tables, code blocks, checklists, quotes, and diagrams
- Customize templates for your workflow

#### AI Formatting
- Select content and click "AI Format" for enhancement
- Automatic structure improvement
- Grammar and style suggestions
- Emoji and formatting additions

#### Export Options
- **PDF**: Export menu > PDF for print-ready documents
- **Word**: Export menu > DOCX for Microsoft Word
- **HTML**: Export menu > HTML for web publishing
- **LaTeX**: Export menu > LaTeX for academic papers

## 🤖 AI Integration

### Groq AI Setup
The application uses Groq AI for fast, high-quality content formatting.

1. **Get API Key**: Create a free account at [Groq Console](https://console.groq.com)
2. **Configure Key**: Click "Set API Key" button in the header
3. **Start Using**: AI features are now enabled

### AI Features
- **Smart Formatting**: Enhance content structure and presentation
- **Grammar Enhancement**: Improve writing quality
- **Emoji Integration**: Add relevant emojis for engagement
- **Structure Optimization**: Better heading hierarchy and organization

## 🎨 Themes

Choose from 8 carefully crafted themes:

- **Light** - Clean and bright interface
- **Dark** - Easy on the eyes for long writing sessions
- **System** - Automatically follows your system preference
- **Cyberpunk** - Neon-inspired design for a futuristic feel
- **Forest** - Nature-inspired greens for a calming experience
- **Ocean** - Deep blue tranquility for focused writing
- **Sunset** - Warm orange gradients for creativity
- **Minimal** - Ultra-clean interface for distraction-free writing
- **High Contrast** - Accessibility-focused design

## 📤 Export Options

### PDF Export
- High-quality PDF generation
- Professional formatting
- Customizable page layouts
- Perfect for sharing and printing

### Microsoft Word (DOCX)
- Full compatibility with Microsoft Word
- Maintains formatting and structure
- Ideal for collaborative editing

### HTML Export
- Clean, semantic HTML
- CSS styling preserved
- Ready for web publishing

### LaTeX Export
- Academic and scientific document formatting
- Perfect for research papers
- Professional mathematical notation support

### Plain Text
- Clean text extraction
- Removes all formatting
- Universal compatibility

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── editor/         # Editor-specific components
│   ├── header/         # Header components
│   ├── ui/             # Reusable UI components
│   └── ...
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── utils/              # Utility functions
└── lib/                # Library utilities
```

### Key Components
- **UnifiedEditor**: Main editor component with preview
- **EditorToolbar**: Toolbar with formatting options
- **Preview**: Real-time markdown preview
- **ThemeProvider**: Theme management system
- **ExportMenu**: Export functionality

### Custom Hooks
- **useSmartEditor**: AI-powered editing features
- **useMobile**: Responsive design detection
- **useToast**: Toast notification system

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Deploy automatically on push

#### Netlify
1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

#### Self-hosted
1. Build the project: `npm run build`
2. Serve the `dist` folder with any static file server

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding standards
4. **Add tests**: Ensure your changes are tested
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes

### Development Guidelines
- Follow TypeScript best practices
- Write clear, descriptive commit messages
- Add documentation for new features
- Ensure responsive design
- Test on multiple devices and browsers

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Keep components small and focused
- Write self-documenting code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Support & Community

- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join community discussions
- **Updates**: Follow the project for latest updates

Built with ❤️ by the Markdown Studio team

---

*Last updated: December 2024*
