import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { HSLColor } from '@color-battle/shared';
import { hexToHsl } from '@color-battle/shared';

export interface QuestionData {
  id: string;
  characterName: string;
  showSource: string;
  targetPart: string;
  trueHexCode: string;
  imagePath: string;
  correctColor: HSLColor;
}

interface RawQuestion {
  id: string;
  characterName: string;
  showSource: string;
  targetPart: string;
  trueHexCode: string;
  imagePath: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '../../client/dist/questions.json');
const publicPath = join(__dirname, '../../client/public/questions.json');
const questionsPath = existsSync(distPath) ? distPath : publicPath;

let questionBank: QuestionData[] = [];

try {
  const raw: RawQuestion[] = JSON.parse(readFileSync(questionsPath, 'utf-8'));
  questionBank = raw.map((q) => ({
    ...q,
    correctColor: hexToHsl(q.trueHexCode),
  }));
} catch (err) {
  console.error('Failed to load questions.json:', err);
}

export function loadQuestions(): QuestionData[] {
  const shuffled = [...questionBank];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
