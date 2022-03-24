# Versionator-js

Create dynamic and automatic changelogs for your project!.

## Installation

Use the package manager npm to install versionator-js.

```bash
npm install versionator-js
```

## Usage
This package uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) as a base for constructing the changelog, make sure your commits follow this pattern.

📝 Create a changelog.config.json in your root directory and provide the link for your repository's commits destination as the example bellow:
```javascript
{
    "commits_dir": "https://github.com/user/repository/commit"
}
```


📌 Import and run the module.
```javascript
const versionator = require('versionator')

versionator()
```

## Contributing
Keep in mind that it is still an ongoing project at its beginning, pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[ISC](https://opensource.org/licenses/ISC)
