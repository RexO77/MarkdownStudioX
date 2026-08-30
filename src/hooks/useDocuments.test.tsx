import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { documentFixture } from '@/test/fixtures/documents';
import { useDocuments } from './useDocuments';

const DOCUMENTS_KEY = 'markdown-studio-documents';

describe('useDocuments persistence seam', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('loads a valid document library through the public hook', () => {
    const document = documentFixture();
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify([document]));

    const { result } = renderHook(() => useDocuments());

    expect(result.current.documents).toEqual([document]);
  });

  test('reports a durable write failure instead of claiming the edit was saved', async () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const { result } = renderHook(() => useDocuments());

    await waitFor(() => expect(result.current.saveFailed).toBe(true));
  });

  test('preserves malformed storage bytes for recovery instead of overwriting them', () => {
    const malformed = '{"documents":';
    localStorage.setItem(DOCUMENTS_KEY, malformed);

    const { result } = renderHook(() => useDocuments());

    expect(localStorage.getItem(DOCUMENTS_KEY)).toBe(malformed);
    expect(result.current.storageRecovery?.rawPayload).toBe(malformed);
  });

  test('does not treat wrong-shaped JSON as a document library', () => {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify({ documents: [] }));

    const { result } = renderHook(() => useDocuments());

    expect(result.current.storageRecovery?.reason).toContain('unexpected shape');
  });

  test('does not write an empty library after storage becomes unavailable', () => {
    const setItem = vi.spyOn(localStorage, 'setItem');
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable', 'SecurityError');
    });

    renderHook(() => useDocuments());

    expect(setItem).not.toHaveBeenCalled();
  });
});
