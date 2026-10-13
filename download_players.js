import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'public', 'players');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const players = [
  { id: 'messi', wiki: 'Lionel_Messi' },
  { id: 'ronaldo', wiki: 'Cristiano_Ronaldo' },
  { id: 'mbappe', wiki: 'Kylian_Mbapp%C3%A9' },
  { id: 'haaland', wiki: 'Erling_Haaland' },
  { id: 'salah', wiki: 'Mohamed_Salah' },
  { id: 'vinicius', wiki: 'Vin%C3%ADcius_J%C3%BAnior' },
  { id: 'debruyne', wiki: 'Kevin_De_Bruyne' },
  { id: 'bellingham', wiki: 'Jude_Bellingham' },
  { id: 'neymar', wiki: 'Neymar' },
  { id: 'modric', wiki: 'Luka_Modri%C4%87' },
  { id: 'lewandowski', wiki: 'Robert_Lewandowski' },
  { id: 'benzema', wiki: 'Karim_Benzema' }
];

async function downloadPlayer(player) {
  try {
    const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${player.wiki}`, {
      headers: { 'User-Agent': 'SoccerApp/1.0 (contact@example.com)' }
    });
    const summary = await summaryRes.json();
    const imgUrl = summary.thumbnail?.source || summary.originalimage?.source;
    if (!imgUrl) {
      console.log(`No image for ${player.id}`);
      return;
    }

    console.log(`Downloading ${player.id} from ${imgUrl}...`);
    const imgRes = await fetch(imgUrl, {
      headers: { 'User-Agent': 'SoccerApp/1.0 (contact@example.com)' }
    });
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const filePath = path.join(targetDir, `${player.id}.jpg`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved ${player.id}.jpg (${buffer.length} bytes)`);
  } catch (err) {
    console.error(`Error downloading ${player.id}:`, err.message);
  }
}

async function run() {
  for (const p of players) {
    await downloadPlayer(p);
  }
  console.log('Finished downloading player images!');
}

run();
