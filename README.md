<div>
    <a target="_blank"><img src="https://img.shields.io/librariesio/release/npm/versionator-js" target="_blank"></a>
    <a target="_blank"><img src="https://img.shields.io/npm/dw/versionator-js" target="_blank"></a>
    <a target="_blank"><img src="https://img.shields.io/github/issues-raw/sousadiego11/versionator-js" target="_blank"></a>
    <a target="_blank"><img src="https://img.shields.io/github/languages/code-size/sousadiego11/versionator-js" target="_blank"></a>
    <a target="_blank"><img src="https://img.shields.io/npm/l/versionator-js" target="_blank"></a>
    
</div>
 <div>
  <a target="_blank"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" target="_blank"></a>
  <a target="_blank"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" target="_blank"></a>
  <a target="_blank"><img src="https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white" target="_blank"></a>
</div>

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
const versionator = require('versionator-js')

versionator.build()
```

or

```javascript
npx versionator-js
```

or

```javascript
npm install versionator-js -g

versionator-js
```

## Contributing
Keep in mind that it is still an ongoing project at its beginning, pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[ISC](https://opensource.org/licenses/ISC)
