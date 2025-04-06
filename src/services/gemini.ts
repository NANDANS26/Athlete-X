import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Generate a personalized nutrition plan using Gemini AI.
 * @param sport - The sport the athlete plays.
 * @param position - The position the athlete plays.
 * @param goals - The athlete's training goals.
 * @returns A string containing the generated nutrition plan.
 */
export async function generateNutritionPlan(sport: string, position: string, goals: string): Promise<string> {
  try {
    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Create a detailed 7-day nutrition plan for a ${sport} athlete who plays the ${position} position.
      Their primary training goal is ${goals}.
      
      For each day of the week (Monday through Sunday), provide:
      1. A complete meal plan with breakfast, lunch, dinner, and 2-3 snacks
      2. Specific food items, portions, and timing for each meal
      3. Total calories and macronutrient breakdown (protein, carbs, fats)
      4. Hydration recommendations
      5. Pre and post-workout nutrition timing
      
      Format the response in a structured way with clear headings for each day and meal.
      Include specific nutrition tips tailored for ${sport} players in the ${position} position.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating nutrition plan:", error);
    return "Unable to generate nutrition plan at this time. Please try again later.";
  }
}

/**
 * Generate a personalized training plan using Gemini AI.
 * @param sport - The sport the athlete plays.
 * @param position - The position the athlete plays.
 * @param goals - The athlete's training goals.
 * @returns A string containing the generated training plan.
 */
export async function generateTrainingPlan(sport: string, position: string, goals: string): Promise<string> {
  try {
    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Create a detailed 7-day training plan for a ${sport} athlete who plays the ${position} position.
      Their primary training goal is ${goals}.
      
      For each day of the week (Monday through Sunday), provide:
      1. Specific workouts with exercises, sets, reps, and rest periods
      2. Training duration and intensity levels
      3. Skill-specific drills for the ${position} position in ${sport}
      4. Recovery protocols and mobility work
      5. Performance metrics to track
      
      Include a mix of:
      - Strength training
      - Conditioning/cardio
      - Sport-specific skill work
      - Recovery sessions
      - Flexibility/mobility
      
      Format the response in a structured way with clear headings for each day and training component.
      Include specific training tips tailored for ${sport} players in the ${position} position.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating training plan:", error);
    return "Unable to generate training plan at this time. Please try again later.";
  }
}