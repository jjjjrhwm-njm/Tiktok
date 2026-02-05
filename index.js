const { WebcastPushConnection } = require('tiktok-live-connector');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// --- إعدادات الحساب (تم التصحيح للأحرف الصغيرة) ---
let tiktokUsername = "njm_rj"; 

let tiktokChatConnection = new WebcastPushConnection(tiktokUsername);

// ربط "العقل" الذكي باستخدام المفاتيح التي أضفتها في Render
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// محاولة الاتصال بالبث المباشر
tiktokChatConnection.connect().then(state => {
    console.info(`✅ متصل الآن ببث الحساب: ${tiktokUsername}`);
}).catch(err => {
    console.error('❌ فشل الاتصال! تأكد أنك فاتح بث مباشر (Live) حالياً في تيك توك:', err);
});

// ١. استقبال التعليقات والرد عليها ذكياً
tiktokChatConnection.on('chat', async (data) => {
    console.log(`💬 ${data.nickname}: ${data.comment}`);

    // التعليمات الموجهة للذكاء الاصطناعي (Prompt)
    const prompt = `أنت مساعد ذكي ومرح في بث تيك توك الخاص بـ "نجم الإبداع" راشد. المستخدم ${data.nickname} يقول: "${data.comment}". رد عليه بالعربية بأسلوب تفاعلي، قصير جداً، ومناسب لأجواء البث المباشر.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        
        const reply = completion.choices[0].message.content;
        console.log(`🤖 الرد الذكي المقترح: ${reply}`);
    } catch (e) {
        console.log("⚠️ عذراً، حدث خطأ في معالجة الرد الذكي.");
    }
});

// ٢. التفاعل مع الهدايا (Gifts)
tiktokChatConnection.on('gift', data => {
    console.log(`🎁 شكر خاص لـ ${data.nickname} على هدية ${data.giftName}!`);
});

// إعداد صفحة السيرفر الأساسية
app.get('/', (req, res) => res.send(`بوت تيك توك الخاص بـ ${tiktokUsername} يعمل بنجاح!`));

app.listen(port, () => {
    console.log(`🚀 السيرفر يعمل الآن على المنفذ: ${port}`);
});
