# Team Task Manager (MERN)

Full-stack team task management app built with **MongoDB Atlas, Express, React + Vite, Node.js**, JWT auth, bcryptjs, Tailwind CSS.

## Features

- JWT authentication (register, login, logout, `/me`)
- Role-based access (admin / member)
- Projects: create, edit, delete, add/remove members
- Tasks: create, assign, update status, delete, filter, sort, due dates, overdue highlighting
- Dashboard with stats + pie chart (Recharts)
- Responsive sidebar layout, modals, toasts
- Clean MVC backend with validation + error handling

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios, react-hot-toast, Recharts
- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs, express-validator, cors, morgan
- **Database**: MongoDB Atlas

## Folder Structure

```
team-task-manager/
├── server/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── .env.example
└── client/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── routes/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── .env.example
```

## Installation

### 1. Clone & install
```bash
git clone <repo>
cd team-task-manager

cd server && npm install
cd ../client && npm install
```

### 2. Environment variables

**server/.env**
```
PORT=5000
MONGO_URI=<your mongodb atlas connection string>
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run
```bash
# in /server
npm run dev

# in /client (separate terminal)
npm run dev
```

App: http://localhost:5173 · API: http://localhost:5000

## API Endpoints

### Auth
| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET  | `/api/auth/me` | auth |

### Projects
| Method | Path | Access |
|---|---|---|
| GET | `/api/projects` | auth |
| GET | `/api/projects/:id` | auth (member/admin) |
| POST | `/api/projects` | admin |
| PUT | `/api/projects/:id` | admin |
| DELETE | `/api/projects/:id` | admin |
| POST | `/api/projects/:id/members` | admin |
| DELETE | `/api/projects/:id/members/:userId` | admin |

### Tasks
| Method | Path | Access |
|---|---|---|
| GET | `/api/tasks?project=&status=&sort=dueDate` | auth |
| GET | `/api/tasks/:id` | auth |
| POST | `/api/tasks` | admin |
| PUT | `/api/tasks/:id` | admin (all fields), member (own status) |
| DELETE | `/api/tasks/:id` | admin |

Send `Authorization: Bearer <token>` for protected routes.

## MongoDB Atlas Setup

1. Create free cluster: https://www.mongodb.com/cloud/atlas
2. **Database Access** → create a user (username + password)
3. **Network Access** → add IP `0.0.0.0/0` (or your Railway egress IPs)
4. **Connect → Drivers** → copy the connection string, replace `<password>` and database name
5. Paste into `MONGO_URI` in `server/.env`

## Railway Deployment

### Backend
1. Push the `server/` folder to a GitHub repo (or use a monorepo with **Root Directory** set to `server`)
2. New Project → Deploy from GitHub → pick repo
3. Set **Root Directory**: `server`
4. **Variables**: add `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV=production`
5. Build command: `npm install` · Start command: `npm start`
6. Railway provides `PORT` automatically — `server.js` already uses `process.env.PORT`

### Frontend
1. Same or separate repo for `client/`
2. New service → set **Root Directory**: `client`
3. **Variables**: `VITE_API_URL=https://<your-backend>.up.railway.app/api`
4. Build command: `npm install && npm run build`
5. Start command: `npm run preview`
6. After backend deploy, update `CLIENT_URL` on the backend to the frontend's Railway URL for CORS

### Alternative (recommended for frontend)
Deploy frontend to **Vercel** or **Netlify** (static, free), backend to Railway.

## Security Notes

- Passwords hashed with bcryptjs (10 rounds)
- JWT stored in `localStorage`; for production consider httpOnly cookies
- Input validation via `express-validator`
- CORS restricted to `CLIENT_URL`
- Use a strong `JWT_SECRET` (32+ random chars)

## Screenshots

_(Add screenshots of Dashboard, Projects, Project Detail, Tasks pages here.)_

## License

MIT
