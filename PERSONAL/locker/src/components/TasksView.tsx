import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { vaultDates } from '../lib/vaultDates.ts'
import { useVault } from '../state/useVault.ts'
import type { Task, TaskStatus } from '../types.ts'
import { EmptyState } from './EmptyState.tsx'
import { PageHeader } from './PageHeader.tsx'
import { TagList } from './TagList.tsx'
import { TaskDialog } from './TaskDialog.tsx'

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To do' },
  { status: 'progress', label: 'In progress' },
  { status: 'done', label: 'Completed' },
]

export const TasksView = ({ selectedId }: { selectedId: string | null }) => {
  const { data, saveTask } = useVault()
  const [editing, setEditing] = useState<Task | null | 'new'>(null)
  const openedId = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedId || !data || openedId.current === selectedId) return
    openedId.current = selectedId
    const match = data.tasks.find((task) => task.id === selectedId)
    if (match) setEditing(match)
  }, [data, selectedId])

  if (!data) return null
  const today = vaultDates.todayKey()

  const moveTask = (task: Task, status: TaskStatus) => {
    saveTask({
      title: task.title,
      description: task.description,
      status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags,
    }, task.id)
  }

  return (
    <section className="stack">
      <PageHeader
        title="Tasks"
        text="Track what is to do, in progress, and done. Due dates also show up on the calendar."
        action={<button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><Plus /> Add task</button>}
      />
      {data.tasks.length === 0 ? <EmptyState title="No tasks yet" text="Add a task with a due date and it will appear on the dashboard." /> : (
        <div className="board">
          {columns.map((column) => (
            <section className="stack" key={column.status}>
              <h2>{column.label}</h2>
              {data.tasks.filter((task) => task.status === column.status).map((task) => (
                <article className="task-card stack" key={task.id}>
                  <button type="button" className="text-button" onClick={() => setEditing(task)}>
                    <strong>{task.title}</strong>
                  </button>
                  <p className={`priority-${task.priority}`}>{task.priority} priority</p>
                  {task.dueDate ? <p className={task.dueDate < today && task.status !== 'done' ? 'danger-text' : 'muted'}>{task.dueDate < today && task.status !== 'done' ? 'Overdue' : 'Due'} {vaultDates.medium(task.dueDate)}</p> : null}
                  <TagList tags={task.tags} />
                  <select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => moveTask(task, event.target.value as TaskStatus)}>
                    {columns.map((option) => <option key={option.status} value={option.status}>{option.label}</option>)}
                  </select>
                </article>
              ))}
            </section>
          ))}
        </div>
      )}
      {editing ? <TaskDialog initial={editing === 'new' ? null : editing} dueDate={null} onClose={() => setEditing(null)} /> : null}
    </section>
  )
}
