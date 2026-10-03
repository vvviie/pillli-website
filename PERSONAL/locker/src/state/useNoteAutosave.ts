import { useCallback, useEffect, useRef, useState } from 'react'
import { isNoteDraftSaved } from '../lib/isNoteDraftSaved.ts'
import type { NoteDraft, NoteSaveState } from '../types.ts'
import { useVault } from './useVault.ts'

const autosaveDelay = 800

export const useNoteAutosave = (noteId: string, draft: NoteDraft) => {
  const { data, saveNote, whenVaultIdle } = useVault()
  const [saveState, setSaveState] = useState<NoteSaveState>('saved')
  const latest = useRef({ data, draft, saveNote, whenVaultIdle, discarded: false })

  useEffect(() => {
    latest.current = { ...latest.current, data, draft, saveNote, whenVaultIdle }
  })

  const writeDraft = useCallback(() => {
    const { data: current, draft: next, saveNote: save, discarded } = latest.current
    const stored = current?.notes.find((note) => note.id === noteId)
    if (discarded || !stored || isNoteDraftSaved(stored, next)) return
    save(next, noteId)
  }, [noteId])

  const saveNow = useCallback(async () => {
    setSaveState('saving')
    writeDraft()
    try {
      await latest.current.whenVaultIdle()
      setSaveState('saved')
    } catch (saveError: unknown) {
      console.error('Note save failed', saveError)
      setSaveState('pending')
    }
  }, [writeDraft])

  useEffect(() => {
    const stored = latest.current.data?.notes.find((note) => note.id === noteId)
    if (!stored || isNoteDraftSaved(stored, draft)) {
      setSaveState((current) => (current === 'pending' ? 'saved' : current))
      return
    }
    setSaveState('pending')
    const timer = window.setTimeout(() => void saveNow(), autosaveDelay)
    return () => window.clearTimeout(timer)
  }, [draft, noteId, saveNow])

  useEffect(() => () => writeDraft(), [writeDraft])

  const discard = useCallback(() => {
    latest.current.discarded = true
  }, [])

  return { saveState, saveNow, flush: writeDraft, discard }
}
