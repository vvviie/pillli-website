export type ThemeMode = 'light' | 'dark' | 'system'
export type FontSize = 'small' | 'medium' | 'large'
export type AccentName = 'brass' | 'teal' | 'slate' | 'rose'
export type FolderKind = 'vault' | 'notes'
export type TaskStatus = 'todo' | 'progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type FavoriteKind = 'credential' | 'note' | 'folder'
export type VaultPhase = 'loading' | 'setup' | 'recovery' | 'locked' | 'unlocked' | 'error'
export type AppView =
  | 'dashboard'
  | 'vault'
  | 'notes'
  | 'tasks'
  | 'calendar'
  | 'income'
  | 'folders'
  | 'favorites'
  | 'generator'
  | 'activity'
  | 'settings'

export type Profile = {
  displayName: string
  avatarDataUrl: string | null
}

export type WorldClock = {
  id: string
  label: string
  timeZone: string
}

export type Settings = {
  theme: ThemeMode
  accent: AccentName
  fontSize: FontSize
  showWebsiteIcons: boolean
  autoLockMinutes: number
  clipboardClearSeconds: number
  clocks: WorldClock[]
}

export type Folder = {
  id: string
  name: string
  color: string
  kind: FolderKind
  favorite: boolean
  createdAt: string
}

export type Credential = {
  id: string
  title: string
  username: string
  password: string
  website: string
  notes: string
  tags: string[]
  folderId: string | null
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export type Note = {
  id: string
  title: string
  body: string
  folderId: string | null
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type IncomeEntry = {
  id: string
  source: string
  amount: number
  currency: string
  category: string
  date: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type ActivityEvent = {
  id: string
  at: string
  module: string
  action: string
  itemName: string
}

export type VaultData = {
  profile: Profile
  settings: Settings
  folders: Folder[]
  credentials: Credential[]
  notes: Note[]
  tasks: Task[]
  income: IncomeEntry[]
  activity: ActivityEvent[]
}

export type CredentialDraft = Omit<Credential, 'id' | 'favorite' | 'createdAt' | 'updatedAt'>
export type NoteDraft = Omit<Note, 'id' | 'favorite' | 'createdAt' | 'updatedAt'>
export type NoteMode = 'edit' | 'view'
export type NotePane = 'list' | 'editor'
export type NoteSaveState = 'saved' | 'pending' | 'saving'
export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
export type IncomeDraft = Omit<IncomeEntry, 'id' | 'createdAt' | 'updatedAt'>
export type FolderDraft = Omit<Folder, 'id' | 'favorite' | 'createdAt'>
