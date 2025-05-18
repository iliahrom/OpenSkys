# OpenSkys – Drone Delivery Management System

🚀 A complete web-based platform for controlling, monitoring, and configuring drone flight points in real time.  
Built with React (Frontend), Node.js + Express (Backend), and MySQL (Database).  
Designed for practical classroom demonstrations using DJI Tello drones.

---

## 📦 Features

- ✅ **User Authentication & Role Management**
  - Admin / Standard user roles
  - Secure session handling with `express-session`

- 🧭 **Flight Point Setup**
  - Manual setup of relative positions from BASE point
  - Custom command sequences per point
  - Visual point selection with real-time grid interaction

- 📡 **Drone Command Control**
  - Sends commands (via backend) to drone
  - Executes: takeoff, land, movement, and rotation commands
  - Ensures `command` is always first per Tello SDK requirements

- 🧑‍💼 **Admin Control Panel**
  - Manage drones, users, and flight routes
  - Toggle inactive users and audit changes

- 📊 **Future Modules (Planned)**
  - Real-time telemetry & battery info
  - Flight history log & reporting
  - Dynamic route optimization

---

## 🛠 Technologies Used

| Layer        | Stack                          |
|--------------|--------------------------------|
| Frontend     | React, CSS Modules             |
| Backend      | Node.js, Express               |
| Database     | MySQL                          |
| Auth         | Sessions + Middleware          |
| Drone SDK    | UDP commands (Tello protocol)  |

---

## 🚀 Getting Started

### 1. Clone the repository:
```bash
git clone https://github.com/iliahrom/OpenSkys.git
cd OpenSkys
