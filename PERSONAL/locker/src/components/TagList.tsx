export const TagList = ({ tags }: { tags: string[] }) => {
  if (tags.length === 0) return null
  return (
    <span className="tags">
      {tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
    </span>
  )
}
