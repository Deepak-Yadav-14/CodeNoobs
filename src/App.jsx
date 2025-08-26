import { useState, useRef } from "react";
import {
  Play,
  Save,
  Download,
  Upload,
  FileText,
  Moon,
  Sun,
  Plus,
  X,
  Cloud,
  User,
  LogOut,
} from "lucide-react";
import MonacoEditor from "./components/MonacoEditor";
import GoogleDriveAPI from "./components/GoogleDriveAPI";
import "./App.css";

const CodeBuddy = () => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      name: "welcome.js",
      language: "javascript",
      content:
        '// Welcome to CodeBuddy! 🚀\n// A beginner-friendly code editor with Monaco-style experience\n// Now with Google Drive integration!\n\nfunction greetUser(name) {\n  console.log(`Hello, ${name}! Welcome to CodeBuddy!`);\n  return `Happy coding, ${name}!`;\n}\n\n// Try running this code\nconst message = greetUser("Developer");\nconsole.log(message);\n\n// Sign in with Google to save to Drive!',
      saved: true,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState(1);
  const [output, setOutput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const [nextTabId, setNextTabId] = useState(2);
  const fileInputRef = useRef(null);

  const languages = [
    { value: "javascript", label: "JavaScript", ext: ".js" },
    { value: "typescript", label: "TypeScript", ext: ".ts" },
    { value: "python", label: "Python", ext: ".py" },
    { value: "html", label: "HTML", ext: ".html" },
    { value: "css", label: "CSS", ext: ".css" },
    { value: "json", label: "JSON", ext: ".json" },
    { value: "markdown", label: "Markdown", ext: ".md" },
  ];

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const createNewTab = () => {
    const newTab = {
      id: nextTabId,
      name: `untitled-${nextTabId}.js`,
      language: "javascript",
      content: "// New file\n// Start coding here...\n\n",
      saved: false,
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
  };

  const closeTab = (tabId, event) => {
    event.stopPropagation();

    if (tabs.length === 1) {
      setTabs([
        {
          id: 1,
          name: "untitled.js",
          language: "javascript",
          content: "",
          saved: false,
        },
      ]);
      return;
    }

    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
      const nextTab = newTabs[Math.min(currentIndex, newTabs.length - 1)];
      setActiveTabId(nextTab.id);
    }
  };

  const updateTab = (updates) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, ...updates, saved: false } : tab
      )
    );
  };

  const runCode = () => {
    setShowOutput(true);
    if (
      activeTab.language === "javascript" ||
      activeTab.language === "typescript"
    ) {
      try {
        const logs = [];
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => logs.push("> " + args.join(" "));
        console.error = (...args) => logs.push("ERROR: " + args.join(" "));

        new Function(activeTab.content)();

        console.log = originalLog;
        console.error = originalError;

        setOutput(
          logs.length > 0
            ? logs.join("\n")
            : "Code executed successfully (no output)"
        );
      } catch (error) {
        setOutput(
          `Error: ${error.message}\n\nMake sure your code is valid JavaScript!`
        );
      }
    } else if (activeTab.language === "html") {
      setOutput("HTML preview would be shown here in a full implementation.");
    } else {
      setOutput(
        `Code execution for ${activeTab.language} is not supported in this demo.\nThis is a beginner-friendly editor - try JavaScript for interactive execution!`
      );
    }
  };

  const saveFile = () => {
    try {
      const currentLang = languages.find((l) => l.value === activeTab.language);
      const fileName = activeTab.name.includes(".")
        ? activeTab.name
        : `${activeTab.name}${currentLang.ext}`;

      const blob = new Blob([activeTab.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId ? { ...tab, saved: true } : tab
        )
      );
    } catch (error) {
      setOutput(`Save Error: ${error.message}`);
      setShowOutput(true);
    }
  };

  const loadFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const ext = "." + file.name.split(".").pop().toLowerCase();
        const detectedLang = languages.find((l) => l.ext === ext);
        const language = detectedLang ? detectedLang.value : "javascript";

        const newTab = {
          id: nextTabId,
          name: file.name,
          language: language,
          content: e.target.result,
          saved: true,
        };

        setTabs([...tabs, newTab]);
        setActiveTabId(nextTabId);
        setNextTabId(nextTabId + 1);
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  const theme = darkMode ? "vs-dark" : "vs";

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-200`}>
      <header
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b px-6 py-4`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <h1
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              } flex items-center`}>
              <FileText className='mr-2 text-blue-500' />
              CodeBuddy
            </h1>
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
              Monaco-style editor with Google Drive
            </span>
          </div>

          <div className='flex items-center space-x-3'>
            <GoogleDriveAPI
              setOutput={setOutput}
              setShowOutput={setShowOutput}
              tabs={tabs}
              setTabs={setTabs}
              activeTabId={activeTabId}
              nextTabId={nextTabId}
              setNextTabId={setNextTabId}
              languages={languages}
            />

            {activeTab && (
              <select
                value={activeTab.language}
                onChange={(e) => updateTab({ language: e.target.value })}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode
                  ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-100 border-gray-200"
        } border-b`}>
        <div className='flex items-center px-6'>
          <div className='flex items-center space-x-1 flex-1 overflow-x-auto'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab.id === activeTabId
                    ? `${
                        darkMode
                          ? "text-blue-400 border-blue-400 bg-gray-700"
                          : "text-blue-600 border-blue-600 bg-white"
                      }`
                    : `${
                        darkMode
                          ? "text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-700"
                          : "text-gray-600 border-transparent hover:text-gray-800 hover:bg-white"
                      }`
                }`}>
                <span className='mr-2'>{tab.name}</span>
                {!tab.saved && <span className='text-orange-400 mr-2'>•</span>}
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className={`ml-1 p-1 rounded hover:bg-gray-600 ${
                    darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                  }`}>
                  <X size={12} />
                </button>
              </button>
            ))}

            <button
              onClick={createNewTab}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                darkMode
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white"
              }`}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b px-6 py-3`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            {activeTab && (
              <input
                type='text'
                value={activeTab.name}
                onChange={(e) => updateTab({ name: e.target.value })}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder='File name'
              />
            )}
          </div>

          <div className='flex space-x-2'>
            <button
              onClick={runCode}
              disabled={!activeTab}
              className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
              <Play size={16} className='mr-2' />
              Run
            </button>

            <button
              onClick={saveFile}
              disabled={!activeTab}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}>
              <Download size={16} className='mr-2' />
              Save Local
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}>
              <Upload size={16} className='mr-2' />
              Open Local
            </button>
            <input
              ref={fileInputRef}
              type='file'
              onChange={loadFile}
              className='hidden'
              accept='.js,.ts,.py,.html,.css,.json,.md,.txt'
            />
          </div>
        </div>
      </div>

      <div className='flex h-[calc(100vh-144px)]'>
        <div className='flex-1 flex flex-col'>
          <div className={`flex-1 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
            {activeTab ? (
              <MonacoEditor
                value={activeTab.content}
                onChange={(value) => updateTab({ content: value })}
                language={activeTab.language}
                theme={theme}
              />
            ) : (
              <div
                className={`flex items-center justify-center h-full ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                <p>No file open. Create a new tab to start coding!</p>
              </div>
            )}
          </div>

          {activeTab && (
            <div
              className={`${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-400"
                  : "bg-gray-100 border-gray-200 text-gray-600"
              } border-t px-6 py-2 text-sm flex justify-between`}>
              <div className='flex items-center space-x-4'>
                <span>
                  Language:{" "}
                  {languages.find((l) => l.value === activeTab.language)?.label}
                </span>
                <span
                  className={`${
                    activeTab.saved ? "text-green-500" : "text-orange-500"
                  }`}>
                  {activeTab.saved ? "● Saved" : "● Unsaved"}
                </span>
                {activeTab.driveId && (
                  <span className='text-blue-500'>☁ Google Drive</span>
                )}
              </div>
              <span>
                Lines: {activeTab.content.split("\n").length} | Characters:{" "}
                {activeTab.content.length}
              </span>
            </div>
          )}
        </div>

        {showOutput && (
          <div
            className={`w-1/3 border-l ${
              darkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}>
            <div
              className={`${
                darkMode
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-200 text-gray-700"
              } px-4 py-2 border-b ${
                darkMode ? "border-gray-600" : "border-gray-300"
              } flex justify-between items-center`}>
              <span className='font-semibold'>Output Console</span>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setOutput("")}
                  className={`text-sm px-2 py-1 rounded ${
                    darkMode
                      ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-300"
                  }`}>
                  Clear
                </button>
                <button
                  onClick={() => setShowOutput(false)}
                  className={`text-sm ${
                    darkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}>
                  ✕
                </button>
              </div>
            </div>
            <pre
              className={`p-4 font-mono text-sm ${
                darkMode ? "text-gray-300" : "text-gray-700"
              } whitespace-pre-wrap overflow-auto h-full`}>
              {output ||
                'Click "Run" to execute your code...\n\n💡 Tips:\n- JavaScript code will run and show output here\n- Use console.log() to display values\n- Errors will be shown with helpful messages\n- Sign in with Google to save files to Drive!'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeBuddy;
