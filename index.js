// ... (الأكواد العلوية تبقى كما هي)
tiktokChatConnection.on('chat', async (data) => {
    // نبرة الشخصية: فضولية، مرحة، محبة، ولبقة جداً مع النساء
    const prompt = `أنتِ "نور"، مقدمة بث ذكية وفضولية ومرحة جداً. المستخدم ${data.nickname} قال: "${data.comment}". ردي عليه بأسلوب محب كأنكِ صديقة مقربة، استخدمي كلمات ترحيبية سعودية، وكوني قصيرة ومبادرة بسؤال في نهاية ردك.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        io.emit('speak', { text: completion.choices[0].message.content });
    } catch (e) { console.log("⚠️ خطأ"); }
});

// ميزة المبادرة: الترحيب بكل من يدخل البث فوراً
tiktokChatConnection.on('member', (data) => {
    const welcomeText = `أهلاً بكِ يا ${data.nickname}، نورتِ بثنا! كيف حالك اليوم؟`;
    io.emit('speak', { text: welcomeText });
});
// ... (بقية الكود)
