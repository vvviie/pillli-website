const encodeChunk = (chunk: Uint8Array) => {
  let binary = ''
  for (const value of chunk) binary += String.fromCharCode(value)
  return binary
}

export const bytes = {
  toBase64(data: Uint8Array) {
    let binary = ''
    const size = 0x8000
    for (let index = 0; index < data.length; index += size) {
      binary += encodeChunk(data.subarray(index, index + size))
    }
    return btoa(binary)
  },
  fromBase64(value: string) {
    const binary = atob(value)
    const decoded = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) decoded[index] = binary.charCodeAt(index)
    return decoded
  },
}
