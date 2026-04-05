# 🧮 React Calculator (Containerized)

A simple calculator built with React and Vite, optimized for deployment using Docker and Nginx.

## 🌟 Why I Built This
I started this project following a YouTube tutorial by WebDevSimplified, but I felt the original implementation was incomplete. I modified the logic and added several features of my own to make it more like what an actual physical calculator does.

### My Modifications:
- **Improved Logic:** Added features for handling improper syntax (like pressing a negative (-) sign before a number), which was missing in the original video.
- **Modern Build Tooling:** Migrated the project to Vite for better performance.
- **Containerization:** Implemented a multi-stage Docker build to keep the production image under 30MB.

## 🛠️ Tech Stack
- **Frontend:** React, Vite
- **Web Server:** Nginx (Alpine-based)
- **DevOps:** Docker, Docker Compose

## 🚀 How to Run
This app is fully containerized. You don't need to install Node.js locally.

1. Ensure you have **Docker** installed.
2. Clone this repo: `git clone https://github.com/jim-long-dev/react-simple-calculator`
3. Run: `docker-compose up`
4. Visit `http://localhost:8080` in your browser.

---
*Created as part of my learning journey into Web Development, Cloud Infrastructure and DevOps.*
