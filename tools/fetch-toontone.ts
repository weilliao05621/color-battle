#!/usr/bin/env npx tsx
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const CHARACTERS_URL = 'https://toontone.app/characters.JSON';
const IMAGE_BASE_URL = 'https://toontone.app/assets/Characters';
const OUTPUT_DIR = join(import.meta.dirname, '..', 'packages', 'client', 'public', 'characters');
const QUESTIONS_FILE = join(import.meta.dirname, '..', 'packages', 'client', 'public', 'questions.json');

interface ToonToneChar {
  id: string;
  characterName: string;
  showSource: string;
  targetPart: string;
  trueHexCode: string;
  imagePath: string;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Fetching characters.JSON...');
  const res = await fetch(CHARACTERS_URL);
  const rawText = await res.text();
  const cleanText = rawText.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
  const characters: ToonToneChar[] = JSON.parse(cleanText);

  console.log(`Found ${characters.length} characters`);

  const questions = [];

  for (const char of characters) {
    const imageUrl = `${IMAGE_BASE_URL}/${char.imagePath}`;
    const localPath = join(OUTPUT_DIR, char.imagePath);

    if (!existsSync(localPath)) {
      console.log(`Downloading ${char.imagePath}...`);
      try {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          writeFileSync(localPath, buffer);
        } else {
          console.warn(`  Failed: ${imgRes.status} ${imgRes.statusText}`);
          continue;
        }
      } catch (err) {
        console.warn(`  Error downloading ${char.imagePath}:`, err);
        continue;
      }
    } else {
      console.log(`  Skipping ${char.imagePath} (exists)`);
    }

    questions.push({
      id: char.id,
      characterName: char.characterName,
      showSource: char.showSource,
      targetPart: char.targetPart,
      trueHexCode: char.trueHexCode,
      imagePath: `/characters/${char.imagePath}`,
    });
  }

  writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
  console.log(`\nWrote ${questions.length} questions to questions.json`);
  console.log('Done!');
}

main().catch(console.error);
