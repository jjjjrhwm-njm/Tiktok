const { WebcastPushConnection } = require('tiktok-live-connector');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// --- إعدادات الحساب ---
// استبدل "اسم_حسابك" بيوزرك في تيك توك بدون @
let tiktokUsername = "اسم_حسابك"; 

let tiktokChatConnection = new WebcastPushConnection(tiktokUsername);

// ربط "العقل" (Groq)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

tiktokChatConnection.connect().then(state => {
    console.info(`✅ متصل الآن ببث: ${state.roomId}`);
}).catch(err => {
    console.error('❌ فشل الاتصال (تأكد أنك فاتح لايف حالياً):', err);
});

// استقبال التعليقات والرد عليها
tiktokChatConnection.on('chat', async (data) => {
    console.log(`💬 ${data.nickname}: ${data.comment}`);

    // التعليمات للشخصية في البث
    const prompt = `أنت مساعد ذكي في بث تيك توك لـ راشد. المستخدم ${data.nickname} يقول: ${data.comment}. رد عليه بالعربية بأسلوب تفاعلي ومختصر جداً يليق بالبث المباشر.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        const reply = completion.choices[0].message.content;
        console.log(`🤖 الرد الذكي: ${reply}`);
        
        // ملاحظة: تيك توك لا يسمح للبوت بالكتابة في الشات تلقائياً (تحتاج صلاحيات خاصة)
        // لذا سنستخدم هذا الرد لاحقاً لتحويله لصوت (TTS) يسمعه الناس في البث
    } catch (e) {
        console.log("⚠️ خطأ في معالجة الرد");
    }
});

// استقبال الهدايا
tiktokChatConnection.on('gift', data => {
    console.log(`🎁 شكر خاص لـ ${data.nickname} على هدية ${data.giftName}!`);
});

app.get('/', (req, res) => res.send('بث تيك توك نشط وجاهز للذكاء الاصطناعي!'));
app.listen(port, () => console.log(`السيرفر يعمل على منفذ ${port}`));
