import { beforeEach, describe, expect, test, vi } from 'vitest';
import { syncWithFolder } from './sync-folder';

const SYNC_STATE_KEY = 'markdown-studio-sync-state';

function emptyDirectory(removeEntry: ReturnType<typeof vi.fn>): FileSystemDirectoryHandle {
  return {
    name: 'Fixture',
    kind: 'directory',
    removeEntry,
    async *values() {
      yield {
        name: 'Fixture.md',
        kind: 'file',
      } as FileSystemFileHandle;
    },
  } as unknown as FileSystemDirectoryHandle;
}

describe('folder sync destructive boundary', () => {
  beforeEach(() => localStorage.clear());

  test('does not treat an empty in-memory library as deletion without a committed tombstone', async () => {
    localStorage.setItem(
      SYNC_STATE_KEY,
      JSON.stringify({
        doc_fixture: {
          filename: 'Fixture.md',
          syncedAt: 1_700_000_000_000,
          fileMtime: 1_700_000_000_000,
        },
      })
    );
    const removeEntry = vi.fn(async () => undefined);

    await syncWithFolder(emptyDirectory(removeEntry), []);

    expect(removeEntry).not.toHaveBeenCalled();
  });

  test('removes a mapped file only when the document has a committed tombstone', async () => {
    localStorage.setItem(
      SYNC_STATE_KEY,
      JSON.stringify({
        doc_fixture: {
          filename: 'Fixture.md',
          syncedAt: 1_700_000_000_000,
          fileMtime: 1_700_000_000_000,
        },
      })
    );
    const removeEntry = vi.fn(async () => undefined);

    const outcome = await syncWithFolder(
      emptyDirectory(removeEntry),
      [],
      new Set(['doc_fixture'])
    );

    expect(removeEntry).toHaveBeenCalledWith('Fixture.md');
    expect(outcome.filesDeleted).toBe(1);
  });
});
