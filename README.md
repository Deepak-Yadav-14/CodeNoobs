# 🚀 CodeNoobs - Advanced Web-Based Code Editor

![CodeNoobs Logo](./src/assets/CodeNoobs.png)

**CodeBuddy** is a powerful, beginner-friendly web-based code editor built with modern technologies. It provides a VS Code-like experience directly in your browser with support for multiple programming languages, real-time code execution, and cloud integration.

### [Live Demo](https://codenoobs.vercel.app)

## ✨ Features

### 🎯 **Multi-Language Support**

- **JavaScript/TypeScript** - Full execution with console output
- **Python** - Interactive execution with Pyodide WASM
- **C/C++** - Real compilation and execution via Judge0 API
- **Syntax highlighting** and **intelligent code completion**

### 🎮 **Interactive Code Execution**

- **Real-time JavaScript execution** with console output
- **Interactive Python console** with input/output streaming
- **Split console for C/C++** with dedicated input/output sections
- **Error highlighting** and **debugging support**

### 🌐 **Cloud Integration**

- **Google Drive integration** for file storage and sync
- **Save/Load projects** directly to/from Google Drive
- **OAuth authentication** with Google accounts
- **Cross-device synchronization**

### 🎨 **Modern User Interface**

- **Monaco Editor** integration (same engine as VS Code)
- **Dark/Light theme** switching
- **Tabbed interface** for multiple files
- **Resizable panels** and responsive design
- **File picker modal** for easy file management

### 🔧 **Advanced Features**

- **Multi-tab code editing** with language detection
- **Real-time error markers** and syntax validation
- **Interactive input handling** for programs requiring user input
- **Execution state management** with proper cleanup
- **File upload/download** capabilities

## 🛠️ Technology Stack

### Frontend

- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Monaco Editor** - VS Code's editor in the browser
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Code Execution Engines

- **Pyodide** - Python scientific stack in WebAssembly
- **Judge0 API** - Real C/C++ compilation and execution
- **Native JavaScript** - Direct browser execution

### Cloud & APIs

- **Google Drive API** - File storage and synchronization
- **Google Identity Services** - OAuth authentication
- **RapidAPI** - Judge0 integration for C/C++ execution

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- RapidAPI account for Judge0 (for C/C++ execution)
- Google Cloud Project with Drive API enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Deepak-Yadav-14/CodeNoobs.git
   cd CodeBuddyWeb
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API keys**

   Edit `src/constants/googleConfig.js`:

   ```javascript
   export const GOOGLE_CLIENT_ID = "your-google-client-id";
   export const GOOGLE_API_KEY = "your-google-api-key";
   export const RAPIDAPI_KEY = "your-rapidapi-key";
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### Creating and Managing Files

- Click the **"+"** button to create new files
- Choose from predefined templates for different languages
- Use the tab system to switch between multiple files
- Files are automatically saved as you type

### Running Code

#### JavaScript/TypeScript

- Click the **"Run"** button in the toolbar
- Output appears in the console panel
- Supports `console.log()`, errors, and debugging

#### Python

- Interactive execution with **Pyodide**
- Real-time output streaming
- Support for `input()` function with interactive prompts
- Scientific libraries available (NumPy, Pandas, etc.)

#### C/C++

- Uses **Judge0 API** for real compilation
- **Split console interface** with separate input/output sections
- Enter all inputs in the "Program Input" section
- View compilation and execution results in real-time
- Supports `scanf()`, `cin >>`, and other input methods

### Cloud Features

1. **Sign in** with your Google account
2. **Save files** directly to Google Drive
3. **Load projects** from your Drive
4. **Sync across devices** automatically

## 🏗️ Architecture

### Component Structure

```
src/
├── components/
│   ├── CodeBuddy.jsx          # Main editor component
│   ├── TabToolbar.jsx         # Tab management
│   ├── OutputConsole.jsx      # Standard output console
│   ├── InteractiveConsole.jsx # Python interactive console
│   ├── SplitConsole.jsx       # C/C++ split console
│   ├── StatusBar.jsx          # Language and status info
│   ├── CloudMenu.jsx          # Google Drive integration
│   └── FilePickerModal.jsx    # File management modal
├── wasm/
│   ├── pyodideClient.js       # Python execution engine
│   └── cppClient.js           # C/C++ execution via Judge0
└── constants/
    ├── languages.js           # Supported languages config
    └── googleConfig.js        # API configurations
```

### Execution Flow

1. **Code Input** → Monaco Editor
2. **Language Detection** → Appropriate execution engine
3. **Code Execution** → WASM/API/Browser engine
4. **Output Processing** → Console components
5. **Result Display** → Interactive UI

## ⚙️ Configuration

### Setting up Judge0 API (C/C++)

1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to [Judge0 CE API](https://rapidapi.com/judge0-official/api/judge0-ce/)
3. Get your RapidAPI key
4. Add it to `googleConfig.js`

Detailed setup guide: [RAPIDAPI_SETUP.md](./RAPIDAPI_SETUP.md)

### Google Drive Integration

1. Create a Google Cloud Project
2. Enable Google Drive API
3. Create OAuth 2.0 credentials
4. Configure authorized origins
5. Add credentials to `googleConfig.js`

## 🎯 Advanced Features

### Split Console System

- **Dedicated input section** for C/C++ programs
- **Real-time compilation** feedback
- **Error highlighting** and debugging info
- **Execution state management**

### Interactive Python Console

- **Streaming output** with real-time updates
- **Input handling** via JavaScript promises
- **Scientific computing** support with Pyodide
- **Error tracking** and debugging

### File Management

- **Auto-save** functionality
- **File templates** for quick start
- **Import/Export** capabilities
- **Google Drive sync**

## 🚀 Performance

- **Instant startup** with Vite dev server
- **Code splitting** for optimal loading
- **WebAssembly optimization** for Python execution
- **Efficient API usage** for C/C++ compilation
- **Responsive design** for all screen sizes

## 🔒 Security

- **Content Security Policy** implementation
- **OAuth 2.0** for secure Google authentication
- **API key management** best practices
- **Sandboxed code execution**

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** team for the excellent editor experience
- **Pyodide** project for Python in the browser
- **Judge0** for reliable code execution API
- **Google** for Drive API and authentication services
- **Vite** and **React** communities for amazing tools

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Deepak-Yadav-14/CodeNoobs/issues)
- **Documentation**: Check our detailed guides in the `/docs` folder
- **Community**: Join our discussions for help and collaboration

---

<div align="center">

**Built with ❤️ by CodeNoobs**

[🌟 Star us on GitHub](https://github.com/Deepak-Yadav-14/CodeNoobs) | [🐛 Report Issues](https://github.com/Deepak-Yadav-14/CodeNoobs/issues) | [📖 Documentation](./docs)

</div>
