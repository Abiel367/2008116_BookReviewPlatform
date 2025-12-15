AI Assistance Log
During the development of my Book Review Platform, I used an AI tool as a reference to help clarify concepts, debug issues, and get feedback on best practices. Below is a summary of the questions I asked throughout the project. All design decisions, code implementation, and final integrations were done by me.

General Project Guidance
What I asked:
"Im building a FastAPI backend for a book review platform. Can you walk me through how authentication generally works in FastAPI like im 5?"

Why I asked:
I wanted to make sure I understod the standard authentication patterns before diving into coding my own solution.

PIN‑Based Authentication Design
What I asked:
"Im gonna use a PIN‑based login instead of passwords. is there any security considerations I should kno"

Why I asked:
I wanted to check if a PIN‑based approach was reasonable for this project.

JWT Token Usage
What I asked:
"What are JWT access tokens n how are they usually created and validated in FastAPI?"

Why I asked:
I needed a clearer picture of how JWTs store user identity and how to verify them in protected routes.

Dependency Injection in FastAPI
What I asked:
"explain how FastAPI dependencies work, especially for getting the currently authenticated user?"

Why I asked:
I was learning how Depends() could help manage authentication and database sessions cleanly.

SQLModel and Database Sessions
What I asked:
"how do i handle database sessions when using SQLModel with FastAPI?"

Why I asked:
I wanted to confirm I was following good practices for opening and closing database sessions safely.

Role‑Based Access Control
What I asked:
"How to create and enforce role‑based access control in FastAPI—like restricting certain endpoints to admins only?"

Why I asked:
I needed guidnce on how to logically protect admin‑only routes.


Error Handling and Status Codes
What I asked:
"What HTTP staus codes should I return for authentication errors—like wrong credentials or unauthorized access?"

Why I asked:
I wanted my API responses to follow standard conventions.

Rate Limiting / Login Attempts
What I asked:
"For a login system, how do i track or limit failed login attempts?"

Why I asked:
I wanted a login limit

CORS Configuration
What I asked:
"What exactly is CORS in the context of a FastAPI backend, and when do I need to configure it?"

Why I asked:
I wanted to understand why and when CORS middleware might be necessary, regardless of the frontend I'd use later.

Debugging Runtime and Endpoint Errors
What I asked:
"Im getting errors while testing my API endpoints. I uploaded my whole main.py file, take a look and help me spot what the issue is"

ChatGPT then rewrite my entire code whcich i didt want so i used this prompt instead:

"Im getting errors while testing my API endpoints. I uploaded my whole main.py file, take a look and help me spot what the issue is. dont rewrite my code.

Why I asked:
I needed help diagnosing specific runtime issues in my backend. The AI reviewed the file, pointed out mistakes, and suggested fixes while keeping my structure intact.

Summary
I used the AI tool mainly as a learning support to:

Get clarity on backend concepts

Understand framework features better

Debug runtime and endpoint errors

Learn about best practices

All the final code, architecture decisions, and implementation details were written and put together by me. The AI didn’t build the project for m t helped me understand and correct things along the way.
