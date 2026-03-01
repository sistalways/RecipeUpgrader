import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor() {
    // Make sure your OPENAI_API_KEY is set in your environment variables
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateIngredientsFromForm(RecipeForm:any): Promise<any> {
    const prompt = `
You are a fitness and Nutrion expert and your job is to generate a 
Recipe based on the following form data:
RecipeName: ${RecipeForm.RecipeName}
Goal: ${RecipeForm.Goal}
DietaryRestrictions: ${RecipeForm.DietaryRestrictions}
Please generate a Ingredients for a Recipe that follows the the following rules:
- if the user has a goal of cutting, the recipe should be low in calories(minimizing fat) and high in protien.
- if the user has a goal of bulking, the recipe should be high in calories and high in protien.
- if the user has a goal of maintaining, the recipe should be balanced in calories and still high in protien.
- if the user has dietary restrictions, the recipe should avoid those ingredients and suggest alternatives.
- "RecipeId", and "userId" must be integers.
- "createdAt" and "updatedAt" must be valid ISO timestamps.
- RETURN ONLY VALID JSON. No explanation or text outside JSON.
IMPORTANT — Produce a JSON array where EVERY item matches this exact schema:
where ingredient is defined as:

model ingredient {
  id                  Int    @id @default(autoincrement())
  recipeId            Int
  userId              Int
  ingredientName      String?
  ingredientQuantity  Int
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  User                User   @relation(fields: [userId], references: [id])
  recipe              Recipe @relation(fields: [recipeId], references: [id])
}

`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      // The API returns text in completion.choices[0].message.content
      const text = completion.choices[0].message?.content;

      if (!text) {
        throw new InternalServerErrorException('OpenAI returned empty response');
      }

      // Parse JSON safely
      const parsed = JSON.parse(text);
      return parsed;
    } catch (error) {
      console.error('Error generating Recipe:', error);
      throw new InternalServerErrorException('Failed to generate Recipe');
    }
  }
}
