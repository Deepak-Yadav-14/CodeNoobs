import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Play, Download, Upload, Cloud } from "lucide-react";

const TabToolbar = ({
  tabs,
  activeTabId,
  setActiveTabId,
  closeTab,
  createNewTab,
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
  onRenameTab,
  onDeleteTab,
}) => {
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    tabId: null,
  });
  const [editingTab, setEditingTab] = useState(null);
  const [tempName, setTempName] = useState("");
  const inputRef = useRef(null);

  // Handle context menu
  const handleRightClick = (e, tabId) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      tabId: tabId,
    });
  };

  // Handle double click to rename
  const handleDoubleClick = (tabId, currentName) => {
    setEditingTab(tabId);
    setTempName(currentName);
  };

  // Handle rename submit
  const handleRenameSubmit = () => {
    if (tempName.trim() && editingTab) {
      onRenameTab(editingTab, tempName.trim());
    }
    setEditingTab(null);
    setTempName("");
  };

  // Handle rename cancel
  const handleRenameCancel = () => {
    setEditingTab(null);
    setTempName("");
  };

  // Handle key events for rename input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      handleRenameCancel();
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, tabId: null });
    };

    if (contextMenu.show) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenu.show]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingTab && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTab]);

  return (
    <>
      <div
        className={`${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-100 border-gray-200"
        } border-b`}>
        {/* Single row with tabs on the left and toolbar buttons on the right */}
        <div className='flex items-center justify-between px-6 py-2'>
          {/* Left side - Tabs */}
          <div className='flex items-center space-x-1 flex-1 overflow-x-auto mr-4'>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap relative group ${
                  tab.id === activeTabId
                    ? `${
                        darkMode
                          ? "text-blue-400 bg-gray-700 border-b-2 border-blue-400"
                          : "text-blue-600 bg-white border-b-2 border-blue-600"
                      }`
                    : `${
                        darkMode
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                          : "text-gray-600 hover:text-gray-800 hover:bg-white"
                      }`
                }`}
                onContextMenu={(e) => handleRightClick(e, tab.id)}
                onDoubleClick={() => handleDoubleClick(tab.id, tab.name)}
                onClick={() => setActiveTabId(tab.id)}
                title='Double-click to rename'>
                {editingTab === tab.id ? (
                  <input
                    ref={inputRef}
                    type='text'
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleKeyDown}
                    className={`bg-transparent border-none outline-none mr-2 ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                    style={{ width: `${Math.max(tempName.length * 8, 60)}px` }}
                  />
                ) : (
                  <span className='mr-2'>{tab.name}</span>
                )}

                {!tab.saved && <span className='text-orange-400 mr-2'>•</span>}

                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className={`ml-1 p-1 rounded hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ${
                    darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                  }`}>
                  <X size={10} />
                </button>
              </div>
            ))}

            <button
              onClick={createNewTab}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors rounded ${
                darkMode
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white"
              }`}>
              <Plus size={14} />
            </button>
          </div>

          {/* Right side - Toolbar buttons */}
          <div className='flex items-center space-x-2'>
            <button
              onClick={runCode}
              disabled={!activeTab}
              className='flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm'>
              <Play size={14} className='mr-1' />
              Run
            </button>

            <button
              onClick={saveFile}
              disabled={!activeTab}
              className={`flex items-center px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}>
              <Download size={14} className='mr-1' />
              Save
            </button>

            {googleUser && (
              <button
                onClick={saveToGoogleDrive}
                disabled={!activeTab}
                className={`flex items-center px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                  darkMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}>
                <Cloud size={14} className='mr-1' />
                Drive
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center px-3 py-1.5 rounded border transition-colors text-sm ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}>
              <Upload size={14} className='mr-1' />
              Open
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

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className={`fixed z-50 ${
            darkMode
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-gray-200"
          } border rounded-sm shadow-lg py-1 min-w-[150px]`}
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}>
          <button
            onClick={() => {
              handleDoubleClick(
                contextMenu.tabId,
                tabs.find((t) => t.id === contextMenu.tabId)?.name || ""
              );
              setContextMenu({ show: false, x: 0, y: 0, tabId: null });
            }}
            className={`w-full text-left px-4 py-1 text-sm transition-colors border-b border-b-gray-700 ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}>
            Rename
          </button>
          <button
            onClick={() => {
              onDeleteTab(contextMenu.tabId);
              setContextMenu({ show: false, x: 0, y: 0, tabId: null });
            }}
            className={`w-full text-left px-4 py-1 text-sm transition-colors ${
              darkMode
                ? "text-red-400 hover:bg-gray-700"
                : "text-red-600 hover:bg-gray-100"
            }`}>
            Delete
          </button>
        </div>
      )}
    </>
  );
};

export default TabToolbar;
