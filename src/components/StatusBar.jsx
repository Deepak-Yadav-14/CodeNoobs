import React from "react";

const StatusBar = ({ activeTab, languages, darkMode }) => {
  if (!activeTab) return null;

  return (
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
  );
};

export default StatusBar;
