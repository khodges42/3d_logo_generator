# ChoiceBook v0.2

A tiny static choice-based interactive fiction engine.

## What it is

ChoiceBook is a small, self-contained framework for writing choice-based interactive fiction.

- One folder = one game
- One YAML file = the story
- No backend
- No database
- No build step
- Autosave uses browser `localStorage`

This example folder contains a complete gamebook:

```txt
index.html
style.css
engine.js
story.yaml
README.md
```

## Running locally

Because the engine uses `fetch("./story.yaml")`, open it through a local static server.

```bash
python3 -m http.server 8000
```

Then visit:

```txt
http://localhost:8000/
```

or, if this folder is inside another directory:

```txt
http://localhost:8000/choicebook-werewolves-vs-vamps-v0.2/
```

## Debug mode

Add this to the URL:

```txt
?debug=1
```

This shows:

- validation errors
- validation warnings
- current passage
- stats
- inventory
- flags
- character state
- passage history

To temporarily ignore validation errors:

```txt
?skipValidation=1
```

You can combine them:

```txt
?debug=1&skipValidation=1
```

## Dark/light mode

The title area includes a dark/light toggle.

The selected theme is saved in `localStorage` and applies to all ChoiceBook stories in that browser.

## Styling

Authors customize appearance by editing CSS variables at the top of `style.css`.

```css
:root {
  --bg: #171411;
  --paper: #f4ead8;
  --ink: #241b15;
  --muted: #6d5d50;
  --line: #d4c2a8;
  --accent: #7b1f24;
  --accent-ink: #fff8ef;
}
```

Dark mode has its own override block:

```css
body[data-theme="dark"] {
  --bg: #090807;
  --paper: #191411;
  --ink: #f2e4cf;
}
```

## YAML basics

The story lives in `story.yaml`.

Top-level sections:

```yaml
title: "My Story"
slug: "my-story"
author: "Me"
version: 1

start: character

character:
  fields: ...

stats: ...

inventory: ...

flags: ...

passages: ...
```

## Passages

```yaml
passages:
  intro:
    type: story
    title: "Chapter One"
    text: |
      The rain falls.
    choices:
      - text: Open the door.
        goto: door
```

## Character creation

```yaml
character:
  fields:
    name:
      type: text
      label: Name
      default: Alex

    pronouns:
      type: choice
      label: Pronouns
      options:
        - they/them
        - she/her
        - he/him
```

## Requirements

Unavailable choices are hidden.

```yaml
requires:
  stat: grit
  gte: 2
```

```yaml
requires:
  item: silver_charm
```

```yaml
requires:
  all:
    - item: hunter_note
    - stat: occult
      gte: 2
```

## Effects

```yaml
effects:
  stats:
    charm: 1
    suspicion: -1
  add_items:
    - chapel_key
  remove_items:
    - torch
  flags:
    met_hunter: true
```

## Variables

Story text can include variables:

```txt
{{name}}
{{character.name}}
{{stats.grit}}
{{flags.met_hunter}}
```

## LLM usage

This engine works well with LLM-generated stories because the YAML is constrained.

Prompt idea:

```txt
Write a valid ChoiceBook story.yaml.

Use only:
- title, slug, author, version
- character.fields
- stats
- inventory
- flags
- passages
- choices
- requires
- effects

Make it deterministic. Do not use JavaScript.
Unavailable choices should be hidden by requirements.
```
