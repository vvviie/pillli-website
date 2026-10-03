export const readAvatarDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      const size = 128
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      URL.revokeObjectURL(objectUrl)
      if (!context) {
        reject(new Error('Could not resize that picture.'))
        return
      }
      const scale = Math.max(size / image.width, size / image.height)
      const width = image.width * scale
      const height = image.height * scale
      context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      console.error('Could not read avatar image')
      reject(new Error('Could not read that picture.'))
    }
    image.src = objectUrl
  })
