import React, { useState, useMemo } from "react";

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

  const grouped = useMemo(() => {
    const map = {};
    (driveFiles || []).forEach((f) => {
      if (!map[f.name]) map[f.name] = [];
      map[f.name].push(f);
    });
    return map;
  }, [driveFiles]);

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
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div
        className={`rounded-lg p-6 ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        } max-w-md w-full`}>
        <h3 className='text-lg font-semibold mb-4'>
          Select File from Google Drive
        </h3>
        <ul className='max-h-64 overflow-y-auto space-y-2'>
          {Object.keys(grouped).length === 0 && (
            <p className='text-gray-500'>No files found. Save some first!</p>
          )}

          {Object.entries(grouped).map(([name, files]) => (
            <li key={name} className='border-b pb-2'>
              {files.length > 1 ? (
                <div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <strong>{name}</strong>
                      <span className='text-sm text-gray-400'>
                        ({files.length})
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() =>
                          setExpandedNames((s) => ({ ...s, [name]: !s[name] }))
                        }
                        className='px-2 py-1 text-sm rounded bg-gray-200/60'>
                        {expandedNames[name] ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {expandedNames[name] && (
                    <ul className='mt-2 space-y-1'>
                      {files.map((file) => (
                        <li
                          key={file.id}
                          className='flex items-center justify-between'>
                          <button
                            onClick={() => handleOpen(file)}
                            className={`text-left px-3 py-1 rounded flex-1 text-sm ${
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100"
                            } transition-colors`}>
                            {loadingFileId === file.id
                              ? "Loading..."
                              : `${file.name} — ${file.id.slice(0, 8)}`}
                          </button>
                          <button
                            onClick={() => handleDelete(file)}
                            className='ml-2 text-sm text-red-600'>
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className='flex items-center justify-between'>
                  <button
                    onClick={() => handleOpen(files[0])}
                    className={`w-full text-left px-3 py-2 rounded ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    } transition-colors`}>
                    {loadingFileId === files[0].id
                      ? "Loading..."
                      : files[0].name}
                  </button>
                  <button
                    onClick={() => handleDelete(files[0])}
                    className='ml-2 text-sm text-red-600'>
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className='mt-4 flex justify-end'>
          <button
            onClick={() => setShowFilePicker(false)}
            className={`px-4 py-2 rounded ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePickerModal;
