import React from "react";
import { Play, Download, Upload, Cloud } from "lucide-react";

const Toolbar = ({
  activeTab,
  updateTab,
  runCode,
  saveFile,
  saveToGoogleDrive,
  fileInputRef,
  loadFile,
  darkMode,
  googleUser,
  languages,
}) => {
  return (
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

          {googleUser && (
            <button
              onClick={saveToGoogleDrive}
              disabled={!activeTab}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}>
              <Cloud size={16} className='mr-2' />
              Save to Drive
            </button>
          )}

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
  );
};

export default Toolbar;
