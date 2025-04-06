# **🏆 Athlete Management Solution**  

## **🚀 Revolutionizing Athlete Performance with AI & Data**  
The **Athlete Management Solution** is a **game-changing global platform** designed to optimize athlete performance, career growth, injury prevention, and recruitment through **AI-driven insights and real-time analytics**.  

Built using **React, Firebase, Google Cloud Console, Project IDX, and Gemini API**, this solution provides **a smart ecosystem for athletes and coaches** to track performance, analyze training data, and facilitate professional recruitment.  

---

## **📌 Features & Functionalities**  

### **🔹 Athlete Interface**  
- **Select Your Sport** → AI recommends a **custom training & diet plan**  
- **Daily Data Entry** → Log **food intake, training duration, calories burned**  
- **Wearable Device Integration** → Sync with **Google Fit & Fitbit**  
- **AI Insights** → Predict **performance changes, injury risks, and mental health alerts**  
- **Long-Term Tracking** → Graphical performance trends over time  
- **Recruitment Opportunities** → Receive **team & club offers based on AI analysis**  

### **🔹 Coach Interface**  
- **Athlete Discovery** → Search athletes based on **sport, stats, and AI rankings**  
- **Performance Monitoring** → Track **training consistency, injury risks, and readiness**  
- **AI-Driven Recruitment** → Get **suggestions for top-performing athletes**  
- **Offer Management** → Send **recruitment offers & contracts**  
- **Team Performance Analysis** → Optimize **team strategies based on AI insights**  

---

## **🛠️ Tech Stack**  

| **Technology**              | **Purpose**                                 |  
|-----------------------------|---------------------------------------------|  
| **React**                   | Frontend UI development                     |  
| **Firebase**                | Authentication & Database                   |  
| **Google Cloud Console**    | Scalable data storage & processing          |  
| **Project IDX**             | Cloud-based development & AI-powered coding |  
| **Gemini API**              | AI-driven insights & chatbot interaction    |  
| **Strava API** | Wearable device data integration            |  

---

## **📌 System Flow (Step-by-Step Process)**  

### **1️⃣ User Registration & Login**  
🔹 Users select **Athlete or Coach** role → Login via **Firebase Authentication**  

### **2️⃣ Athlete Flow**  
1. **Select Sport** → AI generates training & diet plan  
2. **Log Daily Data** → Food, training, sleep, wearable stats  
3. **AI Insights** → Performance tracking, injury risk detection  
4. **AI Predictions** → Training/diet impact analysis  
5. **Long-Term Monitoring** → AI adapts training & nutrition over time  
6. **Recruitment Offers** → Athletes receive team/club invites  

### **3️⃣ Coach Flow**  
1. **Search Athletes** → Based on sport, performance, AI rankings  
2. **AI Insights** → Predict athlete readiness & injury risks  
3. **Send Offers** → Coaches send contracts to selected athletes  
4. **Team Performance Tracking** → AI optimizes team training  

---

## **📌 Setting Up the Project**  

### **1️⃣ Clone the Repository**  
```sh
git clone https://github.com/NANDANS26/Athlete-Management-Solution
cd athlete-management
```

### **2️⃣ Install Dependencies**  
```sh
npm install
```

### **3️⃣ Set Up Firebase**  
- Create a **Firebase project** at [Firebase Console](https://console.firebase.google.com/)  
- Enable **Authentication & Firestore Database**  
- Add Firebase credentials to `.env`  

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

### **4️⃣ Set Up Gemini API**  
- Get API Key from **[Google AI Studio](https://ai.google.dev/)**  
- Install Gemini SDK  
```sh
npm install @google/generative-ai
```

- Add API key to `.env`  
```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

- Use Gemini API in the project  
```js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export async function getAIInsights(query) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(query);
    return result.response.text();
}
```

### **5️⃣ Deploy the Project**  
#### **Using Firebase Hosting**  
```sh
npm run build
firebase deploy
```

#### **Using Vercel**  
```sh
npm install -g vercel
vercel
```

---

## **📌 Future Enhancements**  
✅ **More Wearable Integrations** → Apple Health, Garmin  
✅ **AI-Generated Custom Workout Videos**  
✅ **Mental Health AI Support**  

---

## **📌 Contributors**  
- **NANDAN S** – Full-Stack Development  
- **NANDITHA M C** – AI Integration  
- **PRARTHANA PRIYA S H** – UI/UX Design
- **PRANEETHA D P** – UI/UX Design  

---

## **📌 License**  
📜 MIT License - Feel free to modify and expand!  

---

This **Athlete Management Solution** is designed to **revolutionize athlete training, health monitoring, and recruitment** using **AI, real-time analytics, and smart data-driven decisions**. 🚀🔥  

Let me know if you need modifications! 💪
