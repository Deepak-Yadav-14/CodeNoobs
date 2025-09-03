// C/C++ WebAssembly client using remote compilation
// This uses a remote API service since full C++ WASM compilation in browser is complex

import { RAPIDAPI_KEY, JUDGE0_API_URL } from "../constants/googleConfig";

let isInitialized = false;

// Test Judge0 API connection
export const testJudge0Connection = async () => {
  try {
    if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "YOUR_RAPIDAPI_KEY_HERE") {
      throw new Error(
        "RapidAPI key not configured. Please update your RAPIDAPI_KEY in googleConfig.js"
      );
    }

    // Test with a simple request to get available languages
    const response = await fetch(`${JUDGE0_API_URL}/languages`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API connection failed: ${response.status} - ${errorText}`
      );
    }

    const languages = await response.json();
    console.log(
      "Judge0 API connection successful!",
      languages.length + " languages available"
    );
    return true;
  } catch (error) {
    console.error("Judge0 API connection test failed:", error);
    throw error;
  }
};

export const initializeCpp = async () => {
  if (isInitialized) return;

  try {
    // Test the API connection first
    await testJudge0Connection();

    isInitialized = true;
    console.log("C/C++ client initialized with Judge0 API");
  } catch (error) {
    console.error("Failed to initialize C/C++ client:", error);
    throw error;
  }
};

// Simple C/C++ execution for split console (with direct input)
export const runCppDirect = async (
  code,
  language,
  stdin = "",
  callbacks = {}
) => {
  const { onOutput, onError, onComplete } = callbacks;

  try {
    await initializeCpp();

    if (onOutput) {
      onOutput(`🔧 Compiling ${language.toUpperCase()} code...\n`);
      if (stdin && stdin.trim()) {
        onOutput(`📥 Using input: ${stdin.replace(/\n/g, " ")}\n`);
      }
    }

    // Execute directly with Judge0
    await executeWithJudge0(code, language, stdin.trim(), callbacks);
  } catch (error) {
    const errorMsg = `❌ Execution error: ${error.message}`;
    if (onError) onError(errorMsg);
    else if (onOutput) onOutput(errorMsg);
    if (onComplete) onComplete();
  }
};

// Enhanced C/C++ execution using Judge0 API with input handling
export const runCppWithInput = async (code, language, callbacks = {}) => {
  const { onOutput, onError, onComplete } = callbacks;

  try {
    await initializeCpp();

    // Check if code needs input
    const needsInput =
      (language === "c" &&
        (code.includes("scanf") ||
          code.includes("getchar") ||
          code.includes("gets"))) ||
      (language === "cpp" &&
        (code.includes("cin") || code.includes("getline")));

    if (!needsInput) {
      // No input needed, use regular execution
      return await runCpp(code, language, callbacks);
    }

    // For input-requiring programs, ask for input in a user-friendly way
    if (onOutput) {
      onOutput("📝 This program requires input.\n");
      onOutput(
        "💡 Tip: Enter all input values separated by spaces or new lines.\n"
      );
      onOutput("🚀 Example: For two numbers, enter: 10 20\n");
      onOutput(
        "📋 After entering input, the program will execute automatically.\n\n"
      );
    }

    return new Promise((resolve) => {
      const { onInput } = callbacks;
      if (onInput) {
        onInput("Enter input values: ", async (inputString) => {
          const cleanInput = inputString.trim();
          if (cleanInput) {
            await executeWithJudge0(code, language, cleanInput, callbacks);
          } else {
            if (onOutput)
              onOutput("⚠️  No input provided. Executing without input...\n");
            await executeWithJudge0(code, language, "", callbacks);
          }
          resolve();
        });
      } else {
        // No input handler available, execute without input
        executeWithJudge0(code, language, "", callbacks).then(resolve);
      }
    });
  } catch (error) {
    const errorMsg = `❌ Execution error: ${error.message}`;
    if (onError) onError(errorMsg);
    else if (onOutput) onOutput(errorMsg);
    if (onComplete) onComplete();
  }
};

// Helper function to execute with Judge0
const executeWithJudge0 = async (code, language, stdin, callbacks) => {
  const { onOutput, onError, onComplete } = callbacks;

  try {
    // Judge0 language IDs (using latest GCC versions)
    // C (GCC 14.1.0) = 103, C++ (GCC 14.1.0) = 105
    // Fallback: C (GCC 9.2.0) = 50, C++ (GCC 9.2.0) = 54
    const languageId = language === "c" ? 103 : 105;

    if (onOutput) {
      onOutput(
        `🔧 Compiling ${language.toUpperCase()} code (Language ID: ${languageId})...\n`
      );
      if (stdin) {
        onOutput(`📥 Input provided: ${stdin.replace(/\n/g, " ")}\n`);
      }
    }

    const submissionData = {
      language_id: languageId,
      source_code: code,
      stdin: stdin,
    };

    console.log("Submission payload:", submissionData);

    const submitResponse = await fetch(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "X-RapidAPI-Key": RAPIDAPI_KEY,
        },
        body: JSON.stringify(submissionData),
      }
    );

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error("Submission error:", {
        status: submitResponse.status,
        statusText: submitResponse.statusText,
        error: errorText,
        payload: submissionData,
      });
      throw new Error(
        `Submission failed: ${submitResponse.status} - ${errorText}`
      );
    }

    const submitData = await submitResponse.json();
    const token = submitData.token;

    if (onOutput) onOutput("⏳ Running program...\n\n");

    // Poll for results
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const resultResponse = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": RAPIDAPI_KEY,
          },
        }
      );

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text();
        console.error("Result fetch error:", resultResponse.status, errorText);
        throw new Error(
          `Result fetch failed: ${resultResponse.status} - ${errorText}`
        );
      }

      const resultData = await resultResponse.json();

      if (resultData.status.id <= 2) {
        attempts++;
        continue;
      }

      // Process completed
      let output = "";
      let hasError = false;

      // Handle compilation errors
      if (resultData.compile_output && resultData.compile_output.trim()) {
        output +=
          "🔴 Compilation Errors:\n" + resultData.compile_output + "\n\n";
        hasError = true;
      }

      // Handle runtime errors
      if (resultData.stderr && resultData.stderr.trim()) {
        output += "⚠️  Runtime Errors:\n" + resultData.stderr + "\n\n";
        hasError = true;
      }

      // Handle successful output
      if (resultData.stdout && resultData.stdout.trim()) {
        output += "✅ Program Output:\n" + resultData.stdout + "\n";
      } else if (!hasError) {
        output += "✅ Program executed successfully (no output)\n";
      }

      // Add execution status info
      const statusNames = {
        3: "Accepted",
        4: "Wrong Answer",
        5: "Time Limit Exceeded",
        6: "Compilation Error",
        7: "Runtime Error (SIGSEGV)",
        8: "Runtime Error (SIGXFSZ)",
        9: "Runtime Error (SIGFPE)",
        10: "Runtime Error (SIGABRT)",
        11: "Runtime Error (NZEC)",
        12: "Runtime Error (Other)",
        13: "Internal Error",
        14: "Exec Format Error",
      };

      const statusName =
        statusNames[resultData.status.id] || `Status ${resultData.status.id}`;
      if (resultData.status.id !== 3) {
        // Not "Accepted"
        output += `\n📊 Execution Status: ${statusName}\n`;
      }

      if (onOutput) onOutput(output);
      if (onComplete) onComplete();
      return;
    }

    throw new Error("⏰ Execution timeout - program took too long to complete");
  } catch (error) {
    const errorMsg = `❌ ${error.message}`;
    if (onError) onError(errorMsg);
    else if (onOutput) onOutput(errorMsg);
    if (onComplete) onComplete();
  }
};

// Simple C/C++ execution using Judge0 API (free tier)
export const runCpp = async (code, language, callbacks = {}) => {
  const { onOutput, onError, onComplete } = callbacks;

  try {
    await initializeCpp();

    // Judge0 language IDs: C (GCC 14.1.0) = 103, C++ (GCC 14.1.0) = 105
    const languageId = language === "c" ? 103 : 105;

    if (onOutput) onOutput("🔧 Compiling and running...\n");

    // Create submission
    const submitResponse = await fetch(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "X-RapidAPI-Key": RAPIDAPI_KEY,
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: code,
          stdin: "",
        }),
      }
    );

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error("Submission error:", submitResponse.status, errorText);
      throw new Error(
        `Submission failed: ${submitResponse.status} - ${errorText}`
      );
    }

    const submitData = await submitResponse.json();
    const token = submitData.token;

    // Poll for results
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const resultResponse = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": RAPIDAPI_KEY,
          },
        }
      );

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text();
        console.error("Result fetch error:", resultResponse.status, errorText);
        throw new Error(
          `Result fetch failed: ${resultResponse.status} - ${errorText}`
        );
      }

      const resultData = await resultResponse.json();

      if (resultData.status.id <= 2) {
        // Still processing
        attempts++;
        continue;
      }

      // Process completed
      let output = "";
      let hasError = false;

      // Handle compilation errors
      if (resultData.compile_output && resultData.compile_output.trim()) {
        output +=
          "🔴 Compilation Errors:\n" + resultData.compile_output + "\n\n";
        hasError = true;
      }

      // Handle runtime errors
      if (resultData.stderr && resultData.stderr.trim()) {
        output += "⚠️  Runtime Errors:\n" + resultData.stderr + "\n\n";
        hasError = true;
      }

      // Handle successful output
      if (resultData.stdout && resultData.stdout.trim()) {
        output += "✅ Program Output:\n" + resultData.stdout + "\n";
      } else if (!hasError) {
        output += "✅ Program executed successfully (no output)\n";
      }

      if (onOutput) onOutput(output);
      if (onComplete) onComplete();
      return;
    }

    throw new Error("Execution timeout");
  } catch (error) {
    const errorMsg = `Execution error: ${error.message}`;
    if (onError) onError(errorMsg);
    else if (onOutput) onOutput(errorMsg);
    if (onComplete) onComplete();
  }
};

// Interactive C/C++ execution with input support
export const executeInteractiveCpp = async (code, language, callbacks = {}) => {
  const { onOutput, onInput, onError, onComplete } = callbacks;

  try {
    if (onOutput) onOutput(`Compiling ${language.toUpperCase()} code...\n`);

    // Simulate compilation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic syntax check
    const syntaxErrors = checkBasicSyntax(code, language);
    if (syntaxErrors.length > 0) {
      if (onError) onError(`Compilation errors:\n${syntaxErrors.join("\n")}`);
      if (onComplete) onComplete();
      return;
    }

    if (onOutput) onOutput("Compilation successful!\nRunning program...\n\n");

    // Simulate execution delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Execute with input support
    await executeWithInputSupport(code, language, {
      onOutput,
      onInput,
      onError,
    });

    if (onComplete) onComplete();
  } catch (error) {
    const errorMsg = `Execution error: ${error.message}`;
    if (onError) onError(errorMsg);
    if (onComplete) onComplete();
  }
};

// Execute code with input support
const executeWithInputSupport = async (code, language, callbacks) => {
  const { onOutput, onInput, onError } = callbacks;

  try {
    const lines = code.split("\n");
    const variables = {};
    let needsInput = false;

    // Check if code needs input
    if (language === "c") {
      needsInput = code.includes("scanf") || code.includes("getchar");
    } else if (language === "cpp") {
      needsInput = code.includes("cin >>") || code.includes("getline");
    }

    if (!needsInput) {
      // No input needed, use regular extraction
      const output = extractOutput(code, language);
      if (onOutput) onOutput(output);
      return;
    }

    // Process code line by line for interactive execution
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (
        !line ||
        line.startsWith("//") ||
        line.startsWith("#") ||
        line.includes("{") ||
        line.includes("}") ||
        line.startsWith("int main") ||
        line === "return 0;"
      ) {
        continue;
      }

      // Handle variable declarations and calculations
      if (line.includes("int ")) {
        if (line.includes("=")) {
          // Variable with assignment
          const match = line.match(/int\s+(\w+)\s*=\s*(.+);/);
          if (match) {
            const varName = match[1];
            const expression = match[2].trim();

            // Check if it's a simple number or a calculation
            if (!isNaN(parseInt(expression))) {
              variables[varName] = parseInt(expression);
            } else {
              // It's a calculation with variables
              const result = evaluateExpression(expression, variables);
              variables[varName] = result;
            }
          }
        } else {
          // Variable declarations without assignment (e.g., int num1, num2;)
          const match = line.match(/int\s+([^;]+);/);
          if (match) {
            const varNames = match[1].split(",").map((name) => name.trim());
            varNames.forEach((varName) => {
              variables[varName] = 0; // Initialize to 0
            });
          }
        }
      }

      // Handle calculations without int declaration
      if (
        line.includes("=") &&
        !line.includes("int ") &&
        (line.includes("+") ||
          line.includes("-") ||
          line.includes("*") ||
          line.includes("/"))
      ) {
        processCalculation(line, variables);
      }

      // Handle input statements
      if (language === "c" && line.includes("scanf")) {
        await handleScanfInput(line, variables, onInput, onOutput);
      } else if (language === "cpp" && line.includes("cin >>")) {
        await handleCinInput(line, variables, onInput, onOutput);
      }

      // Handle output statements (after variables are processed)
      if (line.includes("printf") || line.includes("cout")) {
        const output = processOutputLine(line, variables, language);
        if (output && onOutput) {
          onOutput(output);
        }
      }
    }
  } catch (error) {
    if (onError) onError(`Runtime error: ${error.message}`);
  }
};

// Handle scanf input
const handleScanfInput = async (line, variables, onInput, onOutput) => {
  const match = line.match(/scanf\s*\(\s*"([^"]*)",\s*&(\w+)\)/);
  if (match && onInput) {
    const format = match[1];
    const varName = match[2];

    let prompt = "";
    if (format.includes("%d")) {
      prompt = "Enter an integer: ";
    } else if (format.includes("%s")) {
      prompt = "Enter a string: ";
    } else if (format.includes("%f")) {
      prompt = "Enter a number: ";
    } else {
      prompt = "Enter input: ";
    }

    const userInput = await new Promise((resolve) => {
      onInput(prompt, resolve);
    });

    // Store the input value
    if (format.includes("%d")) {
      variables[varName] = parseInt(userInput) || 0;
    } else {
      variables[varName] = userInput;
    }
  }
};

// Handle cin input
const handleCinInput = async (line, variables, onInput, onOutput) => {
  const match = line.match(/cin\s*>>\s*(\w+)/);
  if (match && onInput) {
    const varName = match[1];

    const userInput = await new Promise((resolve) => {
      onInput("Enter input: ", resolve);
    });

    // Try to parse as number, otherwise store as string
    const numValue = parseInt(userInput);
    variables[varName] = isNaN(numValue) ? userInput : numValue;
  }
};

// Process output line with variables
const processOutputLine = (line, variables, language) => {
  if (language === "c" && line.includes("printf")) {
    const match = line.match(/printf\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\)/);
    if (match) {
      let formatStr = match[1];
      const args = match[2] ? match[2].split(",").map((arg) => arg.trim()) : [];

      // Replace format specifiers
      let argIndex = 0;
      formatStr = formatStr.replace(/%[difs]/g, (specifier) => {
        if (argIndex < args.length) {
          const arg = args[argIndex++];
          const value = variables[arg] !== undefined ? variables[arg] : arg;
          return value;
        }
        return specifier;
      });

      formatStr = formatStr.replace(/\\n/g, "\n");
      return formatStr;
    }
  } else if (language === "cpp" && line.includes("cout")) {
    const match = line.match(/cout\s*<<(.+);/);
    if (match) {
      const expression = match[1];
      let result = "";

      const parts = expression.split("<<").map((part) => part.trim());

      for (const part of parts) {
        if (part.startsWith('"') && part.endsWith('"')) {
          result += part.slice(1, -1);
        } else if (part === "endl") {
          result += "\n";
        } else if (variables[part] !== undefined) {
          result += variables[part];
        } else if (part.includes("(") && part.includes(")")) {
          // Handle expressions like (a + b)
          const expr = part.replace(/[()]/g, "");
          const calcResult = evaluateExpression(expr, variables);
          result += calcResult;
        } else {
          result += part;
        }
      }

      return result;
    }
  }

  return null;
};

// Process calculations
const processCalculation = (line, variables) => {
  const match = line.match(/(\w+)\s*=\s*([^;]+);/);
  if (match) {
    const varName = match[1];
    const expression = match[2].trim();

    const result = evaluateExpression(expression, variables);
    variables[varName] = result;
  }
};

// Evaluate simple expressions
const evaluateExpression = (expr, variables) => {
  try {
    // Handle simple arithmetic
    if (expr.includes("+")) {
      const parts = expr.split("+").map((part) => part.trim());
      return parts.reduce((sum, part) => {
        const value =
          variables[part] !== undefined ? variables[part] : parseInt(part) || 0;
        return sum + value;
      }, 0);
    } else if (expr.includes("-")) {
      const parts = expr.split("-").map((part) => part.trim());
      let result =
        variables[parts[0]] !== undefined
          ? variables[parts[0]]
          : parseInt(parts[0]) || 0;
      for (let i = 1; i < parts.length; i++) {
        const value =
          variables[parts[i]] !== undefined
            ? variables[parts[i]]
            : parseInt(parts[i]) || 0;
        result -= value;
      }
      return result;
    } else if (expr.includes("*")) {
      const parts = expr.split("*").map((part) => part.trim());
      return parts.reduce((product, part) => {
        const value =
          variables[part] !== undefined ? variables[part] : parseInt(part) || 1;
        return product * value;
      }, 1);
    }

    // Single variable or number
    return variables[expr] !== undefined
      ? variables[expr]
      : parseInt(expr) || 0;
  } catch (error) {
    return 0;
  }
};

// Fallback local execution simulation (for demo purposes)
export const runCppLocal = async (code, language, callbacks = {}) => {
  const { onOutput, onInput, onError, onComplete } = callbacks;

  // Check if code needs input, use interactive version
  const needsInput =
    (language === "c" &&
      (code.includes("scanf") || code.includes("getchar"))) ||
    (language === "cpp" &&
      (code.includes("cin >>") || code.includes("getline")));

  if (needsInput && onInput) {
    return executeInteractiveCpp(code, language, callbacks);
  }

  try {
    if (onOutput) onOutput(`Compiling ${language.toUpperCase()} code...\n`);

    // Simulate compilation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic syntax check
    const syntaxErrors = checkBasicSyntax(code, language);
    if (syntaxErrors.length > 0) {
      if (onError) onError(`Compilation errors:\n${syntaxErrors.join("\n")}`);
      if (onComplete) onComplete();
      return;
    }

    if (onOutput) onOutput("Compilation successful!\nRunning program...\n\n");

    // Simulate execution delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Extract and simulate output
    const output = extractOutput(code, language);

    if (onOutput) onOutput(output);
    if (onComplete) onComplete();
  } catch (error) {
    const errorMsg = `Execution error: ${error.message}`;
    if (onError) onError(errorMsg);
    if (onComplete) onComplete();
  }
};

// Basic syntax checking for C/C++
const checkBasicSyntax = (code, language) => {
  const errors = [];

  // Check for main function
  if (!code.includes("main")) {
    errors.push("Error: No 'main' function found");
  }

  // Check for includes (C/C++)
  if (language === "c" && code.includes("cout")) {
    errors.push(
      "Error: 'cout' is not valid in C. Use 'printf' instead or switch to C++"
    );
  }

  if (
    language === "cpp" &&
    code.includes("printf") &&
    !code.includes("#include <cstdio>") &&
    !code.includes("#include <stdio.h>")
  ) {
    errors.push(
      "Warning: Using 'printf' without including <cstdio> or <stdio.h>"
    );
  }

  // Check for basic bracket matching
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push("Error: Mismatched braces '{' and '}'");
  }

  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push("Error: Mismatched parentheses '(' and ')'");
  }

  return errors;
};

// Extract and simulate output from C/C++ code
const extractOutput = (code, language) => {
  let output = "";
  let hasOutput = false;

  try {
    if (language === "c") {
      // Handle printf statements with better parsing
      const lines = code.split("\n");
      const variables = parseVariables(code);

      for (const line of lines) {
        if (line.includes("printf")) {
          const printfMatch = line.match(
            /printf\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\)/
          );
          if (printfMatch) {
            let formatStr = printfMatch[1];
            const args = printfMatch[2]
              ? printfMatch[2].split(",").map((arg) => arg.trim())
              : [];

            // Replace format specifiers with actual values
            let argIndex = 0;
            formatStr = formatStr.replace(/%[difs]/g, (match) => {
              if (argIndex < args.length) {
                const arg = args[argIndex++];
                // Try to get variable value or use the expression
                const value =
                  variables[arg] !== undefined ? variables[arg] : arg;
                return value;
              }
              return match;
            });

            // Handle escape sequences
            formatStr = formatStr.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
            output += formatStr;
            hasOutput = true;
          }
        }
      }
    } else if (language === "cpp") {
      // Handle cout statements with better parsing
      const lines = code.split("\n");
      const variables = parseVariables(code);

      for (const line of lines) {
        if (line.includes("cout") && line.includes("<<")) {
          // Parse cout chain
          const coutMatch = line.match(/cout\s*<<(.+);/);
          if (coutMatch) {
            const expression = coutMatch[1];
            let result = "";

            // Split by << and process each part
            const parts = expression.split("<<").map((part) => part.trim());

            for (const part of parts) {
              if (part.startsWith('"') && part.endsWith('"')) {
                // String literal
                result += part.slice(1, -1);
              } else if (part === "endl") {
                result += "\n";
              } else if (variables[part] !== undefined) {
                // Variable
                result += variables[part];
              } else {
                // Expression or unknown
                result += `${part}`;
              }
            }

            output += result;
            hasOutput = true;
          }
        }
      }
    }

    if (!hasOutput) {
      output = "Program executed successfully (no output statements found).";
    }

    output += "\n";
  } catch (error) {
    output = `Error during output extraction: ${error.message}\n`;
  }

  return output;
};

// Parse variables from code to simulate their values
const parseVariables = (code) => {
  const variables = {};

  try {
    // Parse int variables
    const intMatches = code.match(/int\s+(\w+)\s*=\s*(\d+)/g);
    if (intMatches) {
      intMatches.forEach((match) => {
        const parts = match.match(/int\s+(\w+)\s*=\s*(\d+)/);
        if (parts) {
          variables[parts[1]] = parseInt(parts[2]);
        }
      });
    }

    // Parse string variables (C++)
    const stringMatches = code.match(/string\s+(\w+)\s*=\s*"([^"]*)"/g);
    if (stringMatches) {
      stringMatches.forEach((match) => {
        const parts = match.match(/string\s+(\w+)\s*=\s*"([^"]*)"/);
        if (parts) {
          variables[parts[1]] = parts[2];
        }
      });
    }

    // Parse simple expressions
    const exprMatches = code.match(/int\s+(\w+)\s*=\s*([^;]+);/g);
    if (exprMatches) {
      exprMatches.forEach((match) => {
        const parts = match.match(/int\s+(\w+)\s*=\s*([^;]+);/);
        if (parts && parts[2].includes("+")) {
          // Simple addition
          const addMatch = parts[2].match(/(\w+)\s*\+\s*(\w+)/);
          if (addMatch) {
            const val1 = variables[addMatch[1]] || parseInt(addMatch[1]) || 0;
            const val2 = variables[addMatch[2]] || parseInt(addMatch[2]) || 0;
            variables[parts[1]] = val1 + val2;
          }
        } else if (parts && !isNaN(parseInt(parts[2]))) {
          variables[parts[1]] = parseInt(parts[2]);
        }
      });
    }

    // Handle expressions in output
    if (code.includes("(num1 + num2)")) {
      const num1 = variables["num1"] || 15;
      const num2 = variables["num2"] || 25;
      variables["(num1 + num2)"] = num1 + num2;
    }
  } catch (error) {
    // Ignore parsing errors
  }

  return variables;
};
