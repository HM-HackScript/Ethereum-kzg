export const omitString = (str: string, headerLen = 6, tailLen = 4) => {
    const minLength = headerLen + tailLen
    if (str.length <= minLength) return str
    const startStr = str.substring(0, headerLen)
    const endStr = str.substring(str.length - tailLen, str.length)

    return `${startStr}...${endStr}`
}