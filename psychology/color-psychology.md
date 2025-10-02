# Color Psychology

Color sets expectations before a single word is read. But context rules everything:
red means danger in a form, appetite at a restaurant, and loss on a trading screen.
Apply these as *priors*, adjusted by sector (`industries/`) and audience culture.

## Hue priors (Western-market defaults)

| Hue | Signals | Owns these sectors | Watch out |
|---|---|---|---|
| **Blue** | trust, stability, competence | fintech, enterprise, healthcare, security | the most-used SaaS color — differentiate by shade (electric vs. navy) or leave the cliché |
| **Deep navy** | authority, establishment | banking, legal, B2B enterprise | can feel cold; pair warm neutrals |
| **Green** | growth, health, money, "go" | finance (gains), health, sustainability, dev tools (success) | two greens on one screen (brand + semantic success) collide — separate clearly |
| **Purple/violet** | innovation, premium, creativity | AI (cliché-saturated), creative tools, luxury | the default "AI gradient" — using it now signals template, not innovation |
| **Red** | urgency, energy, appetite, danger | food, entertainment, sales | never brand-red for products with error-heavy UIs; reserve for semantics |
| **Orange** | energy, affordability, friendliness | consumer, marketplaces, CTAs | reads "budget" in luxury contexts |
| **Yellow/amber** | optimism, caution | consumer joy accents; warning semantics | worst text color in existence; contrast nightmare |
| **Black/near-black** | luxury, authority, editorial | fashion, premium hardware, dev tools | dark ≠ premium automatically — craft does the promoting |
| **Warm neutrals (cream/sand)** | calm, organic, editorial | wellness, education, portfolio | the current "anti-SaaS" differentiator; pairs with serif display |

## Saturation & lightness psychology
- **High saturation** = energy, youth, consumer. **Muted** = maturity, calm, enterprise. This axis matters more than hue choice for tone.
- Pastels: friendly, soft — but check AA contrast; pastels-as-text almost always fail.
- Dark themes read technical/pro/focused; light themes read open/trustworthy/mainstream (`brain/decision-framework.md` theme choice).

## Cultural notes (check per target market)
- Red = luck/prosperity (China), mourning contexts vary; white = purity (West) vs. mourning (parts of East Asia); green = religious significance (Middle East), money (US mainly — elsewhere less so).
- Finance UI conventions flip: US/EU red=loss/green=gain; China red=gain.
- Global products: rely on *semantics + icons + labels*, never hue folklore alone.

## Functional color psychology (in-product)
- **The accent teaches interactivity:** within minutes users learn "this hue = clickable". Guard the lesson — never spend the accent decoratively (`foundations/colors.md`).
- **Semantic consistency is safety:** green=success, amber=caution, red=destructive/error — deviating breaks learned reflexes precisely when stakes are highest.
- **Emotional thermostat:** error pages and destructive confirms should *cool* (neutral surfaces, one red element), not alarm-paint the whole screen. Panic causes mistakes.
- **Color as quantity is a lie detector:** heatmaps/charts need perceptually uniform ramps (`dataviz` discipline) — rainbow ramps misrepresent data.

## Choosing a brand accent (the DesignOS procedure)
1. List the sector's trust prior (table above) and the top 3 competitors' hues.
2. Decide: *conform* (trust-critical sectors: fintech, health, security → stay near the prior) or *differentiate* (crowded consumer/SaaS → move hue or execution).
3. Differentiate by execution first (shade, pairing, usage discipline) before exotic hues — a disciplined blue beats a chaotic chartreuse.
4. Verify: AA contrast as text-on-white AND white-text-on-it (button use); distinguishable from your semantic red/green/amber; survives desaturation (dark-mode variant exists).
5. Record the decision + reasoning in `memory/brand.md`.

## Anti-patterns
- Choosing brand color by founder preference against sector trust priors (purple bank, red hospital)
- Accent = semantic color (green brand + green success = every CTA looks like a success toast)
- Emotional manipulation via alarm-red on non-dangerous upsells
- Hue folklore over testing ("blue converts best" — *your* audience decides)

## Checklist
- [ ] Accent chosen by procedure, reasoning recorded
- [ ] Accent ≠ any semantic hue; both directions AA-valid
- [ ] Saturation level matches audience maturity
- [ ] Target-market cultural check done
- [ ] Semantics conventional and consistent product-wide
