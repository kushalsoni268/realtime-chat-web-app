import "../styles/Avatar.css"

function Avatar({ name, color }) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`avatar ${color || ""}`} style={color ? { backgroundColor: color } : {}}>
      {getInitials(name)}
    </div>
  )
}

export default Avatar

