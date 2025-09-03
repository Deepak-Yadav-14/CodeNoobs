# CodeBuddy - Split Console Feature

## 🚀 New Split Console for C/C++

CodeBuddy now features a dedicated split console for C/C++ programming that provides:

### ✨ Features

1. **Separate Input Section**

   - Dedicated text area for program inputs
   - No more interactive prompts
   - Enter all inputs at once

2. **Dedicated Output Section**

   - Clean program output display
   - Compilation errors and warnings
   - Execution status information

3. **Execution Management**

   - Prevents multiple simultaneous executions
   - Clear execution state indicators
   - Stop execution capability (if needed)

4. **User-Friendly Interface**
   - Visual execution status
   - Copy output functionality
   - Clear output/input options
   - Execution history

### 🎯 How to Use

#### For Simple Programs (No Input):

1. Write your C/C++ code in the editor
2. Click the "Run" button in the split console
3. View output in the Program Output section

#### For Programs with Input:

1. Write your C/C++ code in the editor
2. Enter input values in the "Program Input" section
   - Separate multiple values with spaces or new lines
   - Example: `10 20` or `5\nHello World`
3. Click the "Run" button in the split console
4. View output in the Program Output section

### 📝 Example Programs

#### Simple Hello World:

```c
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
```

**Input needed:** None  
**Expected output:** Hello, World!

#### Program with Input:

```c
#include <stdio.h>

int main() {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    printf("Sum: %d\n", a + b);
    return 0;
}
```

**Input to provide:** `10 20`  
**Expected output:** Enter two numbers: Sum: 30

#### C++ with Multiple Inputs:

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;

    cout << "Enter your name: ";
    cin >> name;
    cout << "Enter your age: ";
    cin >> age;

    cout << "Hello " << name << ", you are " << age << " years old!" << endl;
    return 0;
}
```

**Input to provide:**

```
John
25
```

**Expected output:** Enter your name: Enter your age: Hello John, you are 25 years old!

### 🔧 Technical Details

- **Compiler:** GCC 14.1.0 via Judge0 API
- **Language IDs:** C = 103, C++ = 105
- **Execution:** Real compilation and execution (not simulated)
- **Input handling:** All inputs sent to stdin at once
- **Error handling:** Compilation and runtime errors displayed clearly

### 🛡️ Safety Features

1. **Execution State Management**

   - Only one execution per tab at a time
   - Clear execution status indicators
   - Prevents race conditions

2. **Error Handling**

   - Detailed compilation error messages
   - Runtime error detection
   - Network error handling

3. **User Feedback**
   - Real-time execution status
   - Visual indicators for running programs
   - Clear error messages

### 🎨 UI Enhancements

- **Emojis and Icons:** Clear visual cues for different states
- **Color Coding:** Success (green), errors (red), info (blue)
- **Responsive Design:** Adjustable console width
- **Dark/Light Mode:** Consistent theming

### 🔄 Migration from Old System

- **Python:** Still uses interactive console
- **JavaScript/TypeScript:** Uses regular output console
- **C/C++:** Now uses split console automatically
- **Backward Compatibility:** Existing code works without changes

### 🐛 Bug Fixes

1. **Multiple Execution Prevention**

   - Fixed race conditions
   - Clear execution state management
   - Proper cleanup on completion

2. **Input Handling Improvements**

   - No more prompt-based input collection
   - Batch input processing
   - Better error handling

3. **UI Consistency**
   - Consistent theming across components
   - Proper responsive behavior
   - Better user feedback

### 🚀 Getting Started

1. Open CodeBuddy
2. Create a new C or C++ file
3. Write your program
4. Notice the split console on the right
5. Add inputs if needed
6. Click Run and enjoy! 🎉
