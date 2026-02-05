const { WebcastPushConnection } = require('tiktok-live-connector');
const Groq = require("groq-sdk");
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server); // لربط الجوال بالسيرفر لحظياً
const port = process.env.PORT || 10000;

let tiktokUsername = "njm_rj"; // حسابك المصحح
let tiktokChatConnection = new WebcastPushConnection(tiktokUsername);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

tiktokChatConnection.connect().then(state => {
    console.info(`✅ متصل ببث: ${tiktokUsername}`);
}).catch(err => console.error('❌ تأكد من فتح البث'));

tiktokChatConnection.on('chat', async (data) => {
    // إرسال التعليق لـ Groq للحصول على رد أنثوي لبق
    const prompt = `أنتِ مقدمة بث سعودية واقعية جداً. ردي على ${data.nickname} الذي يقول: "${data.comment}". اجعلي الرد قصيراً، ذكياً، وباللهجة البيضاء السعودية.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        const reply = completion.choices[0].message.content;
        
        // إرسال الرد فوراً لصفحة الويب (الجوال) ليتم نطقه وتحريك الشخصية
        io.emit('speak', { text: reply, user: data.nickname });
        console.log(`🤖 الرد المرسل للجوال: ${reply}`);
    } catch (e) { console.log("⚠️ خطأ في العقل"); }
});

app.get('/', (req, res) => res.sendFile(__dirname + '/avatar.html'));
server.listen(port, () => console.log(`🚀 السيرفر جاهز على منفذ ${port}`));
