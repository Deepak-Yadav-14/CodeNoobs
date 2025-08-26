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
  );
};

export default TabBar;
