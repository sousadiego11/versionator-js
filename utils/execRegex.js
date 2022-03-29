const execRegex = (validator, regex) => {
    return validator && regex ? regex : []
}

module.exports = execRegex