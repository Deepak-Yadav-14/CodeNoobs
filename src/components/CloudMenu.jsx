import React from "react";
import { Cloud, Download, LogOut, Save, FolderOpen } from "lucide-react";

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
      <>
        {/* Backdrop with blur effect */}
        <div
          className='fixed inset-0 backdrop-blur-sm bg-black/20 z-40'
          onClick={() => setShowCloudMenu(false)}
        />

        {/* Enhanced CloudMenu */}
        <div className='absolute top-12 right-0 z-50'>
          <div
            className={`relative ${
              darkMode
                ? "bg-gray-800/95 border-gray-600/50"
                : "bg-white/95 border-gray-200/50"
            } border backdrop-blur-md rounded-xl shadow-2xl p-1 min-w-72 max-w-sm`}>
            {/* Header */}
            <div
              className={`px-4 py-3 border-b ${
                darkMode ? "border-gray-600/30" : "border-gray-200/30"
              }`}>
              <h3
                className={`font-semibold text-sm ${
                  darkMode ? "text-gray-100" : "text-gray-800"
                }`}>
                Google Drive
              </h3>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                Manage your cloud files
              </p>
            </div>

            {/* Menu Items */}
            <div className='p-2 space-y-1'>
              <button
                onClick={() => {
                  saveToGoogleDrive();
                  setShowCloudMenu(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  darkMode
                    ? "hover:bg-gray-700/70 text-gray-200 hover:text-white"
                    : "hover:bg-blue-50 text-gray-700 hover:text-gray-900"
                } transition-all duration-200 flex items-center group`}>
                <div
                  className={`p-2 rounded-lg mr-3 ${
                    darkMode
                      ? "bg-blue-500/20 group-hover:bg-blue-500/30"
                      : "bg-blue-100 group-hover:bg-blue-200"
                  }`}>
                  <Save
                    size={16}
                    className={`${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-sm'>Save to Drive</div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                    Upload current file to cloud
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  loadFromGoogleDrive();
                  setShowCloudMenu(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  darkMode
                    ? "hover:bg-gray-700/70 text-gray-200 hover:text-white"
                    : "hover:bg-green-50 text-gray-700 hover:text-gray-900"
                } transition-all duration-200 flex items-center group`}>
                <div
                  className={`p-2 rounded-lg mr-3 ${
                    darkMode
                      ? "bg-green-500/20 group-hover:bg-green-500/30"
                      : "bg-green-100 group-hover:bg-green-200"
                  }`}>
                  <FolderOpen
                    size={16}
                    className={`${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  />
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-sm'>Browse Files</div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                    Open file manager
                  </div>
                </div>
              </button>
            </div>

            {/* Divider */}
            <hr
              className={`my-2 mx-4 ${
                darkMode ? "border-gray-600/30" : "border-gray-200/30"
              }`}
            />

            {/* Sign Out */}
            <div className='p-2'>
              <button
                onClick={() => {
                  signOutFromGoogle();
                  setShowCloudMenu(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  darkMode
                    ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                    : "hover:bg-red-50 text-red-600 hover:text-red-700"
                } transition-all duration-200 flex items-center group`}>
                <div
                  className={`p-2 rounded-lg mr-3 ${
                    darkMode
                      ? "bg-red-500/20 group-hover:bg-red-500/30"
                      : "bg-red-100 group-hover:bg-red-200"
                  }`}>
                  <LogOut
                    size={16}
                    className={`${darkMode ? "text-red-400" : "text-red-600"}`}
                  />
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-sm'>Sign Out</div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                    Disconnect from Google Drive
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default CloudMenu;
