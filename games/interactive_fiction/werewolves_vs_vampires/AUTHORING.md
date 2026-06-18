# Static Choice-Based Interactive Fiction Engine v1

One folder is one game.

## Files

```txt
index.html
style.css
engine.js
story.yaml
```

Open `index.html` through a local static server, not usually by double-clicking it, because browsers often block `fetch("./story.yaml")` from `file://`.

Example:

```bash
python3 -m http.server 8000
```

Then visit:

```txt
http://localhost:8000/
```

## Debug URLs

```txt
?debug=1
?skipValidation=1
```

Debug mode shows validation and state. Skip validation lets you play even if validation has errors.

## Save state

Saves use `localStorage`, so they work on static hosting. Saves are per browser/device, not cloud saves.

## YAML concepts

- `character.fields` defines character creation.
- `stats` are game-specific numbers.
- `inventory` declares valid key items.
- `flags` declares valid booleans.
- `passages` are story chunks.
- `choices` move between passages.
- `requires` hides unavailable choices.
- `effects` modifies state.

## Requirement examples

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

## Effect examples

```yaml
effects:
  stats:
    charm: 1
    suspicion: -1
  add_items:
    - chapel_key
  flags:
    met_hunter: true
```

## Variables

Use `{{name}}` or explicit paths like:

```txt
{{character.name}}
{{stats.grit}}
{{flags.met_hunter}}
```
