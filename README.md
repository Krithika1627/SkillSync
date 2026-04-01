# SkillSync 🚀

SkillSync is a full-stack web application that helps students find project partners based on their skills, manage projects, and collaborate through messaging.

## ✨ Features
- 👤 User registration and profile management
- 🧠 Skill-based user matching
- 📁 Project creation and management
- 📨 Join request system (Accept / Reject)
- 💬 Messaging between users
- 📊 Dashboard with system insights

## 🛠️ Tech Stack
Frontend: React.js, Axios, CSS  
Backend: Node.js, Express.js  
Database: Oracle XE, SQL  

## 📁 Project Structure

```
SkillSync/
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
├── server/
│   └── server.js
├── README.md
└── .gitignore
```

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Krithika1627/SkillSync.git
cd SkillSync
```
### 2. Setup Backend
```bash
cd server
npm install
node server.js
```
### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```
## 🔐 Notes
- Ensure Oracle Database (Oracle XE) is running before starting the backend.
- Update database configuration in backend if required
- Frontend runs on http://localhost:5173
- Backend runs on http://localhost:3000

## 📌 Future Improvements
- Real-time chat using WebSockets
- Secure authentication (JWT)
- Notification system

## 👩‍💻 Author
Krithika V

## 🔗 Repository
https://github.com/Krithika1627/SkillSync
