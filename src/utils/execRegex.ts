const execRegex = (validator: string, regex: RegExpExecArray | null) => {
  return validator && (regex != null) ? regex : []
}

export default execRegex
