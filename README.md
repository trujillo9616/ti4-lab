# TI4 Lab

TI4 lab is a Twilight Imperium 4 drafting and map building tool. It supports multiple draft formats, has browser notifications, discord integration, and many other fun things.

## Prerequisites

### Dependencies

- Node.js 26.x
- Sqlite3

### Environment setup

Optional for local dev. If unset outside production, the app now defaults to
`./sqlite.db` in the repo root.

If you want a custom SQLite file, add this in your shell configuration:

```
export TI4_LAB_DATABASE_PATH="file:///ABSOLUTE_PATH_HERE.sqlite"
```

_NOTE_: The path must be an absolute path.

## Installing / running

Assuming all the prerequisites are met, you can run the following commands to install and run the app:

```shell
pnpm install
pnpm dev
```

If you use `nvm`, run `nvm use` first.

Open `https://localhost:3000/` in your browser and you're good to go.
