"use client"
import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true});


const items = async (image) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Return a json structure based on the requirement of the user. Return nothing else.",
        },
        {
          role: "user",
          content:
            "Create a json structure for all the items and their number in the image. Return only the json structure.",
        },
        {
          role: "system",
          content: "image_url:" + image,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching items:", error);
    return null;
  }
};

export default items;
