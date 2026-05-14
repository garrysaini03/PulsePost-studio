import axios from "axios";
import { env } from "../config/env.js";

export const generateCaption = async (req, res) => {
  try {
    const { prompt, platform, tone, keywords } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Please provide a topic/prompt" });
    }

    if (!env.openrouterKey) {
      return res.status(500).json({
        success: false,
        message: "OPENROUTER_API_KEY is missing in the server environment.",
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-oss-20b:free",
        messages: [
          {
            role: "system",
            content: `You are a social media expert. Respond ONLY with a valid JSON array of 3 strings. 
            No conversational text, no markdown backticks. 
            Format: ["caption 1 #tag", "caption 2 #tag", "caption 3 #tag"]`
          },
          {
            role: "user",
            content: `Generate 3 unique and engaging ${tone || 'Casual'} captions for a ${platform || 'Instagram'} video about: "${prompt}". 
            ${keywords ? `Include these keywords: ${keywords}` : ""}
            Include relevant emojis and 5 hashtags at the end of each.`
          }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${env.openrouterKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    let aiRawResponse = response.data.choices[0].message.content;

    const cleanJson = aiRawResponse.replace(/```json|```/g, "").trim();
    
    const finalCaptions = JSON.parse(cleanJson);

    res.status(200).json({
      success: true,
      caption: finalCaptions 
    });

  } catch (error) {
    console.error("AI Error Details:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      message: "AI service failed, please try again.",
      error: error.message 
    });
  }
};
