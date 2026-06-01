import { phraseRepo } from '@/lib/repos/phraseRepo';
import { personaRepo } from '@/lib/repos/personaRepo';
import { settingsRepo } from '@/lib/repos/settingsRepo';

export async function clearAllLocalAppData(): Promise<void> {
  settingsRepo.clear();
  await phraseRepo.clear();
  await personaRepo.clear();
}
