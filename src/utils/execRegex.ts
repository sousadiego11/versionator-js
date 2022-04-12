const execRegex = (validator: string, regex: RegExpExecArray | null) => {
    return validator && regex ? regex : []
}

export default execRegex