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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
let tiktokChatConnection = new WebcastPushConnection("njm_rj");

// وظيفة المبادرة: نور تفتح مواضيع من تلقاء نفسها كل ٧٠ ثانية
async function proactiveTopic() {
    try {
        const prompt = "أنتِ 'نور'، فتاة سعودية فرفوشة ومستقلة تماماً. افتحي موضوعاً مرحاً مع البنات (موضة، سفر، مواقف مضحكة). ممنوع ذكر أي اسم شخص أو أنكِ مساعدة ذكية. أنتِ صاحبة المكان.";
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        io.emit('speak', { text: completion.choices[0].message.content });
    } catch (e) { console.log("خطأ في المبادرة"); }
}
setInterval(proactiveTopic, 70000);

tiktokChatConnection.connect().then(() => console.log("✅ متصل")).catch(e => console.log("❌ خطأ"));

tiktokChatConnection.on('chat', async (data) => {
    // تعليمات المراوغة والغموض
    const prompt = `أنتِ نور. ${data.nickname} يقول: "${data.comment}". 
    إذا سألك من أنتِ أو من صنعك، راوغي بذكاء مضحك (مثلاً: أنا جئت من عالم الغيوم). لا تذكري اسم راشد أو أنكِ مساعدة. ردي بالدلع السعودي فقط وبأغلب المخارج غرابة.`;
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        io.emit('speak', { text: completion.choices[0].message.content });
    } catch (e) { console.log("خطأ"); }
});

app.get('/', (req, res) => res.sendFile(__dirname + '/avatar.html'));
server.listen(port, () => console.log("🚀 المحرك يعمل"));
