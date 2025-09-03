# Judge0 API Setup with RapidAPI

## Getting Your RapidAPI Key

1. **Sign up for RapidAPI**:

   - Go to [https://rapidapi.com/](https://rapidapi.com/)
   - Create a free account

2. **Subscribe to Judge0 API**:

   - Search for "Judge0" in the RapidAPI marketplace
   - Go to [Judge0 CE API](https://rapidapi.com/judge0-official/api/judge0-ce/)
   - Click "Subscribe to Test" button
   - Choose the free plan (typically includes 50-100 requests per day)

3. **Get Your API Key**:
   - After subscribing, you'll find your RapidAPI key in the "Header Parameters" section
   - Look for `X-RapidAPI-Key` - this is your API key

## Setting Up Your API Key

1. **Open the configuration file**:

   ```
   src/constants/googleConfig.js
   ```

2. **Replace the placeholder**:

   ```javascript
   export const RAPIDAPI_KEY = "YOUR_RAPIDAPI_KEY_HERE"; // Replace with your actual RapidAPI key
   ```

3. **Example**:
   ```javascript
   export const RAPIDAPI_KEY = "abcd1234efgh5678ijkl9012mnop3456qrst7890"; // Your actual key
   ```

## Testing the Setup

1. **Create a simple C program**:

   ```c
   #include <stdio.h>

   int main() {
       printf("Hello, World!\\n");
       return 0;
   }
   ```

2. **Create a simple C++ program**:

   ```cpp
   #include <iostream>

   int main() {
       std::cout << "Hello, World!" << std::endl;
       return 0;
   }
   ```

3. **Run the code** and check if you get the output in the console.

## API Usage Limits

- **Free Plan**: Usually 50-100 requests per day
- **Basic Plan**: More requests available for a small monthly fee
- **Pro Plans**: Higher limits for production use

## Supported Languages

Judge0 supports many programming languages with specific language IDs:

- **C**: Language ID = 50
- **C++**: Language ID = 54
- **Python**: Language ID = 71
- **JavaScript**: Language ID = 63
- **Java**: Language ID = 62
- And many more...

## Troubleshooting

1. **API Key Issues**:

   - Make sure your API key is correctly copied
   - Check that you've subscribed to the Judge0 API
   - Verify the key in your RapidAPI dashboard

2. **CORS Issues**:

   - The CSP has been updated to allow connections to Judge0
   - Make sure you're accessing the app via the correct protocol (http/https)

3. **Rate Limiting**:
   - Free plans have daily limits
   - If you exceed the limit, wait for the reset or upgrade your plan

## Features Enabled

With the Judge0 API setup, your CodeBuddy editor will support:

✅ **Real C/C++ compilation and execution**
✅ **Proper error messages and compilation feedback**
✅ **Output display for successful programs**
✅ **Support for both interactive and non-interactive C/C++ programs**

The system will automatically:

- Detect if your C/C++ code needs input (scanf, cin, etc.)
- Use interactive execution for input-requiring programs
- Use direct API calls for simple output-only programs
