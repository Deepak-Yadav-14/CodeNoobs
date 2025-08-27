import React, { useState, useMemo } from "react";
import {
  File,
  Folder,
  FolderOpen,
  Trash2,
  Download,
  Calendar,
  Search,
  X,
  FileText,
  Code,
  Image,
  Archive,
} from "lucide-react";

const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "html",
      "css",
    ].includes(ext)
  ) {
    return Code;
  } else if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) {
    return Image;
  } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return Archive;
  } else if (["txt", "md", "doc", "docx", "pdf"].includes(ext)) {
    return FileText;
  }
  return File;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const FilePickerModal = ({
  showFilePicker,
  setShowFilePicker,
  driveFiles,
  onFileSelect,
  onFileDelete,
  darkMode,
}) => {
  const [loadingFileId, setLoadingFileId] = useState(null);
  const [expandedNames, setExpandedNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  const grouped = useMemo(() => {
    const map = {};
    (driveFiles || []).forEach((f) => {
      if (!map[f.name]) map[f.name] = [];
      map[f.name].push(f);
    });
    return map;
  }, [driveFiles]);

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return grouped;

    const filtered = {};
    Object.entries(grouped).forEach(([name, files]) => {
      if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered[name] = files;
      }
    });
    return filtered;
  }, [grouped, searchTerm]);

  if (!showFilePicker) return null;

  const handleOpen = (file) => {
    try {
      const p = onFileSelect(file.id, file.name);
      if (p && typeof p.then === "function") {
        setLoadingFileId(file.id);
        p.finally(() => setLoadingFileId(null));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleDelete = async (file) => {
    if (
      !confirm(
        `Delete "${file.name}" from Google Drive? This cannot be undone.`
      )
    )
      return;
    try {
      setLoadingFileId(file.id);
      await onFileDelete(file.id);
    } finally {
      setLoadingFileId(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
        <div
          className={`rounded-2xl ${
            darkMode
              ? "bg-gray-900/95 text-gray-100"
              : "bg-white/95 text-gray-900"
          } backdrop-blur-md border ${
            darkMode ? "border-gray-700/50" : "border-gray-200/50"
          } shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden mx-4`}>
          {/* Header */}
          <div
            className={`px-6 py-4 border-b ${
              darkMode ? "border-gray-700/50" : "border-gray-200/50"
            } flex items-center justify-between`}>
            <div>
              <h3 className='text-xl font-semibold mb-1'>Google Drive Files</h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                {Object.keys(filteredFiles).length} file(s) found
              </p>
            </div>
            <button
              onClick={() => setShowFilePicker(false)}
              className={`p-2 rounded-lg ${
                darkMode
                  ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
              } transition-colors`}>
              <X size={20} />
            </button>
          </div>

          {/* Search and Controls */}
          <div
            className={`px-6 py-4 border-b ${
              darkMode ? "border-gray-700/50" : "border-gray-200/50"
            } flex items-center gap-4`}>
            <div className='flex-1 relative'>
              <Search
                size={16}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type='text'
                placeholder='Search files...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-800 text-gray-400 hover:text-gray-200"
                    : "bg-gray-100 text-gray-600 hover:text-gray-800"
                } transition-colors`}>
                <FileText size={16} />
              </button>
            </div>
          </div>

          {/* File List */}
          <div className='p-6 max-h-96 overflow-y-auto'>
            {Object.keys(filteredFiles).length === 0 && !searchTerm && (
              <div className='text-center py-12'>
                <Folder
                  size={48}
                  className={`mx-auto mb-4 ${
                    darkMode ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-lg font-medium mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                  No files found
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                  Save some files to Google Drive to see them here!
                </p>
              </div>
            )}

            {Object.keys(filteredFiles).length === 0 && searchTerm && (
              <div className='text-center py-12'>
                <Search
                  size={48}
                  className={`mx-auto mb-4 ${
                    darkMode ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-lg font-medium mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                  No results found
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                  Try searching with different keywords
                </p>
              </div>
            )}

            <div className='space-y-2'>
              {Object.entries(filteredFiles).map(([name, files]) => {
                const IconComponent = getFileIcon(name);
                const hasMultipleVersions = files.length > 1;
                const latestFile = files[0]; // Assuming files are sorted by date

                return (
                  <div
                    key={name}
                    className={`border rounded-xl p-4 ${
                      darkMode
                        ? "border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50"
                        : "border-gray-200/50 bg-gray-50/30 hover:bg-gray-50/60"
                    } transition-all duration-200`}>
                    {hasMultipleVersions ? (
                      <div>
                        {/* File group header */}
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3 flex-1'>
                            <div
                              className={`p-2 rounded-lg ${
                                darkMode ? "bg-blue-500/20" : "bg-blue-100"
                              }`}>
                              <Folder
                                size={20}
                                className={`${
                                  darkMode ? "text-blue-400" : "text-blue-600"
                                }`}
                              />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2'>
                                <h4 className='font-medium'>{name}</h4>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    darkMode
                                      ? "bg-gray-700 text-gray-300"
                                      : "bg-gray-200 text-gray-600"
                                  }`}>
                                  {files.length} versions
                                </span>
                              </div>
                              <p
                                className={`text-sm ${
                                  darkMode ? "text-gray-400" : "text-gray-600"
                                }`}>
                                Latest:{" "}
                                {formatDate(
                                  latestFile.modifiedTime ||
                                    latestFile.createdTime
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setExpandedNames((s) => ({
                                ...s,
                                [name]: !s[name],
                              }))
                            }
                            className={`px-3 py-1 text-sm rounded-lg ${
                              darkMode
                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            } transition-colors`}>
                            {expandedNames[name] ? (
                              <>
                                <FolderOpen size={14} className='inline mr-1' />
                                Hide
                              </>
                            ) : (
                              <>
                                <Folder size={14} className='inline mr-1' />
                                Show
                              </>
                            )}
                          </button>
                        </div>

                        {/* Expanded file versions */}
                        {expandedNames[name] && (
                          <div className='mt-4 space-y-2 pl-4 border-l-2 border-gray-300/30'>
                            {files.map((file) => (
                              <div
                                key={file.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  darkMode
                                    ? "bg-gray-800/50 hover:bg-gray-700/50"
                                    : "bg-white/50 hover:bg-white/80"
                                } transition-colors`}>
                                <div className='flex items-center space-x-3 flex-1'>
                                  <IconComponent
                                    size={16}
                                    className={`${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  />
                                  <div className='flex-1'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-sm font-medium'>
                                        {file.name}
                                      </span>
                                      <span
                                        className={`text-xs ${
                                          darkMode
                                            ? "text-gray-500"
                                            : "text-gray-400"
                                        }`}>
                                        {file.id.slice(0, 8)}...
                                      </span>
                                    </div>
                                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                                      <span className='flex items-center gap-1'>
                                        <Calendar size={12} />
                                        {formatDate(
                                          file.modifiedTime || file.createdTime
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <button
                                    onClick={() => handleOpen(file)}
                                    disabled={loadingFileId === file.id}
                                    className={`px-3 py-1.5 text-sm rounded-lg ${
                                      darkMode
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                    } transition-colors disabled:opacity-50 flex items-center gap-1`}>
                                    {loadingFileId === file.id ? (
                                      "Loading..."
                                    ) : (
                                      <>
                                        <Download size={12} />
                                        Open
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(file)}
                                    className={`p-1.5 text-sm rounded-lg ${
                                      darkMode
                                        ? "text-red-400 hover:bg-red-500/20"
                                        : "text-red-600 hover:bg-red-50"
                                    } transition-colors`}>
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Single file */
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3 flex-1'>
                          <div
                            className={`p-2 rounded-lg ${
                              darkMode ? "bg-green-500/20" : "bg-green-100"
                            }`}>
                            <IconComponent
                              size={20}
                              className={`${
                                darkMode ? "text-green-400" : "text-green-600"
                              }`}
                            />
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-medium'>{files[0].name}</h4>
                            <div className='flex items-center gap-4 text-sm text-gray-500'>
                              <span className='flex items-center gap-1'>
                                <Calendar size={12} />
                                {formatDate(
                                  files[0].modifiedTime || files[0].createdTime
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleOpen(files[0])}
                            disabled={loadingFileId === files[0].id}
                            className={`px-4 py-2 text-sm rounded-lg ${
                              darkMode
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            } transition-colors disabled:opacity-50 flex items-center gap-1`}>
                            {loadingFileId === files[0].id ? (
                              "Loading..."
                            ) : (
                              <>
                                <Download size={14} />
                                Open
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(files[0])}
                            className={`p-2 text-sm rounded-lg ${
                              darkMode
                                ? "text-red-400 hover:bg-red-500/20"
                                : "text-red-600 hover:bg-red-50"
                            } transition-colors`}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`px-6 py-4 border-t ${
              darkMode ? "border-gray-700/50" : "border-gray-200/50"
            } flex justify-between items-center`}>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
              Select a file to open it in the editor
            </p>
            <button
              onClick={() => setShowFilePicker(false)}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              } transition-colors`}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilePickerModal;
