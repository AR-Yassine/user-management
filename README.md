This project is a User Management Portal built with Angular (standalone components) to demonstrate frontend architecture, state management, UI/UX quality, caching, and error handling.

The application includes:

Paginated users list (cards + table)

User details page

Instant search by user ID

Add / Edit / Delete users

Client-side caching

Global loading indicator

Clean, responsive UI using Angular Material

During development, direct API calls were blocked due to:

CORS restrictions

403 Forbidden responses

Cloudflare / browser security limitations in local environments

I attempted multiple solutions, including:

Direct HTTP calls

Angular proxy configuration

Local Node/Express proxy server

Despite these attempts, the API remained inaccessible in a reliable way.

Final Solution (Professional Approach)

To ensure the task could be completed without breaking requirements, I implemented:

Graceful fallback to mock users (assets/mock-users.json)

Same response structure as ReqRes API

Transparent switching logic:

API is attempted first

If it fails → mock data is used automatically

No hard dependency on mock data
