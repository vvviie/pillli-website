import { useState } from 'react'
import { parseTags } from '../lib/parseTags.ts'
import { vaultDates } from '../lib/vaultDates.ts'
import { useVault } from '../state/useVault.ts'
import type { Task, TaskDraft, TaskPriority, TaskStatus } from '../types.ts'
import { Field } from './Field.tsx'
import { Modal } from './Modal.tsx'

const emptyTask = (dueDate: string | null): TaskDraft => ({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate,
  tags: [],
})

type TaskDialogProps = {
  initial: Task | null
  dueDate: string | null
  onClose: () => void
}

export const TaskDialog = ({ initial, dueDate, onClose }: TaskDialogProps) => {
  const { saveTask, deleteTask } = useVault()
  const [draft, setDraft] = useState<TaskDraft>(initial ? {
    title: initial.title,
    description: initial.description,
    status: initial.status,
    priority: initial.priority,
    dueDate: initial.dueDate,
    tags: initial.tags,
  } : emptyTask(dueDate))
  const [tagText, setTagText] = useState(initial?.tags.join(', ') ?? '')

  const save = () => {
    if (!draft.title.trim()) return
    saveTask({ ...draft, title: draft.title.trim(), tags: parseTags(tagText) }, initial?.id)
    onClose()
  }

  return (
    <Modal title={initial ? 'Edit task' : 'New task'} onClose={onClose}>
      <Field label="Title">
        <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      </Field>
      <Field label="Description">
        <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      </Field>
      <Field label="Status">
        <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })}>
          <option value="todo">To do</option>
          <option value="progress">In progress</option>
          <option value="done">Completed</option>
        </select>
      </Field>
      <Field label="Priority">
        <select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskPriority })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </Field>
      <Field label="Due date">
        <input type="date" value={draft.dueDate ?? ''} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value || null })} />
      </Field>
      <Field label="Tags">
        <input value={tagText} onChange={(event) => setTagText(event.target.value)} />
      </Field>
      {draft.dueDate ? <p className="muted">Due {vaultDates.medium(draft.dueDate)}</p> : null}
      <div className="row-actions">
        <button type="button" className="btn btn-primary" onClick={save}>Save task</button>
        {initial ? <button type="button" className="btn btn-danger" onClick={() => { deleteTask(initial.id); onClose() }}>Delete</button> : null}
      </div>
    </Modal>
  )
}
