import type { ActivityEvent, CredentialDraft, FavoriteKind, FolderDraft, IncomeDraft, NoteDraft, Profile, Settings, TaskDraft, VaultData } from '../types.ts'
import { createIdentifier } from './createIdentifier.ts'

const timestamp = () => new Date().toISOString()

const withActivity = (data: VaultData, moduleName: string, action: string, itemName: string): VaultData => {
  const latest = data.activity[0]
  const event: ActivityEvent = { id: createIdentifier(), at: timestamp(), module: moduleName, action, itemName }
  const recentDuplicate = latest
    && latest.module === moduleName
    && latest.action === action
    && latest.itemName === itemName
    && Date.now() - Date.parse(latest.at) < 120000
  if (recentDuplicate) return data
  return { ...data, activity: [event, ...data.activity].slice(0, 200) }
}

export const vaultMutations = {
  addActivity: withActivity,
  saveCredential(data: VaultData, draft: CredentialDraft, credentialId?: string) {
    const now = timestamp()
    if (!credentialId) {
      const credential = { ...draft, id: createIdentifier(), favorite: false, createdAt: now, updatedAt: now }
      return withActivity({ ...data, credentials: [credential, ...data.credentials] }, 'Vault', 'created', credential.title)
    }
    const credentials = data.credentials.map((credential) =>
      credential.id === credentialId ? { ...credential, ...draft, updatedAt: now } : credential,
    )
    return withActivity({ ...data, credentials }, 'Vault', 'updated', draft.title)
  },
  deleteCredential(data: VaultData, credentialId: string) {
    const credential = data.credentials.find((item) => item.id === credentialId)
    return withActivity(
      { ...data, credentials: data.credentials.filter((item) => item.id !== credentialId) },
      'Vault',
      'deleted',
      credential?.title ?? 'Credential',
    )
  },
  saveNote(data: VaultData, draft: NoteDraft, noteId: string, isNew: boolean) {
    const now = timestamp()
    if (isNew) {
      const note = { ...draft, id: noteId, favorite: false, createdAt: now, updatedAt: now }
      return withActivity({ ...data, notes: [note, ...data.notes] }, 'Notes', 'created', note.title || 'Untitled note')
    }
    if (!data.notes.some((note) => note.id === noteId)) return data
    const notes = data.notes.map((note) => (note.id === noteId ? { ...note, ...draft, updatedAt: now } : note))
    return withActivity({ ...data, notes }, 'Notes', 'updated', draft.title || 'Untitled note')
  },
  deleteNote(data: VaultData, noteId: string) {
    const note = data.notes.find((item) => item.id === noteId)
    return withActivity({ ...data, notes: data.notes.filter((item) => item.id !== noteId) }, 'Notes', 'deleted', note?.title || 'Note')
  },
  duplicateNote(data: VaultData, noteId: string, copyId: string) {
    const note = data.notes.find((item) => item.id === noteId)
    if (!note) return data
    const now = timestamp()
    const copy = { ...note, id: copyId, title: `${note.title || 'Untitled note'} copy`, favorite: false, createdAt: now, updatedAt: now }
    return withActivity({ ...data, notes: [copy, ...data.notes] }, 'Notes', 'created', copy.title)
  },
  saveTask(data: VaultData, draft: TaskDraft, taskId?: string) {
    const now = timestamp()
    if (!taskId) {
      const task = { ...draft, id: createIdentifier(), createdAt: now, updatedAt: now }
      return withActivity({ ...data, tasks: [task, ...data.tasks] }, 'Tasks', 'created', task.title)
    }
    const tasks = data.tasks.map((task) => (task.id === taskId ? { ...task, ...draft, updatedAt: now } : task))
    return withActivity({ ...data, tasks }, 'Tasks', 'updated', draft.title)
  },
  deleteTask(data: VaultData, taskId: string) {
    const task = data.tasks.find((item) => item.id === taskId)
    return withActivity({ ...data, tasks: data.tasks.filter((item) => item.id !== taskId) }, 'Tasks', 'deleted', task?.title ?? 'Task')
  },
  saveIncome(data: VaultData, draft: IncomeDraft, incomeId?: string) {
    const now = timestamp()
    if (!incomeId) {
      const entry = { ...draft, id: createIdentifier(), createdAt: now, updatedAt: now }
      return withActivity({ ...data, income: [entry, ...data.income] }, 'Income', 'created', entry.source)
    }
    const income = data.income.map((entry) => (entry.id === incomeId ? { ...entry, ...draft, updatedAt: now } : entry))
    return withActivity({ ...data, income }, 'Income', 'updated', draft.source)
  },
  deleteIncome(data: VaultData, incomeId: string) {
    const entry = data.income.find((item) => item.id === incomeId)
    return withActivity({ ...data, income: data.income.filter((item) => item.id !== incomeId) }, 'Income', 'deleted', entry?.source ?? 'Income')
  },
  saveFolder(data: VaultData, draft: FolderDraft, folderId?: string) {
    const now = timestamp()
    if (!folderId) {
      const folder = { ...draft, id: createIdentifier(), favorite: false, createdAt: now }
      return withActivity({ ...data, folders: [folder, ...data.folders] }, 'Folders', 'created', folder.name)
    }
    const folders = data.folders.map((folder) => (folder.id === folderId ? { ...folder, ...draft } : folder))
    return withActivity({ ...data, folders }, 'Folders', 'updated', draft.name)
  },
  deleteFolder(data: VaultData, folderId: string) {
    const folder = data.folders.find((item) => item.id === folderId)
    return withActivity({
      ...data,
      folders: data.folders.filter((item) => item.id !== folderId),
      credentials: data.credentials.map((item) => (item.folderId === folderId ? { ...item, folderId: null } : item)),
      notes: data.notes.map((item) => (item.folderId === folderId ? { ...item, folderId: null } : item)),
    }, 'Folders', 'deleted', folder?.name ?? 'Folder')
  },
  toggleFavorite(data: VaultData, kind: FavoriteKind, itemId: string) {
    if (kind === 'credential') {
      const credentials = data.credentials.map((item) => item.id === itemId ? { ...item, favorite: !item.favorite, updatedAt: timestamp() } : item)
      const item = credentials.find((entry) => entry.id === itemId)
      return withActivity({ ...data, credentials }, 'Vault', 'updated', item?.title ?? 'Credential')
    }
    if (kind === 'note') {
      const notes = data.notes.map((item) => item.id === itemId ? { ...item, favorite: !item.favorite, updatedAt: timestamp() } : item)
      const item = notes.find((entry) => entry.id === itemId)
      return withActivity({ ...data, notes }, 'Notes', 'updated', item?.title || 'Note')
    }
    const folders = data.folders.map((item) => (item.id === itemId ? { ...item, favorite: !item.favorite } : item))
    const item = folders.find((entry) => entry.id === itemId)
    return withActivity({ ...data, folders }, 'Folders', 'updated', item?.name ?? 'Folder')
  },
  importCredentials(data: VaultData, drafts: CredentialDraft[]) {
    const now = timestamp()
    const imported = drafts.map((draft) => ({ ...draft, id: createIdentifier(), favorite: false, createdAt: now, updatedAt: now }))
    return withActivity({ ...data, credentials: [...imported, ...data.credentials] }, 'Vault', 'imported', `${imported.length} credentials`)
  },
  updateProfile(data: VaultData, profile: Profile) {
    return withActivity({ ...data, profile }, 'Account', 'updated', profile.displayName)
  },
  updateSettings(data: VaultData, settings: Settings) {
    return { ...data, settings }
  },
  clearActivity(data: VaultData) {
    return {
      ...data,
      activity: [{ id: createIdentifier(), at: timestamp(), module: 'Activity', action: 'cleared', itemName: 'Activity log' }],
    }
  },
}
