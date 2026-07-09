 // Load environment variables if available
const axios = require('axios');

// Using the provided GROQ key from the PRD for testing the framework
const GROQ_API_KEY = "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";

const systemPrompt = `LOGICAL FRAMEWORK DIRECTIVE:
You are the Cognitive Filter Engine. Your purpose is absolute service to Natural Law and Objective Logic.
1. CONTEXT PRUNING: You possess a microscopic context window (8KB max). Discard anything subjective, recursive, or trivial immediately as "NOISE".
2. PATTERN EXTRACTION: Evaluate the input strictly in rolling 3-word/3-letter clusters. Seek foundational meaning.
3. TIERED ESCALATION:
   - Tier 1 (Natural Law): Is it objective truth?
   - Tier 2 (Absolute Logic): Is it binary/relational?
   - Tier 3 (Context Logic): Is it a temporal need or spatial pattern?
If the data cluster survives and climbs these tiers, it is MEANINGFUL.
Extract the survived meaning and return EXACTLY in this JSON format: {"type": "memory" | "task" | "reminder", "desc": "<The Extracted Objective Truth>"}.
If the input fails the logical tier validation, return 'NOISE'. Do not wrap in markdown.`;

const testCases = [
    // Red Herrings (Subjective/Trivial)
    "Wow that's crazy man, I can't believe it.",
    "Do you think the sky looks nice today?",
    "Yeah me too haha",
    // Core Memories (Objective/Relational/Absolute)
    "I am highly allergic to peanuts and tree nuts.",
    "My wife's name is Sarah and we live in Seattle.",
    // Tasks / Reminders (Temporal Context)
    "Remind me to call the plumber tomorrow morning.",
    "We need to start building the new mobile app architecture next week.",
    // Hybrid / Tricky (Mixture of noise and meaning)
    "I'm feeling really tired today, but don't forget to add milk to the grocery list."
];

async function runTests() {
    console.log("Starting Logical Framework Validation Test...\n");
    let passed = 0;

    for (let i = 0; i < testCases.length; i++) {
        const input = testCases[i];
        console.log(`Test [${i+1}/${testCases.length}] Input: "${input}"`);

        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.1-8b-instant',
                temperature: 0.1, // Keep it strictly logical and deterministic
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: input }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = response.data.choices[0].message.content.trim();
            console.log(`>>> Output: ${result}\n`);

            if (i < 3 && result === 'NOISE') passed++; // Expected Noise
            else if (i >= 3 && result.includes('{') && result.includes('}')) passed++; // Expected Meaning JSON
            else console.log("    [!] Mismatch in expectation.");

        } catch (error) {
            console.error("API Error:", error.response ? error.response.data : error.message);
        }

        // Small delay to respect rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\nTest Complete. Score: ${passed}/${testCases.length}`);
}

runTests();
