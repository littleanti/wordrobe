import { phraseRepo } from '@/lib/repos/phraseRepo';
import { personaRepo } from '@/lib/repos/personaRepo';
import { settingsRepo } from '@/lib/repos/settingsRepo';

export async function clearAllLocalAppData(): Promise<void> {
  // DB stores first; only wipe settings (incl. API key) once the async clears succeed,
  // so a failed clear doesn't leave the user keyless with data still present.
  await phraseRepo.clear();
  await personaRepo.clear();
  settingsRepo.clear();
}
