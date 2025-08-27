import React, { useState, useRef, useEffect } from "react";

const InteractiveConsole = ({
  output,
  setOutput,
  setShowOutput,
  darkMode,
  width = 33,
  isResizing = false,
  onInput = null,
  isWaitingForInput = false,
  inputPrompt = "",
  // Optional external history state (for streaming chunks)
  history: historyProp,
  setHistory: setHistoryProp,
}) => {
  const [inputValue, setInputValue] = useState("");
  // Support controlled (parent-provided) or internal history
  const [internalHistory, setInternalHistory] = useState([]);
  const history = historyProp ?? internalHistory;
  const setHistory = setHistoryProp ?? setInternalHistory;
  const [isInteractive, setIsInteractive] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, history]);

  // Focus input when waiting for input
  useEffect(() => {
    if (isWaitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isWaitingForInput]);

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (onInput && inputValue.trim() !== "") {
      // If this component is uncontrolled (no historyProp), echo the input locally.
      if (!historyProp) {
        const newEntry = {
          type: "input",
          prompt: inputPrompt,
          value: inputValue,
          timestamp: Date.now(),
        };
        setHistory((prev) => [...prev, newEntry]);
      }

      // Call the input handler (parent should forward to pyodide)
      onInput(inputValue);
      setInputValue("");
    }
  };

  const clearConsole = () => {
    setOutput("");
    setHistory([]);
  };

  const formatOutput = () => {
    let formatted = "";

    // Add history entries
    history.forEach((entry) => {
      if (entry.type === "input") {
        // Newer input entries contain only the value (prompt was stored as an
        // earlier 'output' entry). Render the input on its own line.
        if (entry.value !== undefined) {
          formatted += `${entry.value}\n`;
        } else if (entry.prompt !== undefined) {
          // Legacy shape: render prompt+value together
          formatted += `${entry.prompt}${entry.value || ""}\n`;
        }
      } else if (entry.type === "output") {
        formatted += entry.value;
      }
    });

    // If parent provided a history stream, prefer it and skip duplicating the
    // legacy `output` prop (parent already mirrors chunks into history).
    if (!historyProp) {
      // Add current output
      if (output) {
        formatted += output;
      }
    } else if (history.length === 0 && output) {
      // Fallback: if history exists but is empty, show whatever the legacy
      // output prop has (useful while diagnosing streaming issues).
      formatted += output;
    }

    return formatted;
  };

  return (
    <div
      className={`min-w-0 flex flex-col border-l ${
        darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
      } ${isResizing ? "" : "transition-all duration-200"}`}
      style={{ width: `${width}%` }}>
      {/* Header */}
      <div
        className={`${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"
        } px-4 py-2 border-b ${
          darkMode ? "border-gray-600" : "border-gray-300"
        } flex justify-between items-center flex-shrink-0`}>
        <span className='font-semibold'>
          Interactive Console
          {isWaitingForInput && (
            <span className='ml-2 text-sm text-blue-400'>
              (waiting for input...)
            </span>
          )}
        </span>
        <div className='flex items-center space-x-2'>
          <button
            onClick={clearConsole}
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

      {/* Output Area */}
      <div className='flex-1 flex flex-col min-h-0'>
        <pre
          ref={outputRef}
          className={`p-4 font-mono text-sm ${
            darkMode ? "text-gray-300" : "text-gray-700"
          } whitespace-pre-wrap overflow-auto flex-1 min-h-0`}>
          {formatOutput() ||
            'Click "Run" to execute your code...\n\n💡 Interactive Console:\n- Python code with input() will prompt for user input\n- Type your input below when prompted\n- Press Enter to submit input\n- See real-time output as your program runs'}
        </pre>

        {/* Input Area - only show when waiting for input */}
        {isWaitingForInput && (
          <div
            className={`border-t ${
              darkMode
                ? "border-gray-600 bg-gray-750"
                : "border-gray-300 bg-white"
            } p-3`}>
            <form
              onSubmit={handleInputSubmit}
              className='flex items-center space-x-2'>
              <span
                className={`text-sm font-mono ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                &gt;&gt;&gt;
              </span>
              <input
                ref={inputRef}
                type='text'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='Enter your input here...'
                className={`flex-1 px-3 py-2 text-sm font-mono border rounded ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type='submit'
                disabled={!inputValue.trim()}
                className={`px-4 py-2 text-sm rounded ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400"
                    : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
                } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                Submit
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveConsole;
