const taskPattern = /^\s*(?:[-*+]|\d{1,9}[.)])\s+\[[ xX]\]/gm
const listMarkerPattern = /^\s*(?:[-*+]|\d{1,9}[.)])\s+(?:\[[ xX]\]\s+)?/gm

export const readNoteStats = (body: string) => {
  const prose = body.replace(listMarkerPattern, '')
  const words = prose.trim().split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length
  const tasks = body.match(taskPattern) ?? []
  const tasksDone = tasks.filter((task) => /\[[xX]\]/.test(task)).length
  return {
    words,
    characters: body.length,
    minutes: Math.max(1, Math.ceil(words / 220)),
    tasksTotal: tasks.length,
    tasksDone,
  }
}
