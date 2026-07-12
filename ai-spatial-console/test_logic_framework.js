const axios = require('axios');
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || 'MISSING_KEY';

const systemPrompt = `LOGICAL FRAMEWORK:
1. Micro window (8KB). Noise = subjective.
2. Pattern = foundational meaning.
3. Tiers: Natural Law -> Logic -> Context.
Return JSON: {"type": "memory"|"task"|"reminder", "desc": "..."} or 'NOISE'.`;

const testCases = ["Wow crazy!", "I am allergic to peanuts.", "Call plumber tomorrow."];

async function runTests() {
    for (const input of testCases) {
        try {
            const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: input }]
            }, { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` } });
            console.log(`Input: ${input} -> ${res.data.choices[0].message.content.trim()}`);
        } catch (e) { console.error(e.message); }
    }
}
runTests();
