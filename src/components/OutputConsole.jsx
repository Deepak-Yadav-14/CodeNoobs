import React from "react";

const OutputConsole = ({
  output,
  setOutput,
  setShowOutput,
  darkMode,
  width = 33,
  isResizing = false,
}) => {
  return (
    <div
      className={`min-w-0 flex flex-col border-l ${
        darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
      } ${isResizing ? "" : "transition-all duration-200"}`}
      style={{ width: `${width}%` }}>
      <div
        className={`${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"
        } px-4 py-2 border-b ${
          darkMode ? "border-gray-600" : "border-gray-300"
        } flex justify-between items-center flex-shrink-0`}>
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
        } whitespace-pre-wrap overflow-auto flex-1 min-h-0`}>
        {output ||
          'Click "Run" to execute your code...\n\n💡 Tips:\n- JavaScript code will run and show output here\n- Use console.log() to display values\n- Errors will be shown with helpful messages\n- Sign in with Google to save files to Drive!'}
      </pre>
    </div>
  );
};

export default OutputConsole;
