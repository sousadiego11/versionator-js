const execRegex = (validator, regex) => {
  return validator && regex ? regex : []
}

export default execRegex
