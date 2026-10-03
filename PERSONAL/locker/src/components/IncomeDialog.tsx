import { useState } from 'react'
import { vaultDates } from '../lib/vaultDates.ts'
import { vaultOptions } from '../lib/vaultOptions.ts'
import { useVault } from '../state/useVault.ts'
import type { IncomeDraft, IncomeEntry } from '../types.ts'
import { Field } from './Field.tsx'
import { Modal } from './Modal.tsx'

const emptyIncome = (): IncomeDraft => ({
  source: '',
  amount: 0,
  currency: 'PHP',
  category: 'Freelance',
  date: vaultDates.todayKey(),
  notes: '',
})

export const IncomeDialog = ({ initial, onClose }: { initial: IncomeEntry | null; onClose: () => void }) => {
  const { saveIncome, deleteIncome } = useVault()
  const [draft, setDraft] = useState<IncomeDraft>(initial ? {
    source: initial.source,
    amount: initial.amount,
    currency: initial.currency,
    category: initial.category,
    date: initial.date,
    notes: initial.notes,
  } : emptyIncome())

  const save = () => {
    if (!draft.source.trim() || Number.isNaN(draft.amount)) return
    saveIncome({ ...draft, source: draft.source.trim(), amount: Number(draft.amount) }, initial?.id)
    onClose()
  }

  return (
    <Modal title={initial ? 'Edit income' : 'Log income'} onClose={onClose}>
      <Field label="Source">
        <input value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })} />
      </Field>
      <Field label="Amount">
        <input type="number" min="0" step="0.01" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value) })} />
      </Field>
      <Field label="Currency">
        <select value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value })}>
          {vaultOptions.currencies.map((currency) => <option key={currency}>{currency}</option>)}
        </select>
      </Field>
      <Field label="Category">
        <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
          {vaultOptions.incomeCategories.map((category) => <option key={category}>{category}</option>)}
        </select>
      </Field>
      <Field label="Date">
        <input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
      </Field>
      <Field label="Notes">
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
      </Field>
      <div className="row-actions">
        <button type="button" className="btn btn-primary" onClick={save}>Save income</button>
        {initial ? <button type="button" className="btn btn-danger" onClick={() => { deleteIncome(initial.id); onClose() }}>Delete</button> : null}
      </div>
    </Modal>
  )
}
