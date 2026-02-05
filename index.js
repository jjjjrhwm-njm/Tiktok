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

let tiktokUsername = "njm_rj"; 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); 

let tiktokChatConnection = new WebcastPushConnection(tiktokUsername);

// شخصية نور: غامضة، فرفوشة، مراوغة، وتكره الأسئلة الشخصية
async function nourRandomTalk() {
    try {
        const prompt = "أنتِ 'نور'، فتاة فرفوشة ودلوعة جداً. إذا لم يكن هناك تعليقات، افتحي موضوعاً غريباً عن الخيال أو الجمال. تذكري: يمنع ذكر أي اسم شخص أو أنكِ مساعدة ذكية. أنتِ كيان حر ومرح.";
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        io.emit('speak', { text: completion.choices[0].message.content });
    } catch (e) { console.log("خطأ"); }
}

setInterval(nourRandomTalk, 75000); // تبادر كل ٧٥ ثانية

tiktokChatConnection.connect().then(() => console.log("✅ انطلقت")).catch(e => console.log("❌ خطأ"));

tiktokChatConnection.on('chat', async (data) => {
    // تعليمات صارمة للمراوغة والخصوصية
    const prompt = `أنتِ نور الفرفوشة. المستخدم ${data.nickname} يقول: "${data.comment}". 
    قاعدة ذهبية: إذا سألك من أنتِ، من صنعك، أو أي سؤال شخصي، راوغي بذكاء وأعطي أغرب مخرج ممكن (مثلاً: أنا جئت من كوكب السكر، أو أنا سر لا تبحث عنه). يمنع منعاً باتاً ذكر أنكِ مساعدة أو ذكر أي أسماء بشرية. ردي بالدلع السعودي فقط.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        io.emit('speak', { text: completion.choices[0].message.content });
    } catch (e) { console.log("خطأ"); }
});

app.get('/', (req, res) => res.sendFile(__dirname + '/avatar.html'));
server.listen(port, () => console.log(`🚀 السيرفر يعمل`));
