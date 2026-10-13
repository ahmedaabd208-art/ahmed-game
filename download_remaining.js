import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'public', 'players');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const remaining = [
  { id: 'bellingham', wiki: 'Jude_Bellingham' },
  { id: 'neymar', wiki: 'Neymar' },
  { id: 'modric', wiki: 'Luka_Modri%C4%87' },
  { id: 'lewandowski', wiki: 'Robert_Lewandowski' }
];

async function run() {
  for (const p of remaining) {
    try {
      await sleep(1500);
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${p.wiki}`, {
        headers: { 'User-Agent': 'FootballLegendsGameApp/2.0 (student@edu.org)' }
      });
      const summary = await summaryRes.json();
      const imgUrl = summary.thumbnail?.source || summary.originalimage?.source;
      if (imgUrl) {
        console.log(`Downloading ${p.id}...`);
        const imgRes = await fetch(imgUrl, {
          headers: { 'User-Agent': 'FootballLegendsGameApp/2.0 (student@edu.org)' }
        });
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        fs.writeFileSync(path.join(targetDir, `${p.id}.jpg`), buffer);
        console.log(`Saved ${p.id}.jpg (${buffer.length} bytes)`);
      }
    } catch (err) {
      console.error(`Error for ${p.id}:`, err.message);
    }
  }
  console.log('Done remaining players!');
}

run();
