<div align="center">
    <img width="350px" src="https://raw.githubusercontent.com/gist/prynssmaia/78cc9954ce6810647a2ab4035e1e1ac2/raw/206d5a3cf4addb6e6aa5b0fd620ccf836cb0b98b/versionator.svg"/>
</div>

<div align="center">
    <a target="_blank"><img src="https://img.shields.io/librariesio/release/npm/versionator-js?labelColor=0D1117&color=cd52d0" target="_blank"></a>
    <a target="_blank"><img src="https://img.shields.io/npm/dw/versionator-js?labelColor=0D1117&color=ac3bc8" target="_blank"></a>
    <a target="_blank"><img src="https://img.shields.io/github/issues-raw/sousadiego11/versionator-js?labelColor=0D1117&color=8825c0" target="_blank"></a>
    <a target="_blank"><img src="https://img.shields.io/github/languages/code-size/sousadiego11/versionator-js?labelColor=0D1117&color=5c13b9" target="_blank"></a>
    <a target="_blank"><img src="https://img.shields.io/npm/l/versionator-js?labelColor=0D1117&color=3C087D" target="_blank"></a>  
</div>
 <div align="center">
  <a target="_blank"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" target="_blank"></a>
  <a target="_blank"><img src="https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white" target="_blank"></a>
  <a target="_blank"><img src="https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white" target="_blank"></a>
</div>

## 🚀 Configuration
This package uses **[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)** as a base for constructing the changelog, make sure your commits follow this pattern.

Create a **changelog.config.json** in your root directory and provide the link for your repository's commits destination as the example bellow:
```javascript
{
    "commits_dir": "https://github.com/user/repository/commit"
}
```
Or configure your workspace with the command line:
```bash
npx versionator-js init

or

npm install versionator-js -g
versionator-js init
```

## 🚨 Running versionator-js in your project.
```bash
npm install versionator-js
```
AND
```javascript
const versionator = require('versionator-js')

versionator.build()
```

OR

```javascript
npx versionator-js
```

OR

```javascript
npm install versionator-js -g

versionator-js
```

## ♻️ Contributing
Keep in mind that it is still an ongoing project at its beginning, pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 🚧 License
[ISC](https://opensource.org/licenses/ISC)
