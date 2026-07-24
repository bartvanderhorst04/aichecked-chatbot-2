import { readFile } from 'node:fs/promises';
import path from 'node:path';

const knowledgeFiles = ['wimvanbreda.md', 'regels.md', 'verboden.md', 'links.md'];

export async function getKnowledgeBase(): Promise<string> {
  const directory = path.join(process.cwd(), 'knowledge');
  const contents = await Promise.all(
    knowledgeFiles.map(async (file) => {
      try {
        return await readFile(path.join(directory, file), 'utf8');
      } catch {
        return '';
      }
    }),
  );
  return contents.filter(Boolean).join('\n\n').slice(0, 18000);
}
