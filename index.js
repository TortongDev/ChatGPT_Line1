const axios = require('axios');
const line = require('@line/bot-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const configuration = new Configuration({
    apiKey: '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',
});
const config = {
    channelAccessToken: "xinEwgXrgsMivvtRQHHdqm+U4yF/8FV/cFYgsQn0q7Jg9NH4O1zlt0ppu5NrH72ab0REuGWO9kz4T0qmOs70xJDG10Tri7u4FcMJ/NJUnjIUu8Nup3D0kfR8k6ROxUlZJPL4X6aYHMuT6Zb7x3MvJAdB04t89/1O/w1cDnyilFU=",
    channelSecret: "a51d527a1b6c37f2c64d111a8ffef09f",
    
};
const openai = new OpenAIApi(configuration);
const webApp = express();
const PORT = 8000;
webApp.use(express.urlencoded({ extended: true }));
webApp.use(express.json());
webApp.use((req, res, next) => {
    next();
});
webApp.get('/', (req, res) => {
    res.sendStatus(200);
});

// webApp.use(bodyParser.json());
const client = new line.Client(config);
// Middleware สำหรับ parse JSON
webApp.use(express.json());

// Route สำหรับรับ webhook จาก LINE Messaging API
webApp.post('/webhooks', async (req, res) => {
    res.sendStatus(200);
    // ดึง event จาก request body
    const event = req.body.events[0];
    // ถ้า event เป็น message และมี type เป็น text
    if (event.type == 'message' && event.message.type == 'text') {
        // ดึงข้อความจาก event
        const texts = event.message.text;
        // ใช้ OpenAI API สร้างข้อความตอบกลับ
        const responseS = await openai.createCompletion({

            model: 'text-davinci-003',
            prompt: `Human: ${texts}\nAI:`,
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.9,
            stop: ['Human:', 'AI:']
        });        
        console.log('ข้อความที่ส่ง : '+ texts);
        console.log('รูปแบบข้อความที่ส่ง : ' + event.message.type);
        console.log('\nข้อความตอบกลับ : ' + responseS.data.choices[0].text.trim());
        // ส่งข้อความตอบกลับไปยังผู้ใช้
        await client.replyMessage(event.replyToken, {
        type: 'text',
        text: responseS.data.choices[0].text.trim(),
        });
    }

    });
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});