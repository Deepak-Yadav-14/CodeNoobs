import React, { useState, useRef, useEffect } from "react";
import { Play, Square, Copy, Trash2 } from "lucide-react";

const SplitConsole = ({
  output,
  setOutput,
  darkMode,
  width = 33,
  isResizing = false,
  onExecuteWithInput,
  isExecuting = false,
  language = "c",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [executionHistory, setExecutionHistory] = useState([]);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, executionHistory]);

  const handleExecute = () => {
    if (isExecuting || !onExecuteWithInput) return;

    // Add to execution history
    const newExecution = {
      id: Date.now(),
      input: inputValue,
      timestamp: new Date().toLocaleTimeString(),
      status: "running",
    };

    setExecutionHistory((prev) => [...prev, newExecution]);

    // Call the execution function with input
    onExecuteWithInput(inputValue);
  };

  const handleStop = () => {
    // TODO: Implement stop execution if needed
    console.log("Stop execution requested");
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setOutput("");
    setInputValue("");
    setExecutionHistory([]);
  };

  const clearOutput = () => {
    setOutput("");
  };

  const formatInputPlaceholder = () => {
    switch (language) {
      case "c":
        return "Input for scanf, getchar...";
      case "cpp":
        return "Input for cin, getline...";
      default:
        return "Program input...";
    }
  };

  return (
    <div
      className={`flex flex-col ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } border-l ${
        darkMode ? "border-gray-700" : "border-gray-300"
      } h-full overflow-hidden`}
      style={{ width: `${width}%` }}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-3 border-b ${
          darkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-300 bg-gray-50"
        }`}>
        <div className='flex items-center space-x-2'>
          <span className='font-medium text-sm'>Console</span>
          {isExecuting && (
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
          )}
        </div>

        <div className='flex items-center space-x-1'>
          <button
            onClick={copyOutput}
            disabled={!output.trim()}
            className={`p-1 rounded hover:bg-opacity-80 disabled:opacity-50 ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            title='Copy'>
            <Copy size={12} />
          </button>
          <button
            onClick={clearAll}
            className={`p-1 rounded hover:bg-opacity-80 ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            title='Clear'>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className='flex-shrink-0 p-2 border-b border-gray-600'>
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={formatInputPlaceholder()}
          className={`w-full h-16 p-2 rounded border text-sm font-mono resize-none ${
            darkMode
              ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          disabled={isExecuting}
        />

        <div className='flex justify-end mt-2'>
          {isExecuting ? (
            <button
              onClick={handleStop}
              className='flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs'
              disabled={!isExecuting}>
              <Square size={10} className='mr-1' />
              Stop
            </button>
          ) : (
            <button
              onClick={handleExecute}
              className='flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs'
              disabled={isExecuting}>
              <Play size={10} className='mr-1' />
              Run
            </button>
          )}
        </div>
      </div>

      {/* Output Section */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <div
          ref={outputRef}
          className={`flex-1 p-2 overflow-y-auto font-mono text-sm whitespace-pre-wrap ${
            darkMode ? "bg-gray-900" : "bg-gray-50"
          }`}>
          {output || (
            <div className='text-gray-500 italic text-xs'>
              Output will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitConsole;
