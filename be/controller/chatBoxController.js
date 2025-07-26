const Vehicle = require('../models/Vehicle.js');
const dotenv = require('dotenv');
dotenv.config();

// Suggest cars based on user message using Gemini API
exports.getSuggestCarBaseOnUserNeed = async (req, res) => {
    try {
        const userMessage = req.body.message;
        const vehicles = await Vehicle.find(
            {
                approvalStatus: 'approved',
                status: 'available',
            },
            {
                brand: 1,
                location: 1,
                pricePerDay: 1,
                seatCount: 1,
                fuelType: 1,
            }
        ).lean();

        // Construct the system prompt with available vehicles
        // The prompt now instructs the model to ALWAYS return a JSON object,
        // either with a 'cars' array or a 'text' string.
        const systemPrompt = `
You are a helpful assistant that helps customers choose suitable rental cars based on their needs.
Always return a JSON object.

If the user's message is a car rental request and you find matching cars from the list, return a JSON object with a 'cars' key containing an array of recommended cars. Only include cars that match the user's criteria.
Example: {"cars": [{"_id": "...", "brand": "Honda", "location": "City B", "pricePerDay": 60, "seatCount": 4, "fuelType": "Petrol"}]}

If the user's message is a car rental request but no cars match the criteria, return a JSON object with a 'text' key containing a helpful text reply explaining that no matching cars were found.
If the message is unrelated to car rentals (e.g., asking for general knowledge, tips, or facts), provide a direct and helpful answer to that specific question, wrapped in a JSON object with a 'text' key.
Example: {"text": "To play the piano, start by learning basic scales and chords..."}
Example: {"text": "We offer a wide range of vehicles for rent. How can I help you find the perfect car today?"}

Here is the list of available cars (as JSON):
${JSON.stringify(vehicles)}
`;

        // Prepare the chat history for the Gemini API
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: systemPrompt }] }); // System prompt as a user message to guide the model
        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

        const payload = {
            contents: chatHistory,
            // Use generationConfig to strictly enforce JSON output.
            // The schema now allows for either a 'cars' array or a 'text' string within the top-level object.
            generationConfig: {
                responseMimeType: "application/json", // Request JSON output
                responseSchema: { // Define the expected JSON schema
                    type: "OBJECT",
                    properties: {
                        "cars": {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    "_id": { "type": "STRING" },
                                    "brand": { "type": "STRING" },
                                    "location": { "type": "STRING" },
                                    "pricePerDay": { "type": "NUMBER" },
                                    "seatCount": { "type": "NUMBER" },
                                    "fuelType": { "type": "STRING" }
                                },
                                required: ["_id", "brand", "location", "pricePerDay", "seatCount", "fuelType"]
                            }
                        },
                        "text": { "type": "STRING" } // Changed from "message" to "text"
                    },
                    // No 'required' at the top level, as either 'cars' or 'text' will be present based on the prompt's instruction.
                    // The model is instructed to provide one of these two keys.
                }
            }
        };

        const apiKey = process.env.GEMINI_API_KEY || ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        let content = '';
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            content = result.candidates[0].content.parts[0].text;
        } else {
            // If the AI doesn't return a candidate or the structure is unexpected,
            // it might mean it couldn't generate a valid JSON based on the schema,
            // or there was an internal model error.
            console.error("Unexpected Gemini API response structure or no content:", result);
            return res.status(500).json({ text: "Failed to get a valid response from AI. It might not have been able to generate a JSON response for this request." });
        }

        // Parse the content, which is now guaranteed to be JSON by generationConfig
        try {
            const parsed = JSON.parse(content);
            // Check if it's a car array or a text message object
            if (parsed.cars) {
                return res.status(200).json(parsed.cars); // Return the array of cars directly
            } else if (parsed.text) { // Changed from parsed.message to parsed.text
                return res.status(200).json({ text: parsed.text }); // Return the text message object
            } else {
                // Fallback if the JSON is valid but doesn't contain expected keys
                console.warn("AI returned valid JSON but without 'cars' or 'text' key:", parsed);
                return res.status(200).json({ text: "I received an an unexpected response from the AI. Please try again." });
            }
        } catch (err) {
            // This catch block should ideally not be hit if responseMimeType is working as expected
            console.error("Failed to parse AI response as JSON despite generationConfig:", content, err);
            return res.status(500).json({ text: "Internal server error: AI response was not valid JSON." });
        }
    } catch (error) {
        console.error("Error in getSuggestCarBaseOnUserNeed:", error);
        return res.status(500).json({ text: "Internal server error" });
    }
};