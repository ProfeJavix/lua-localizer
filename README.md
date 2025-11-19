# lua-localizer README

This extension allows you to **localize global Lua function calls** and automatically generate local aliases at the top of the file. It is designed to improve performance and code readability, for both the standard library and external libraries configured by the user.

## Features

### Function Detection
- Detects calls to functions from the **Lua standard library**.
- Detects functions from paths configured in: **`Settings → Lua → Workspace: Library`**
- Supports submodules such as `math.*`, `string.*`, `table.*` and more.

### Automatic Local Generation
- Creates an **automatic region at the top of the file** containing local aliases for all detected function calls.
- Local aliases are generated in the format:  
  ```lua
  local abs = math.abs
  local format = string.format
  local insert = table.insert
  local tostring = tostring
- All generated locals are sorted alphabetically for easier reading and maintenance.

### Benefits
- Reduces global table access, improving Lua execution performance.
- Makes code easier to navigate and understand by clearly showing which external functions are used.
- Helps avoid name conflicts and keeps local scope organized.

## Requirements

### <img src="images/lua-icon.png"> [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) — by *sumneko*


## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

### 1.0.0

Initial release

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
