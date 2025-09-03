import React from "react";
import { Plus, X } from "lucide-react";

const TabBar = ({
  tabs,
  activeTabId,
  setActiveTabId,
  closeTab,
  createNewTab,
  darkMode,
}) => {
  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"
      } border-b`}>
      <div className='flex items-center px-6'>
        <div className='flex items-center flex-1 min-w-0'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors min-w-0 ${
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
              }`}
              style={{
                maxWidth:
                  tabs.length > 6
                    ? "120px"
                    : tabs.length > 4
                    ? "150px"
                    : "200px",
              }}>
              <span className='mr-2 truncate'>{tab.name}</span>
              {!tab.saved && <span className='text-orange-400 mr-1'>•</span>}
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className={`ml-1 p-1 rounded hover:bg-gray-600 flex-shrink-0 ${
                  darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                }`}>
                <X size={10} />
              </button>
            </button>
          ))}

          <button
            onClick={createNewTab}
            className={`flex items-center px-3 py-2 text-sm font-medium transition-colors flex-shrink-0 ${
              darkMode
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-800 hover:bg-white"
            }`}>
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabBar;
