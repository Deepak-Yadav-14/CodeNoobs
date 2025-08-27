// Simple Python execution with interactive input support
let pyodide = null;

// Initialize Pyodide
export async function ensurePyodide() {
  if (pyodide) return pyodide;

  try {
    const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";

    // Try ESM import first
    try {
      const mod = await import(/* @vite-ignore */ indexURL + "pyodide.mjs");
      if (mod && typeof mod.loadPyodide === "function") {
        pyodide = await mod.loadPyodide({ indexURL });
        return pyodide;
      }
    } catch (esmErr) {
      // Fall back to script loading
    }

    // Fallback: load classic script
    if (typeof loadPyodide === "undefined") {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = indexURL + "pyodide.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load pyodide.js"));
        document.head.appendChild(script);
      });
    }

    // Wait for global loadPyodide
    const start = Date.now();
    while (typeof loadPyodide === "undefined") {
      if (Date.now() - start > 5000) {
        throw new Error("loadPyodide not available after timeout");
      }
      await new Promise((r) => setTimeout(r, 50));
    }

    pyodide = await loadPyodide({ indexURL });
    return pyodide;
  } catch (error) {
    console.error("Failed to initialize Pyodide:", error);
    throw error;
  }
}

// Enhanced Interactive Console
export class InteractivePythonConsole {
  constructor() {
    this.onOutput = null;
    this.onInput = null;
    this.onError = null;
    this.onComplete = null;
    this.inputResolver = null;
    this.isInitialized = false;
  }

  async execute(code, callbacks = {}) {
    this.onOutput = callbacks.onOutput || (() => {});
    this.onInput = callbacks.onInput || (() => {});
    this.onError = callbacks.onError || (() => {});
    this.onComplete = callbacks.onComplete || (() => {});

    try {
      const pyodideInstance = await ensurePyodide();

      // Set up custom input function that will trigger our UI
      pyodideInstance.globals.set("custom_input", (prompt = "") => {
        return new Promise((resolve) => {
          this.inputResolver = resolve;
          this.onInput(prompt, (userInput) => {
            if (this.inputResolver) {
              this.inputResolver(userInput || "");
              this.inputResolver = null;
            }
          });
        });
      });

      // Set up custom output function
      pyodideInstance.globals.set("custom_output", (text) => {
        this.onOutput(text);
      });

      // Execute Python with custom I/O
      await pyodideInstance.runPython(`
import sys
import builtins
from js import custom_input, custom_output
import asyncio

# Custom output class
class CustomOutput:
    def write(self, text):
        if text:
            custom_output(text)
        return len(text)
    
    def flush(self):
        pass

# Save original functions
original_input = builtins.input
original_stdout = sys.stdout
original_stderr = sys.stderr

# Custom input function
def interactive_input(prompt=""):
    if prompt:
        custom_output(prompt)
    
    # Use Pyodide's async capabilities
    import asyncio
    
    try:
        # Get the current event loop
        loop = asyncio.get_event_loop()
        
        # Create a task for the input
        async def get_input():
            result = await custom_input(prompt)
            return str(result)
        
        # Run the task
        if loop.is_running():
            # We're already in an async context
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(lambda: asyncio.run(get_input()))
                return future.result(timeout=30)  # 30 second timeout
        else:
            return loop.run_until_complete(get_input())
            
    except Exception as e:
        custom_output(f"Input error: {e}")
        return ""

# Replace built-in functions
builtins.input = interactive_input
sys.stdout = CustomOutput()
sys.stderr = CustomOutput()

try:
    # Execute the user code
    exec("""${code.replace(/"/g, '\\"').replace(/\n/g, "\\n")}""")
except Exception as e:
    import traceback
    error_msg = f"Error: {str(e)}\\n{traceback.format_exc()}"
    custom_output(error_msg)
finally:
    # Restore original functions
    builtins.input = original_input
    sys.stdout = original_stdout
    sys.stderr = original_stderr
`);

      this.onComplete();
    } catch (error) {
      this.onError(`Execution error: ${error.message}`);
    }
  }

  provideInput(input) {
    if (this.inputResolver) {
      this.inputResolver(input);
      this.inputResolver = null;
    }
  }
}

// Simple execution using browser prompt (fallback)
export async function runPython(code) {
  try {
    const pyodideInstance = await ensurePyodide();

    // Set up browser-based input
    pyodideInstance.globals.set("browser_input", (prompt_text = "") => {
      const result = window.prompt(prompt_text || "Enter input:");
      return result !== null ? result : "";
    });

    const wrapper = `
import sys, io, json
def run_code(code):
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    old_stdout, old_stderr = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = stdout_capture, stderr_capture
    
    import builtins
    original_input = builtins.input
    
    def simple_input(prompt=""):
        if prompt:
            print(prompt, end="", flush=True)
        result = browser_input(prompt)
        print(result)  # Echo input
        return result
    
    builtins.input = simple_input
    
    try:
        exec(code, {})
    except Exception as e:
        import traceback
        traceback.print_exc(file=stderr_capture)
    finally:
        sys.stdout, sys.stderr = old_stdout, old_stderr
        builtins.input = original_input
    
    return json.dumps({
        "stdout": stdout_capture.getvalue(), 
        "stderr": stderr_capture.getvalue()
    })

run_code(${JSON.stringify(code)})
`;

    const result = await pyodideInstance.runPython(wrapper);
    const parsed = JSON.parse(result);
    return { stdout: parsed.stdout || "", stderr: parsed.stderr || "" };
  } catch (err) {
    return { stdout: "", stderr: String(err) };
  }
}

// Execute interactively: streams output via callbacks and waits for input via JS Promises.
export async function executeInteractive(code, callbacks = {}) {
  const onOutput = callbacks.onOutput || (() => {});
  const onInput = callbacks.onInput || (() => {});
  const onError = callbacks.onError || (() => {});
  const onComplete = callbacks.onComplete || (() => {});

  try {
    const pyodideInstance = await ensurePyodide();

    // Bridge functions: Python will call py_input and py_output (via js)
    globalThis.py_input = (prompt = "") => {
      return new Promise((resolve) => {
        // Call the UI input handler which must resolve and pass value to resolve
        onInput(prompt, (value) => {
          resolve(value === undefined || value === null ? "" : String(value));
        });
      });
    };

    globalThis.py_output = (text) => {
      onOutput(text);
    };

    // Also inject these JS functions into the Pyodide globals so Python can access them
    try {
      pyodideInstance.globals.set("py_input", globalThis.py_input);
      pyodideInstance.globals.set("py_output", globalThis.py_output);
    } catch (e) {
      // ignore - in some environments globals may be readonly
    }

    // Transform code: wrap in async main and replace input(...) with await py_input(...)
    // NOTE: This simple replacement may be fooled by strings/comments; acceptable trade-off.
    const transformed = code.replace(/\binput\s*\(/g, "await py_input(");
    // Wrap user code in an async function, redirect stdout/stderr and use injected py_input/py_output
    const wrapped = `import sys\n\nclass _Out:\n    def write(self, s):\n        if s:\n            py_output(s)\n    def flush(self):\n        pass\n\n_old_out, _old_err = sys.stdout, sys.stderr\nsys.stdout = _Out()\nsys.stderr = _Out()\n\nasync def __user_main():\n${transformed
      .split("\n")
      .map((l) => "    " + l)
      .join(
        "\n"
      )}\n\ntry:\n    await __user_main()\nexcept Exception as e:\n    import traceback\n    py_output(f"Error: {str(e)}\\n{traceback.format_exc()}")\nfinally:\n    sys.stdout = _old_out\n    sys.stderr = _old_err`;

    // Execute using runPythonAsync to allow awaiting JS promises
    try {
      await pyodideInstance.runPythonAsync(wrapped);
    } catch (err) {
      onError(String(err));
    }

    onComplete();
  } catch (err) {
    onError(String(err));
  }
}
