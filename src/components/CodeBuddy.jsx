import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { FileText, Moon, Sun, User } from "lucide-react";
import { runPython, executeInteractive } from "../wasm/pyodideClient";
import { runCppLocal } from "../wasm/cppClient";
import TabToolbar from "./TabToolbar";
import OutputConsole from "./OutputConsole";
import InteractiveConsole from "./InteractiveConsole";
import StatusBar from "./StatusBar";
import CloudMenu from "./CloudMenu";
import FilePickerModal from "./FilePickerModal";
import { languages } from "../constants/languages";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_API_KEY,
  DISCOVERY_DOC,
  SCOPES,
} from "../constants/googleConfig";
import logo from "../assets/CodeNoobs.png";

const CodeBuddy = () => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      name: "welcome.js",
      language: "javascript",
      content:
        '// Welcome to CodeBuddy! 🚀\n// A beginner-friendly code editor with Monaco-style experience\n// Now with C/C++ support and Google Drive integration!\n\nfunction greetUser(name) {\n  console.log(`Hello, ${name}! Welcome to CodeBuddy!`);\n  return `Happy coding, ${name}!`;\n}\n\n// Try running this code\nconst message = greetUser("Developer");\nconsole.log(message);\n\n// Try creating C/C++ files using the + dropdown!\n// Sign in with Google to save to Drive!',
      saved: true,
    },
    {
      id: 2,
      name: "input_example.c",
      language: "c",
      content: `#include <stdio.h>

int main() {
    printf("Hello, World from C!\\n");
    
    // Variables for user input
    int num1, num2;
    
    printf("Enter first number: ");
    scanf("%d", &num1);
    
    printf("Enter second number: ");
    scanf("%d", &num2);
    
    int sum = num1 + num2;
    printf("Sum of %d and %d is: %d\\n", num1, num2, sum);
    
    return 0;
}`,
      saved: true,
    },
    {
      id: 3,
      name: "input_example.cpp",
      language: "cpp",
      content: `#include <iostream>
#include <string>

using namespace std;

int main() {
    cout << "Hello, World from C++!" << endl;
    
    // Variables for user input
    string name;
    int age;
    
    cout << "Enter your name: ";
    cin >> name;
    
    cout << "Enter your age: ";
    cin >> age;
    
    cout << "Hello " << name << ", you are " << age << " years old!" << endl;
    
    // Basic calculations
    int num1 = 15;
    int num2 = 25;
    cout << "Sum: " << (num1 + num2) << endl;
    
    return 0;
}`,
      saved: true,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [output, setOutput] = useState("");
  // Streaming console history for incremental rendering (output/input interleaved)
  const [consoleHistory, setConsoleHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const [nextTabId, setNextTabId] = useState(4);
  const [googleUser, setGoogleUser] = useState(null);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [showCloudMenu, setShowCloudMenu] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [driveFiles, setDriveFiles] = useState([]);
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [consoleWidth, setConsoleWidth] = useState(33); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [errors, setErrors] = useState([]);

  // Interactive console state
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [interactiveRunning, setInteractiveRunning] = useState(false);
  const interactiveRespondRef = useRef(null);

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const theme = darkMode ? "vs-dark" : "vs";
  // Map our language values to Monaco language identifiers where necessary
  const monacoLangMap = { c: "c", cpp: "cpp" };
  const monacoLanguage = activeTab
    ? monacoLangMap[activeTab.language] || activeTab.language
    : "javascript";

  // Update error markers when errors change
  useEffect(() => {
    if (editorRef.current && window.monaco && errors.length >= 0) {
      const markers = errors.map((error) => ({
        startLineNumber: error.line,
        startColumn: error.column || 1,
        endLineNumber: error.line,
        endColumn: error.endColumn || 1000,
        message: error.message,
        severity: window.monaco.MarkerSeverity.Error,
      }));

      window.monaco.editor.setModelMarkers(
        editorRef.current.getModel(),
        "owner",
        markers
      );
    }
  }, [errors]);

  // Google Drive Initialization (using new Google Identity Services)
  useEffect(() => {
    // Load Google API client
    const scriptGapi = document.createElement("script");
    scriptGapi.src = "https://apis.google.com/js/api.js";
    scriptGapi.async = true;
    scriptGapi.defer = true;
    // Load Google Identity Services
    const scriptGis = document.createElement("script");
    scriptGis.src = "https://accounts.google.com/gsi/client";
    scriptGis.async = true;
    scriptGis.defer = true;
    scriptGapi.onload = () => {
      window.gapi.load("client", initClient);
    };
    document.body.append(scriptGis, scriptGapi);
    return () => {
      document.body.removeChild(scriptGis);
      document.body.removeChild(scriptGapi);
    };
  }, []);

  // Initialize Google API client and OAuth token client
  const initClient = async () => {
    try {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            console.error("Token error:", tokenResponse);
            return;
          }
          // Set token for gapi client
          window.gapi.client.setToken({
            access_token: tokenResponse.access_token,
          });

          // Save token and expiry to localStorage so sign-in persists across reloads
          try {
            const expiresIn = tokenResponse.expires_in
              ? tokenResponse.expires_in * 1000
              : 3600 * 1000; // fallback 1h
            const payload = {
              access_token: tokenResponse.access_token,
              expires_at: Date.now() + expiresIn,
            };
            localStorage.setItem("google_token", JSON.stringify(payload));
          } catch (e) {
            // ignore storage errors
          }

          setAccessToken(tokenResponse.access_token);
          fetchUserInfo();
        },
      });
      setTokenClient(client);
      setIsGoogleReady(true);

      // Try to restore token from localStorage (so sign-in persists across reloads)
      try {
        const stored = localStorage.getItem("google_token");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.access_token && parsed.expires_at > Date.now()) {
            // Restore token into gapi and state
            window.gapi.client.setToken({ access_token: parsed.access_token });
            setAccessToken(parsed.access_token);
            // Fetch user profile to restore googleUser/UI state
            fetchUserInfo();
          } else {
            // expired or malformed
            localStorage.removeItem("google_token");
          }
        }
      } catch (e) {
        // ignore JSON parse / storage errors
      }
    } catch (err) {
      console.error("Error initializing GAPI client:", err);
    }
  };

  // Fetch Google user profile
  const fetchUserInfo = async () => {
    try {
      const response = await window.gapi.client.request({
        path: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      const profile = response.result;
      setGoogleUser({
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      });
      setOutput("✅ Google sign-in successful!");
      setShowOutput(true);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  // Sign in (request access token)
  const signInWithGoogle = () => {
    if (!tokenClient) return;
    tokenClient.requestAccessToken({ prompt: "consent" });
  };

  // Sign out (revoke token)
  const signOutFromGoogle = () => {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        setAccessToken(null);
        setGoogleUser(null);
        try {
          localStorage.removeItem("google_token");
        } catch (e) {
          // ignore
        }
        setOutput("👋 Signed out from Google successfully.");
        setShowOutput(true);
      });
    }
  };

  const saveToGoogleDrive = async () => {
    if (!googleUser || !activeTab) {
      setOutput("❌ Please sign in with Google and select a tab first.");
      setShowOutput(true);
      return;
    }

    try {
      // Ensure we have an access token
      if (!accessToken) {
        tokenClient?.requestAccessToken({ prompt: "consent" });
        setOutput(
          "Requesting Google Drive permission... please retry saving after granting access."
        );
        setShowOutput(true);
        return;
      }
      const currentLang = languages.find((l) => l.value === activeTab.language);
      const fileName = activeTab.name.includes(".")
        ? activeTab.name
        : `${activeTab.name}${currentLang.ext}`;

      // Use multipart upload via REST to reliably send content
      // Ensure files are stored inside a dedicated CodeBuddy folder
      const CODEBUDDY_FOLDER_KEY = "codebuddy_folder_id";

      const getOrCreateCodeBuddyFolder = async () => {
        if (!accessToken) return null;
        try {
          // Check cached folder id
          const cached = localStorage.getItem(CODEBUDDY_FOLDER_KEY);
          if (cached) {
            // verify it exists and is a folder
            const vf = await fetch(
              `https://www.googleapis.com/drive/v3/files/${cached}?fields=id,name,mimeType,trashed`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (vf.ok) {
              const vdata = await vf.json();
              if (
                vdata.mimeType === "application/vnd.google-apps.folder" &&
                !vdata.trashed
              ) {
                return vdata.id;
              }
            }
            // invalid cached id -> remove
            localStorage.removeItem(CODEBUDDY_FOLDER_KEY);
          }

          // Try to find existing folder named 'CodeBuddy'
          const q = encodeURIComponent(
            "name = 'CodeBuddy' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
          );
          const listUrl = `https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name)&q=${q}`;
          const res = await fetch(listUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            const d = await res.json();
            if (d.files && d.files.length > 0) {
              const id = d.files[0].id;
              localStorage.setItem(CODEBUDDY_FOLDER_KEY, id);
              return id;
            }
          }

          // Create folder
          const createRes = await fetch(
            "https://www.googleapis.com/drive/v3/files",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: "CodeBuddy",
                mimeType: "application/vnd.google-apps.folder",
              }),
            }
          );
          if (!createRes.ok) {
            const txt = await createRes.text();
            throw new Error(
              `Failed to create folder: ${createRes.status} ${txt}`
            );
          }
          const folder = await createRes.json();
          localStorage.setItem(CODEBUDDY_FOLDER_KEY, folder.id);
          return folder.id;
        } catch (err) {
          console.error("Error getting/creating CodeBuddy folder:", err);
          return null;
        }
      };

      const folderId = await getOrCreateCodeBuddyFolder();

      const metadata = {
        name: fileName,
        mimeType: "text/plain",
        ...(folderId ? { parents: [folderId] } : {}),
      };
      const boundary = "-------314159265358979323846";
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: text/plain\r\n\r\n" +
        activeTab.content +
        close_delim;

      const uploadRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Drive upload failed: ${uploadRes.status} ${errText}`);
      }

      const response = await uploadRes.json();

      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId
            ? { ...tab, saved: true, driveId: response.id }
            : tab
        )
      );

      setOutput(
        `✅ File "${fileName}" saved to Google Drive successfully!\n📁 File ID: ${response.id}\n🔗 View: ${response.webViewLink}`
      );
      setShowOutput(true);
    } catch (error) {
      setOutput(
        `❌ Failed to save to Google Drive: ${
          error.message || error.result?.error?.message
        }`
      );
      setShowOutput(true);
    }
  };

  const loadFromGoogleDrive = async () => {
    if (!googleUser) {
      setOutput("❌ Please sign in with Google first to load from Drive.");
      setShowOutput(true);
      return;
    }

    try {
      // If we don't have an access token yet, request it; the token callback triggers file load.
      if (!accessToken) {
        tokenClient?.requestAccessToken({ prompt: "consent" });
        return;
      }

      // List only files inside the CodeBuddy folder (create the folder if needed)
      const CODEBUDDY_FOLDER_KEY = "codebuddy_folder_id";
      const getCachedFolder = () => {
        try {
          return localStorage.getItem(CODEBUDDY_FOLDER_KEY);
        } catch (e) {
          return null;
        }
      };

      let folderId = getCachedFolder();
      if (!folderId) {
        // attempt to find or create folder via the same logic used on save
        const qf = encodeURIComponent(
          "name = 'CodeBuddy' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
        );
        const listFolderUrl = `https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name)&q=${qf}`;
        const folderRes = await fetch(listFolderUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (folderRes.ok) {
          const fd = await folderRes.json();
          if (fd.files && fd.files.length > 0) {
            folderId = fd.files[0].id;
            try {
              localStorage.setItem(CODEBUDDY_FOLDER_KEY, folderId);
            } catch (e) {}
          } else {
            // create folder
            const createRes = await fetch(
              "https://www.googleapis.com/drive/v3/files",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: "CodeBuddy",
                  mimeType: "application/vnd.google-apps.folder",
                }),
              }
            );
            if (createRes.ok) {
              const folder = await createRes.json();
              folderId = folder.id;
              try {
                localStorage.setItem(CODEBUDDY_FOLDER_KEY, folderId);
              } catch (e) {}
            }
          }
        }
      }

      const q = folderId
        ? encodeURIComponent(
            `trashed = false and mimeType = 'text/plain' and '${folderId}' in parents`
          )
        : encodeURIComponent("trashed = false and mimeType = 'text/plain'");
      const listUrl = `https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType)&q=${q}`;
      const res = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Drive list failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      setDriveFiles(data.files || []);
      setShowFilePicker(true);
      return data.files || [];
    } catch (error) {
      setOutput(
        `❌ Failed to list files from Google Drive: ${
          error.message || error.result?.error?.message
        }`
      );
      setShowOutput(true);
    }
  };

  // Delete a file from Google Drive by ID
  const handleDeleteDriveFile = async (fileId) => {
    if (!accessToken) {
      setOutput("❌ No access token. Please sign in again.");
      setShowOutput(true);
      return;
    }

    try {
      const del = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (del.status !== 204 && !del.ok) {
        const t = await del.text();
        throw new Error(`Delete failed: ${del.status} ${t}`);
      }

      // Refresh file list
      const q = encodeURIComponent(
        "trashed = false and mimeType = 'text/plain'"
      );
      const listUrl = `https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType)&q=${q}`;
      const res = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setDriveFiles(data.files || []);

      setOutput("✅ File deleted from Drive.");
      setShowOutput(true);
    } catch (error) {
      setOutput(`❌ Failed to delete file: ${error.message}`);
      setShowOutput(true);
      throw error;
    }
  };

  const handleFileSelect = async (fileId, fileName) => {
    try {
      if (!accessToken) {
        tokenClient?.requestAccessToken({ prompt: "consent" });
        setOutput(
          "Requesting permission to read Drive files... please retry opening the file after granting access."
        );
        setShowOutput(true);
        return;
      }

      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const resp = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Failed to download file: ${resp.status} ${t}`);
      }
      const content = await resp.text();

      const ext = "." + fileName.split(".").pop().toLowerCase();
      const detectedLang = languages.find((l) => l.ext === ext);
      const language = detectedLang ? detectedLang.value : "javascript";

      const newTab = {
        id: nextTabId,
        name: fileName,
        language: language,
        content: content,
        saved: true,
        driveId: fileId,
      };

      setTabs([...tabs, newTab]);
      setActiveTabId(nextTabId);
      setNextTabId(nextTabId + 1);
      setShowFilePicker(false);

      setOutput(
        `✅ File "${fileName}" loaded from Google Drive!\n📁 File ID: ${fileId}`
      );
      setShowOutput(true);
    } catch (error) {
      setOutput(
        `❌ Failed to load file from Google Drive: ${
          error.message || error.result?.error?.message
        }`
      );
      setShowOutput(true);
    }
  };

  // Get default content for different languages
  const getDefaultContent = (language) => {
    switch (language) {
      case "c":
        return `#include <stdio.h>

int main() {
    printf("Hello, World from C!\\n");
    
    // Variables and basic operations
    int num1 = 10;
    int num2 = 20;
    int sum = num1 + num2;
    
    printf("Sum of %d and %d is: %d\\n", num1, num2, sum);
    
    return 0;
}`;
      case "cpp":
        return `#include <iostream>
#include <string>

using namespace std;

int main() {
    cout << "Hello, World from C++!" << endl;
    
    // Variables and basic operations
    string name = "CodeBuddy";
    int version = 1;
    
    cout << "Welcome to " << name << " v" << version << endl;
    
    // Basic input/output example
    int num1 = 15;
    int num2 = 25;
    cout << "Sum: " << (num1 + num2) << endl;
    
    return 0;
}`;
      case "python":
        return `# Python example
print("Hello, World from Python!")

# Variables and basic operations
name = "CodeBuddy"
version = 1.0

print(f"Welcome to {name} v{version}")

# Basic calculations
num1 = 10
num2 = 20
result = num1 + num2
print(f"Sum of {num1} and {num2} is: {result}")`;
      case "javascript":
        return `// JavaScript example
console.log("Hello, World from JavaScript!");

// Variables and basic operations
const name = "CodeBuddy";
const version = "1.0";

console.log(\`Welcome to \${name} v\${version}\`);

// Basic calculations
const num1 = 10;
const num2 = 20;
const result = num1 + num2;
console.log(\`Sum of \${num1} and \${num2} is: \${result}\`);`;
      default:
        return "// New file\n// Start coding here...\n\n";
    }
  };

  const createNewTab = () => {
    const defaultLang = "javascript";
    const currentLang =
      languages.find((l) => l.value === defaultLang) || languages[0];
    const newTab = {
      id: nextTabId,
      name: `untitled-${nextTabId}${currentLang?.ext || ".js"}`,
      language: currentLang?.value || "javascript",
      content: getDefaultContent(currentLang?.value || "javascript"),
      saved: false,
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
  };

  // Create a new tab with a specific language
  const createNewTabWithLanguage = (language) => {
    const currentLang = languages.find((l) => l.value === language);
    if (!currentLang) return;

    const newTab = {
      id: nextTabId,
      name: `untitled-${nextTabId}${currentLang.ext}`,
      language: language,
      content: getDefaultContent(language),
      saved: false,
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
  };

  const closeTab = (tabId, event) => {
    event.stopPropagation();

    if (tabs.length === 1) {
      const defaultLang = "javascript";
      const def =
        languages.find((l) => l.value === defaultLang) || languages[0];
      setTabs([
        {
          id: 1,
          name: `untitled${def?.ext || ".js"}`,
          language: def?.value || "javascript",
          content: "",
          saved: false,
        },
      ]);
      setActiveTabId(1);
      return;
    }

    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
      const nextTab = newTabs[Math.min(currentIndex, newTabs.length - 1)];
      setActiveTabId(nextTab.id);
    }
  };

  const updateTab = (updates) => {
    setTabs(
      tabs.map((tab) => {
        if (tab.id === activeTabId) {
          const updatedTab = { ...tab, ...updates, saved: false };

          // If language changed and content is default/empty, provide sample code
          if (updates.language && updates.language !== tab.language) {
            const isDefaultContent =
              tab.content === "// New file\n// Start coding here...\n\n" ||
              tab.content.trim() === "" ||
              tab.content === getDefaultContent(tab.language);

            if (isDefaultContent) {
              updatedTab.content = getDefaultContent(updates.language);
            }

            // Update filename extension if it's still default
            const currentLang = languages.find(
              (l) => l.value === updates.language
            );
            if (currentLang && tab.name.startsWith("untitled-")) {
              const baseName = tab.name.split(".")[0];
              updatedTab.name = `${baseName}${currentLang.ext}`;
            }
          }

          return updatedTab;
        }
        return tab;
      })
    );
  };

  // New function to handle tab renaming
  const handleRenameTab = (tabId, newName) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === tabId ? { ...tab, name: newName, saved: false } : tab
      )
    );
  };

  // New function to handle tab deletion
  const handleDeleteTab = (tabId) => {
    closeTab(tabId, new Event("click"));
  };

  // Function to parse JavaScript errors and extract line numbers
  const parseJavaScriptError = (error, code) => {
    const errors = [];
    const errorString = error.toString();

    // Check if it's a syntax error first
    if (error instanceof SyntaxError) {
      // For syntax errors, try to find the line number in the stack
      const stack = error.stack || "";
      const lineMatch = stack.match(/<anonymous>:(\d+):/);
      if (lineMatch) {
        errors.push({
          line: parseInt(lineMatch[1]),
          column: 1,
          message: error.message,
        });
      } else {
        // Fallback: add error to first line
        errors.push({
          line: 1,
          column: 1,
          message: error.message,
        });
      }
    } else {
      // For runtime errors, try to extract line number from stack trace
      const stack = error.stack || "";
      const lineMatch = stack.match(/<anonymous>:(\d+):/);
      if (lineMatch) {
        errors.push({
          line: parseInt(lineMatch[1]),
          column: 1,
          message: error.message,
        });
      } else {
        // If no line number found, add to first line
        errors.push({
          line: 1,
          column: 1,
          message: error.message,
        });
      }
    }

    return errors;
  };
  const runCode = async () => {
    setShowOutput(true);
    setErrors([]); // Clear previous errors

    if (
      activeTab.language === "javascript" ||
      activeTab.language === "typescript"
    ) {
      try {
        const logs = [];
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => logs.push("> " + args.join(" "));
        console.error = (...args) => logs.push("ERROR: " + args.join(" "));

        new Function(activeTab.content)();

        console.log = originalLog;
        console.error = originalError;

        setOutput(
          logs.length > 0
            ? logs.join("\n")
            : "Code executed successfully (no output)"
        );
      } catch (error) {
        const errorMessages = parseJavaScriptError(error, activeTab.content);
        setErrors(errorMessages);

        setOutput(
          `Error: ${error.message}\n\nMake sure your code is valid JavaScript!`
        );
      }
    } else if (activeTab.language === "html") {
      setOutput("HTML preview would be shown here in a full implementation.");
    } else if (activeTab.language === "python") {
      // Execute Python interactively: stream output and accept inline input
      setOutput("");
      setShowOutput(true);
      setInteractiveRunning(true);

      try {
        // Clear previous history before starting
        setConsoleHistory([]);
        await executeInteractive(activeTab.content, {
          onOutput: (text) => {
            // Debug: log chunk to browser console for diagnosis
            try {
              console.debug("pyodide chunk:", text);
            } catch (e) {}
            // Append streaming output chunk
            setConsoleHistory((h) => [
              ...h,
              { type: "output", value: text, timestamp: Date.now() },
            ]);
            setOutput((s) => s + text);
          },
          onInput: (prompt, callback) => {
            // Show prompt in input area and wait; do not append prompt yet to avoid duplicates
            setInputPrompt(prompt || "");
            setIsWaitingForInput(true);
            interactiveRespondRef.current = (val) => {
              try {
                // When user responds, append prompt (if missing) and the input value as separate entries
                setConsoleHistory((h) => {
                  const last = h.length ? h[h.length - 1] : null;
                  const entries = [];
                  if (
                    !(
                      last &&
                      last.type === "output" &&
                      last.value === (prompt || "")
                    )
                  ) {
                    entries.push({
                      type: "output",
                      value: prompt || "",
                      timestamp: Date.now(),
                    });
                  }
                  entries.push({
                    type: "input",
                    value: String(val),
                    timestamp: Date.now(),
                  });
                  return [...h, ...entries];
                });

                setOutput((s) => s + String(val) + "\n");
                callback(val);
              } finally {
                setIsWaitingForInput(false);
                setInputPrompt("");
                interactiveRespondRef.current = null;
              }
            };
          },
          onError: (err) => {
            setConsoleHistory((h) => [
              ...h,
              {
                type: "output",
                value: "\nERROR: " + String(err),
                timestamp: Date.now(),
              },
            ]);
            setOutput((s) => s + "\nERROR: " + err);
          },
          onComplete: () => setInteractiveRunning(false),
        });
      } catch (err) {
        setOutput((s) => s + `\nExecution error: ${String(err)}`);
        setInteractiveRunning(false);
      }
    } else if (activeTab.language === "c" || activeTab.language === "cpp") {
      // Execute C/C++ code using WASM client with input support
      setOutput("");
      setShowOutput(true);
      setConsoleHistory([]);
      setInteractiveRunning(true);

      try {
        await runCppLocal(activeTab.content, activeTab.language, {
          onOutput: (text) => {
            setConsoleHistory((h) => [
              ...h,
              { type: "output", value: text, timestamp: Date.now() },
            ]);
            setOutput((s) => s + text);
          },
          onInput: (prompt, callback) => {
            // Handle input similar to Python
            setInputPrompt(prompt || "");
            setIsWaitingForInput(true);
            interactiveRespondRef.current = (val) => {
              try {
                // Add prompt and input to console history
                setConsoleHistory((h) => {
                  const last = h.length ? h[h.length - 1] : null;
                  const entries = [];
                  if (
                    !(
                      last &&
                      last.type === "output" &&
                      last.value === (prompt || "")
                    )
                  ) {
                    entries.push({
                      type: "output",
                      value: prompt || "",
                      timestamp: Date.now(),
                    });
                  }
                  entries.push({
                    type: "input",
                    value: String(val),
                    timestamp: Date.now(),
                  });
                  return [...h, ...entries];
                });

                setOutput((s) => s + String(val) + "\n");
                callback(val);
              } finally {
                setIsWaitingForInput(false);
                setInputPrompt("");
                interactiveRespondRef.current = null;
              }
            };
          },
          onError: (err) => {
            setConsoleHistory((h) => [
              ...h,
              {
                type: "output",
                value: "\nERROR: " + String(err),
                timestamp: Date.now(),
              },
            ]);
            setOutput((s) => s + "\nERROR: " + err);
          },
          onComplete: () => {
            setInteractiveRunning(false);
          },
        });
      } catch (err) {
        setOutput(`Execution error: ${String(err)}`);
        setInteractiveRunning(false);
      }
    } else {
      const langLabel =
        languages.find((l) => l.value === activeTab.language)?.label ||
        activeTab.language;

      setOutput(
        `Code execution for ${langLabel} is not supported in this demo.\nThis is a beginner-friendly editor - try JavaScript for interactive execution!`
      );
    }
  };

  // Handle input submission for interactive Python console
  const handleInputSubmit = (input) => {
    if (inputResolver) {
      inputResolver(input);
      setIsWaitingForInput(false);
      setInputPrompt("");
      setInputResolver(null);
    }
  };

  const saveFile = () => {
    try {
      const currentLang = languages.find((l) => l.value === activeTab.language);
      const fileName = activeTab.name.includes(".")
        ? activeTab.name
        : `${activeTab.name}${currentLang.ext}`;

      const blob = new Blob([activeTab.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId ? { ...tab, saved: true } : tab
        )
      );
    } catch (error) {
      setOutput(`Save Error: ${error.message}`);
      setShowOutput(true);
    }
  };

  const loadFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const ext = "." + file.name.split(".").pop().toLowerCase();
        const detectedLang = languages.find((l) => l.ext === ext);
        const language = detectedLang ? detectedLang.value : "javascript";

        const newTab = {
          id: nextTabId,
          name: file.name,
          language: language,
          content: e.target.result,
          saved: true,
        };

        setTabs([...tabs, newTab]);
        setActiveTabId(nextTabId);
        setNextTabId(nextTabId + 1);
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  // Resize handlers for draggable console
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;

    const container = document.querySelector(".resize-container");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newConsoleWidth =
      ((containerRect.right - e.clientX) / containerRect.width) * 100;

    // Constrain between 20% and 60%
    const constrainedWidth = Math.min(Math.max(newConsoleWidth, 20), 60);
    setConsoleWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-all duration-300`}
      style={{
        animation: "fadeInScale 0.5s ease-out",
      }}>
      {/* Enhanced Header with Gradient and Better Branding */}
      <header
        className={`${
          darkMode
            ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700"
            : "bg-gradient-to-r from-blue-50 via-white to-purple-50 border-gray-200"
        } border-b px-4 py-3 shadow-elegant-lg`}
        style={{
          animation: "slideInDown 0.6s ease-out",
        }}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <div className={`py-1 shadow-blue-300 rounded-full`}>
                <img src={logo} alt='CodeNoobs Logo' height={60} width={60} />
              </div>
              <div className='flex flex-col'>
                <h1
                  className={`text-xl font-bold bg-gradient-to-br ${
                    darkMode
                      ? "from-white via-gray-200 to-white"
                      : "from-blue-600 to-amber-600"
                  } bg-clip-text text-transparent`}>
                  Code
                  <span className='bg-gradient-to-r from-blue-300 to-green-400 bg-clip-text text-transparent'>
                    Noobs
                  </span>
                </h1>
                <span
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                  Learn • Code • Create
                </span>
              </div>
            </div>
            <div
              className={`hidden lg:flex items-center px-3 py-1.5 rounded-full border ${
                darkMode
                  ? "border-gray-600 bg-gray-800/50"
                  : "border-gray-200 bg-white/80"
              } backdrop-blur-sm`}>
              <span className='text-xs font-medium text-green-500 mr-2'>
                🚀
              </span>
              <span
                className={`text-xs ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                Perfect for learning programming
              </span>
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            <div className='relative'>
              {googleUser ? (
                <div className='flex items-center space-x-2'>
                  <div className='flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg'>
                    <img
                      src={googleUser.picture}
                      alt={googleUser.name}
                      className='w-6 h-6 rounded-full'
                    />
                    <span className='text-sm font-medium'>
                      {googleUser.name}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowCloudMenu(!showCloudMenu)}
                    className={`p-2 rounded-lg ${
                      darkMode
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } transition-colors relative`}>
                    <FileText size={20} />{" "}
                    {/* Changed to FileText as placeholder; use Cloud if preferred */}
                  </button>

                  <CloudMenu
                    showCloudMenu={showCloudMenu}
                    setShowCloudMenu={setShowCloudMenu}
                    saveToGoogleDrive={saveToGoogleDrive}
                    loadFromGoogleDrive={loadFromGoogleDrive}
                    signOutFromGoogle={signOutFromGoogle}
                    darkMode={darkMode}
                  />
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}>
                  <User size={16} className='mr-2' />
                  Sign in with Google
                </button>
              )}
            </div>

            {activeTab && (
              <select
                value={activeTab.language}
                onChange={(e) => updateTab({ language: e.target.value })}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode
                  ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <TabToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        closeTab={closeTab}
        createNewTab={createNewTab}
        activeTab={activeTab}
        updateTab={updateTab}
        runCode={runCode}
        saveFile={saveFile}
        saveToGoogleDrive={saveToGoogleDrive}
        fileInputRef={fileInputRef}
        loadFile={loadFile}
        darkMode={darkMode}
        googleUser={googleUser}
        languages={languages}
        onRenameTab={handleRenameTab}
        onDeleteTab={handleDeleteTab}
      />

      <div className='flex h-[calc(100vh-10rem)] overflow-hidden resize-container'>
        {" "}
        {/* Adjust height based on header/tab-toolbar */}
        <div
          className={`flex flex-col ${
            isResizing ? "" : "transition-all duration-200"
          }`}
          style={{
            width: showOutput ? `${100 - consoleWidth}%` : "100%",
          }}>
          <div className={`flex-1 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
            {activeTab ? (
              <Editor
                height='100%'
                language={monacoLanguage}
                value={activeTab.content}
                onChange={(value) => updateTab({ content: value })}
                theme={theme}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;

                  // Configure error markers when editor mounts
                  if (errors.length > 0) {
                    const markers = errors.map((error) => ({
                      startLineNumber: error.line,
                      startColumn: error.column || 1,
                      endLineNumber: error.line,
                      endColumn: error.endColumn || 1000,
                      message: error.message,
                      severity: monaco.MarkerSeverity.Error,
                    }));

                    monaco.editor.setModelMarkers(
                      editor.getModel(),
                      "owner",
                      markers
                    );
                  }
                }}
                options={{
                  fontSize: 14,
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  lineHeight: 1.5,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            ) : (
              <div
                className={`flex items-center justify-center h-full ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                <p>No file open. Create a new tab to start coding!</p>
              </div>
            )}
          </div>

          <StatusBar
            activeTab={activeTab}
            languages={languages}
            darkMode={darkMode}
          />
        </div>
        {showOutput && (
          <>
            {/* Resize Handle */}
            <div
              className={`w-1 cursor-col-resize hover:bg-blue-500 transition-colors ${
                darkMode
                  ? "bg-gray-600 hover:bg-blue-400"
                  : "bg-gray-300 hover:bg-blue-500"
              } ${isResizing ? "bg-blue-500" : ""}`}
              onMouseDown={handleMouseDown}
            />

            {activeTab &&
            (activeTab.language === "python" ||
              activeTab.language === "c" ||
              activeTab.language === "cpp") ? (
              <InteractiveConsole
                output={output}
                setOutput={setOutput}
                setShowOutput={setShowOutput}
                darkMode={darkMode}
                width={consoleWidth}
                isResizing={isResizing}
                onInput={(value) => {
                  // When user submits input from UI, forward to the responder
                  if (interactiveRespondRef.current) {
                    interactiveRespondRef.current(value);
                  }
                }}
                isWaitingForInput={isWaitingForInput}
                inputPrompt={inputPrompt}
                history={consoleHistory}
                setHistory={setConsoleHistory}
              />
            ) : (
              <OutputConsole
                output={output}
                setOutput={setOutput}
                setShowOutput={setShowOutput}
                darkMode={darkMode}
                width={consoleWidth}
                isResizing={isResizing}
              />
            )}
          </>
        )}
      </div>

      <FilePickerModal
        showFilePicker={showFilePicker}
        setShowFilePicker={setShowFilePicker}
        driveFiles={driveFiles}
        onFileSelect={handleFileSelect}
        onFileDelete={handleDeleteDriveFile}
        darkMode={darkMode}
      />
    </div>
  );
};

export default CodeBuddy;
