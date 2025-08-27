import React from "react";

const OutputConsole = ({
  output,
  setOutput,
  setShowOutput,
  darkMode,
  width = 33,
  isResizing = false,
  onSubmitInput,
}) => {
  const [inputValue, setInputValue] = React.useState("");
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
      <div className='px-4 py-2 border-t flex items-center space-x-2'>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`flex-1 px-3 py-2 rounded border ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          placeholder='Type input for input() and press Enter or Send'
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmitInput?.(inputValue);
              setInputValue("");
            }
          }}
        />
        <button
          onClick={() => {
            onSubmitInput?.(inputValue);
            setInputValue("");
          }}
          className={`px-3 py-2 rounded ${
            darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
          }`}>
          Send
        </button>
      </div>
    </div>
  );
};

export default OutputConsole;
