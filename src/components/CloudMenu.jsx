import React from "react";
import { Cloud, Download, LogOut } from "lucide-react";

const CloudMenu = ({
  showCloudMenu,
  setShowCloudMenu,
  saveToGoogleDrive,
  loadFromGoogleDrive,
  signOutFromGoogle,
  darkMode,
}) => {
  return (
    showCloudMenu && (
      <div
        className={`absolute top-12 right-0 ${
          darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
        } border rounded-lg shadow-lg p-2 z-50 min-w-48`}>
        <button
          onClick={() => {
            saveToGoogleDrive();
            setShowCloudMenu(false);
          }}
          className={`w-full text-left px-3 py-2 rounded ${
            darkMode
              ? "hover:bg-gray-600 text-gray-200"
              : "hover:bg-gray-100 text-gray-700"
          } transition-colors flex items-center`}>
          <Cloud size={16} className='mr-2' />
          Save to Drive
        </button>
        <button
          onClick={() => {
            loadFromGoogleDrive();
            setShowCloudMenu(false);
          }}
          className={`w-full text-left px-3 py-2 rounded ${
            darkMode
              ? "hover:bg-gray-600 text-gray-200"
              : "hover:bg-gray-100 text-gray-700"
          } transition-colors flex items-center`}>
          <Download size={16} className='mr-2' />
          Load from Drive
        </button>
        <hr
          className={`my-2 ${darkMode ? "border-gray-600" : "border-gray-200"}`}
        />
        <button
          onClick={() => {
            signOutFromGoogle();
            setShowCloudMenu(false);
          }}
          className={`w-full text-left px-3 py-2 rounded ${
            darkMode
              ? "hover:bg-gray-600 text-red-400"
              : "hover:bg-gray-100 text-red-600"
          } transition-colors flex items-center`}>
          <LogOut size={16} className='mr-2' />
          Sign Out
        </button>
      </div>
    )
  );
};

export default CloudMenu;
