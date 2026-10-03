export const readFileText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => {
      console.error('Could not read file', reader.error)
      reject(new Error('Could not read that file.'))
    }
    reader.readAsText(file)
  })
