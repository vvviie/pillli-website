import { Modal } from './Modal.tsx'

type ConfirmDialogProps = {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmDialog = ({ title, body, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) => (
  <Modal title={title} onClose={onClose}>
    <p className="muted">{body}</p>
    <div className="row-actions">
      <button type="button" className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
      <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
    </div>
  </Modal>
)
