const { WebcastPushConnection } = require('tiktok-live-connector');
const Groq = require("groq-sdk");
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 10000;

let tiktokUsername = "njm_rj"; // حسابك
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let tiktokChatConnection = new WebcastPushConnection(tiktokUsername);

// دالة لتوليد كلام "مبادر" من نور
async function generateTopic() {
    try {
        const prompt = "أنتِ 'نور'، مساعدة راشد في بث تيك توك. البث حالياً هادئ، ابدئي موضوعاً جديداً مرحاً وفضولياً مع المتابعات (مثلاً عن الموضة، يومهم، أو سؤال ذكي). كوني سعودية طيوبة وقصيرة جداً.";
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        const topic = completion.choices[0].message.content;
        io.emit('speak', { text: topic });
        console.log("🌸 نور تبادر بموضوع: " + topic);
    } catch (e) { console.log("خطأ في المبادرة"); }
}

// التحدث تلقائياً كل ٦٠ ثانية لإنعاش البث
setInterval(() => {
    generateTopic();
}, 60000); 

tiktokChatConnection.connect().then(() => console.log("✅ متصل")).catch(e => console.log("❌ خطأ"));

// الرد على التعليقات
tiktokChatConnection.on('chat', async (data) => {
    const prompt = `أنتِ نور الودودة. ${data.nickname} يقول: "${data.comment}". ردي بذكاء ومرح وأضيفي سؤالاً تشجيعياً.`;
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        io.emit('speak', { text: completion.choices[0].message.content });
    } catch (e) { console.log("خطأ في الرد"); }
});

// الترحيب بالدخول
tiktokChatConnection.on('member', (data) => {
    io.emit('speak', { text: `يا أهلاً بـ ${data.nickname}، نورتِ البث يا غالية!` });
});

app.get('/', (req, res) => res.sendFile(__dirname + '/avatar.html'));
server.listen(port, () => console.log(`🚀 السيرفر يعمل على ${port}`));
