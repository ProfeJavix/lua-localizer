# Lua Localizer

### This extension allows you to **localize global Lua function calls** and automatically generate local aliases at the top of the file. It is designed to improve performance and code readability, for both the standard library and external libraries configured by the user. Use the command **`Lua: Localize Functions`** to perform the localizations on the selected file.

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

### <img src="images/lua-icon.png" width="30" height="30" style="vertical-align: middle;"> [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) — by *sumneko*


## Extension Settings

* `keybinding`: The hotkey to localize the functions (default: Ctrl+Shift+Alt+l)

## Release Notes

### 1.0.0

Initial release

## Source Code

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/ProfeJavix/lua-localizer)

You can find the source code of this extension on GitHub.