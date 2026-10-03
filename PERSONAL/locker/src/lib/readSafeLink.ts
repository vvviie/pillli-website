const safeLinkPattern = /^(https?:\/\/[^\s]+|mailto:[^\s]+)$/i

export const readSafeLink = (href: string) => (safeLinkPattern.test(href) ? href : null)
