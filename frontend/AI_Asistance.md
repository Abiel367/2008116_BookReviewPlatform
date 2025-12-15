1. Setting up the project structure

Prompt:

"i wanna create a React Native project structure for a Book Review Platform with separate screens for Welcome, User Login/Register, Admin Login, User Dashboard, and Review Form, provide a good file structure

AI Output Summary:

Suggested a screens folder with files: WelcomeScreen.js, LoginScreen.js, RegisterScreen.js, AdminLoginScreen.js, UserDashboard.js, ReviewFormScreen.js

Suggested a context folder for AuthContext.js

2. Implementing Welcome Screen

Prompt:

"how to implement a Welcome screen in React Native with buttons for Register, User Login, and Admin Login. Include a note for admin credentials explanation no code"

AI Output Summary:

Gave guidance on SafeAreaView, Text, TouchableOpacity

Suggested navigation using useNavigation()

Recommended button styles and layout concepts.

3. Implementing Review Form Screen

Prompt:

"Im creating and editing book reviews how to use usestaet useState to acheive this?"

AI Output Summary:

Explained how to use TextInput for book title, author, review

Suggested a star rating UI using TouchableOpacity

Recommended a Modal for genre selection

Advised using axios to send POST/PUT requests with authentication token

Provided validation rules (e.g., minimum review length, required fields).

4. Handling API Integration

Prompt:

"Explain how to connect my React Native frontend to a FastAPI backend. Include examples for GET, POST, and PUT requests, and how to include an auth token in headers."

AI Output Summary:

Showed how to configure axios requests with headers

Suggested separate functions for fetching, creating, and updating reviews

Recommended error handling and displaying alerts for failures.


6. Troubleshooting Expo Issues

Prompt:

"My React Native app won't run in Expo Go and I get connection errors. Explain common issues and their solutions"

AI Output Summary:

Discussed localhost vs LAN IP for API URL

Recommended checking network connection and Expo Go updates

Advised on using console.log for debugging and placeholder UI when Expo fails.


8. Authentication Context

Prompt:

"Explain like im 5 how to set up a React Context for authentcation to manage login state and token across screens."



Component Import Errors
prompt: "I'm getting 'Invalid hook call' errors. What causes this and how do I fix it?"
The app was crashing with React hook errors. This was preventing me from even testing basic functionality.

Summary

All AI assistance focused on:

Explaining React Native concepts

Suggesting component structures and patterns

Providing partial code snippets and examples

Debugging tips for untested UI and Expo issues

No full project implementations were provided by AI. All coding was done manually based on guidance.
