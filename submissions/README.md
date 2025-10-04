# Health Assessment AI 🚑✨

An **AI-driven personalized health assessment app** that predicts diabetes risk based on user health indicators.
Built with **React + Supabase + TensorFlow.js**, this app provides actionable insights, secure data storage, and automated workflows.

---

## 🚀 Features

* 🔐 **User Authentication** via Supabase
* 🤖 **On-device AI predictions** with TensorFlow.js (client-side, fast & private)
* 📊 **Diabetes risk assessment** with risk level, key factors, and recommendations
* 💾 **Save assessments** to user dashboard (requires login)
* ⚡ **Make.com workflow integration** for external automation
* 🎨 **Modern UI** with Tailwind CSS + Lucide icons

---

## 👥 Team ID: T101

| Team Member       | Role                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| **Kriti Mahajan** | Team Leader – AI model development & Make.com AI workflow integration |
| **Bhavisha**      | GitHub & Web Development – Repository management & core web app       |
| **Kartik**        | Designing & Web Development – UI/UX & frontend implementation         |
| **Krish**         | Designing & Presentation – Visual design & final presentation         |

---

## 🧩 Problem Statement

Develop an **AI-powered personalized health assessment app** that:

* Predicts **diabetes risk** based on user health indicators
* Provides **actionable insights** & recommendations
* Integrates **AI models, workflows, and user history tracking**

---

## 🛠️ Tech Stack

* **Frontend:** React (TypeScript)
* **Backend & Auth:** Supabase
* **AI & ML:** TensorFlow.js (Client-side inference)
* **Automation:** Make.com webhook integration
* **UI:** Tailwind CSS + Lucide Icons

---

## ⚙️ Setup & Running Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Model Hosting

* Place the **pre-trained TensorFlow.js model** files (`model.json` and weight files) inside:

```
/public/model/
```

### 4. Configure Supabase

* Create a **Supabase project**.
* Add `.env` file in root with:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

* Set up authentication & create an **assessments** table in your database.

### 5. Configure Make.com Webhook

* Replace placeholder webhook URL with your **actual Make.com webhook** in the code.

### 6. Run Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 📌 Important Notes

* 🔑 User **must be logged in** to save assessments.
* ⚡ Model inference runs **locally on the device** (private & fast).
* 🔗 Webhook integration allows automation via Make.com.
* 🔒 Keep API keys & webhook URLs **secure**.

---

## 📞 Contact & Contributions

* Raise issues & PRs via **GitHub Issues**.
* Contact **Kriti Mahajan (Team Lead)** through repository channels.

💡 *If you found this project useful, don’t forget to give it a ⭐️!*

---

## ⚠️ Disclaimer

> This app is **to assist not replace qualified healthcare professionals**
> Always consult a **qualified healthcare professional** for medical concerns.

---
