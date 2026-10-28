# SkillSwap: Peer-to-Peer Skill Exchange

Students exchange skills instead of paying for tutoring. Teach a session, earn 1 credit, spend it learning from someone else.

## Features
- Register / Login with bcrypt password hashing and JWT
- Admin and User roles (role-based access, protected routes)
- Add skills with proof (file upload or link); admin approves or rejects
- Verified skill profiles with ratings
- Skill matching (teach vs want-to-learn, mutual matches first)
- Availability slots, session booking with meeting link
- Learning credits (2 free on signup, +1 teaching, -1 learning)
- Session completion, feedback and ratings
- Admin dashboard: stats, skill reviews, users
- Central error handler, input sanitization, request logging (morgan), EventEmitter notifications

## Tech stack
- Backend: Node.js, Express.js, JSON file storage (fs module)
- Auth and uploads: jsonwebtoken, bcryptjs, multer
- Extras: cors, dotenv, morgan, nodemon
- Frontend: HTML, CSS, Vanilla JavaScript, Bootstrap, Fetch API

## Folder structure
```
skillswap/
├── backend/
│   ├── server.js
│   ├── .env
│   ├── data/          (users, skills, sessions, feedback as JSON)
│   ├── uploads/       (proof files)
│   ├── routes/
│   ├── controllers/
│   ├── middleware/    (auth, role, upload, sanitize, error)
│   └── utils/         (fileDB.js, events.js)
└── frontend/
    ├── index.html, login.html, register.html
    ├── dashboard.html, skills.html, sessions.html, admin.html
    ├── css/style.css
    └── js/            (api.js, layout.js, auth.js, dashboard.js, skills.js, sessions.js, admin.js)
```

## How to run
1. Open the `skillswap` folder in VS Code.
2. Open a terminal and start the backend:
   ```
   cd backend
   npm install        (only the first time on a new machine)
   npm run dev
   ```
   You should see: `Server running on port 5000`
3. Keep that terminal running. In VS Code, right-click `frontend/index.html` and choose **Open with Live Server**.
4. The site opens in the browser.

## .env (backend/.env)
```
PORT=5000
JWT_SECRET=skillswap_secret_key_change_me
ADMIN_EMAIL=admin@skillswap.com
```
Registering with the ADMIN_EMAIL creates the admin account.

## Demo flow
1. Register admin (admin@skillswap.com) and two students.
2. Student A adds a teach skill with proof; Student B adds the same skill as learn.
3. Admin logs in and approves A's skill.
4. A creates a slot with a meeting link; B sees the match and books it.
5. A marks the session complete; credits move; B rates the session.

## API overview
| Area | Endpoints |
|---|---|
| Auth | POST /api/auth/register, POST /api/auth/login, GET /api/auth/me |
| Skills | POST /api/skills, GET /api/skills/my |
| Admin | GET /api/admin/skills, PUT /api/admin/skills/:id, GET /api/admin/users, GET /api/admin/stats |
| Match | GET /api/match |
| Sessions | POST /api/sessions/availability, GET /api/sessions/available, POST /api/sessions/:id/book, GET /api/sessions/my, PUT /api/sessions/:id/complete |
| Feedback | POST /api/feedback/:sessionId, GET /api/feedback/teacher/:teacherId |
| Profile | GET /api/profile/:userId |

## Future scope
MongoDB instead of JSON files, React frontend, real-time chat and video, email notifications, cloud file storage, deployment.