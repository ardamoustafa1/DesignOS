# DesignOS Edit Hooks

`designos-hook.js` runs the unified detector registry after an agent edit. It accepts a
JSON event on stdin and recognizes `file_path`, `path`, or `tool_input.file_path`.

Set `DESIGNOS_HOOK_MODE` to `observe`, `warn` (default), `block`, or `deep-on-stop`.
Provider manifests are installed by `designos hooks install`; unrelated hook entries are
preserved. Deep stop mode runs both the static audit and browser gate configured for the
project.
