import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function cleanGeminiResponse(response: string): string {
  // Remove markdown code blocks if present
  return response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function getPerformancePredictions(): Promise<{
  sprintSpeed: string;
  strength: string;
  endurance: string;
  bodyFat: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Generate dynamic performance metrics for an athlete in JSON format...`; // Keep your existing prompt

    const result = await model.generateContent(prompt);
    const responseText = cleanGeminiResponse(result.response.text());
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error generating performance predictions:", error);
    return {
      sprintSpeed: "+8%",
      strength: "+12%",
      endurance: "+5%",
      bodyFat: "-2%",
    };
  }
}

export async function generateNutritionPlan(
  sport: string,
  position: string,
  goals: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Create a detailed 7-day nutrition plan for a ${sport} athlete who plays ${position}.
      Their primary training goal is: ${goals}

      Return ONLY valid JSON with this exact structure:
      {
        "days": [
          {
            "day": "string",
            "meals": [
              {
                "mealType": "string",
                "foodItems": "string",
                "calories": number,
                "macronutrients": {
                  "protein": number,
                  "carbs": number,
                  "fats": number
                }
              }
            ]
          }
        ]
      }

      IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const responseText = cleanGeminiResponse(result.response.text());
    return responseText;
  } catch (error) {
    console.error("Error generating nutrition plan:", error);
    return JSON.stringify({ days: [] });
  }
}

export async function generateTrainingPlan(
  sport: string,
  position: string,
  goals: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Create a detailed 7-day training plan for a ${sport} athlete who plays ${position}.
      Their primary training goal is: ${goals}

      Return ONLY valid JSON with this exact structure:
      {
        "days": [
          {
            "day": "string",
            "sessions": [
              {
                "focus": "string",
                "exercises": [
                  {
                    "name": "string",
                    "sets": number,
                    "reps": number,
                    "notes": "string"
                  }
                ],
                "duration": "string",
                "intensity": "string"
              }
            ]
          }
        ]
      }

      IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const responseText = cleanGeminiResponse(result.response.text());
    return responseText;
  } catch (error) {
    console.error("Error generating training plan:", error);
    return JSON.stringify({ days: [] });
  }
}
/**
 * Generate personalized nutrition suggestions based on athlete data and meal history.
 * @param sport - The sport the athlete plays.
 * @param position - The position the athlete plays.
 * @param meals - The athlete's meal history.
 * @param trainingGoal - The athlete's training goals.
 * @returns A string containing personalized nutrition suggestions.
 */
export async function getNutritionSuggestions(
  sport: string,
  position: string,
  meals: any[],
  trainingGoal: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Calculate total macros for the day
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

    const prompt = `
      As a sports nutrition expert, provide personalized nutrition advice for a ${sport} athlete playing ${position} position.
      Their training goal is: ${trainingGoal}

      Today's nutrition summary:
      - Total Calories: ${totalCalories} kcal
      - Protein: ${totalProtein}g
      - Carbs: ${totalCarbs}g
      - Fats: ${totalFats}g

      Recent meals:
      ${meals.map(meal => `- ${meal.foodName} (${meal.calories} kcal, P:${meal.protein}g, C:${meal.carbs}g, F:${meal.fats}g)`).join('\n')}

      Please provide:
      1. Analysis of current nutrition intake
      2. Specific recommendations for improvement
      3. Meal timing suggestions for optimal performance
      4. Pre/post training nutrition tips
      5. Hydration recommendations

      Format the response in clear sections with bullet points.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating nutrition suggestions:", error);
    return "Unable to generate nutrition suggestions at this time. Please try again later.";
  }
}

/**
 * Get injury risk assessment from Gemini AI.
 * @param sport - The sport the athlete plays.
 * @param position - The position the athlete plays.
 * @param data - Athlete data including recent performance, training load, and recovery metrics.
 * @returns A JSON object containing injury risk assessment.
 */
export async function getInjuryRiskAssessment(
  sport: string,
  position: string,
  data: {
    recentPerformance?: any;
    trainingLoad?: any;
    recoveryMetrics?: any;
    focusArea?: string;
  }
): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      As an AI sports medicine expert, analyze injury risks for a ${sport} athlete playing ${position} position.
      
      ${data.focusArea ? `Focus specifically on the ${data.focusArea} area.` : 'Analyze all major body parts.'}
      
      Recent Performance Data:
      ${JSON.stringify(data.recentPerformance, null, 2)}
      
      Training Load:
      ${JSON.stringify(data.trainingLoad, null, 2)}
      
      Recovery Metrics:
      ${JSON.stringify(data.recoveryMetrics, null, 2)}
      
      Provide a detailed injury risk assessment in JSON format with:
      {
        "overallRisk": number,
        "bodyParts": [
          {
            "id": "string",
            "name": "string",
            "risk": number,
            "status": "high" | "moderate" | "low",
            "recommendation": "string",
            "detailedAssessment": "string",
            "exercises": ["string"],
            "recoveryTime": "string"
          }
        ],
        "insights": [
          {
            "type": "risk" | "recovery" | "prevention",
            "message": "string",
            "severity": "high" | "medium" | "low",
            "timestamp": "string"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error getting injury risk assessment:", error);
    throw error;
  }
}

/**
 * Get personalized recovery plan from Gemini AI.
 * @param sport - The sport the athlete plays.
 * @param position - The position the athlete plays.
 * @param bodyParts - The body parts needing recovery.
 * @returns A string containing the recovery plan.
 */
export async function getRecoveryPlan(
  sport: string,
  position: string,
  bodyParts: any[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Create a personalized recovery plan for a ${sport} athlete playing ${position} position.
      
      Current Body Part Status:
      ${JSON.stringify(bodyParts, null, 2)}
      
      Include:
      1. Specific recovery exercises and stretches
      2. Rest and activity recommendations
      3. Nutrition tips for recovery
      4. Timeline for returning to full activity
      5. Warning signs to watch for
      
      Format the response as a clear, structured plan with bullet points and sections.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error getting recovery plan:", error);
    throw error;
  }
}

/**
 * Generate training recommendations based on athlete's health metrics.
 * @param sport - The sport the athlete plays.
 * @param position - The position the athlete plays.
 * @param healthMetrics - The athlete's health metrics.
 * @param trainingGoal - The athlete's training goals.
 * @returns A JSON string containing training recommendations.
 */
export async function getTrainingRecommendations(
  sport: string,
  position: string,
  healthMetrics: {
    heartRate: number;
    fatigueLevel: number;
    recoveryScore: number;
    sleepQuality: number;
    hydrationLevel: number;
    stressLevel: number;
  },
  trainingGoal: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      As an AI sports performance expert, analyze the following health metrics for a ${sport} athlete playing ${position} position
      with a training goal of ${trainingGoal}.

      Current Health Metrics:
      - Heart Rate: ${healthMetrics.heartRate} BPM
      - Fatigue Level: ${healthMetrics.fatigueLevel}%
      - Recovery Score: ${healthMetrics.recoveryScore}%
      - Sleep Quality: ${healthMetrics.sleepQuality}%
      - Hydration Level: ${healthMetrics.hydrationLevel}%
      - Stress Level: ${healthMetrics.stressLevel}%

      Provide a detailed analysis in JSON format with the following structure:
      {
        "healthStatus": {
          "overall": "Brief overall assessment",
          "concerns": ["List of health concerns"],
          "positives": ["List of positive aspects"]
        },
        "trainingRecommendations": {
          "intensity": "Recommended training intensity",
          "focusAreas": ["List of areas to focus on"],
          "modifications": ["List of suggested modifications"]
        },
        "recoveryStrategies": ["List of recovery strategies"],
        "warningSignals": ["List of warning signs to watch for"],
        "improvementTips": ["List of improvement tips"],
        "trainingDistribution": {
          "strength": 20,
          "cardio": 20,
          "flexibility": 20,
          "recovery": 20,
          "skillWork": 20
        }
      }

      Ensure all numbers in trainingDistribution add up to 100 and represent percentages.
      Base the recommendations on the current health metrics and training goals.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Validate the response is proper JSON
    try {
      JSON.parse(response);
      return response;
    } catch (error) {
      // If response is not valid JSON, return a default structured response
      return JSON.stringify({
        healthStatus: {
          overall: "Based on your current metrics",
          concerns: healthMetrics.fatigueLevel > 70 ? ["High fatigue detected"] : [],
          positives: healthMetrics.recoveryScore > 70 ? ["Good recovery score"] : []
        },
        trainingRecommendations: {
          intensity: healthMetrics.fatigueLevel > 70 ? "Low" : "Moderate",
          focusAreas: ["Recovery", "Technique"],
          modifications: []
        },
        recoveryStrategies: ["Ensure adequate rest", "Stay hydrated"],
        warningSignals: [],
        improvementTips: ["Monitor your progress", "Stay consistent"],
        trainingDistribution: {
          strength: 20,
          cardio: 20,
          flexibility: 20,
          recovery: 20,
          skillWork: 20
        }
      });
    }
  } catch (error) {
    console.error("Error generating training recommendations:", error);
    // Return a default structured response in case of error
    return JSON.stringify({
      healthStatus: {
        overall: "Unable to generate detailed recommendations",
        concerns: [],
        positives: []
      },
      trainingRecommendations: {
        intensity: "Moderate",
        focusAreas: [],
        modifications: []
      },
      recoveryStrategies: [],
      warningSignals: [],
      improvementTips: [],
      trainingDistribution: {
        strength: 20,
        cardio: 20,
        flexibility: 20,
        recovery: 20,
        skillWork: 20
      }
    });
  }
}