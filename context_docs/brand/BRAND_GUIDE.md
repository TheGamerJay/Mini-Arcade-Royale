# Brand Guide

**Document Purpose**: Establish visual, verbal, and emotional identity for Mini Arcade Royale.

---

## Brand Identity

### Name
**Mini Arcade Royale** — Configurable to Mini Pasttime, Mini Royal Fun, or Mini Arcade

### Tagline
*"Premium arcade entertainment, virtual credits, real fun."*

### Mission
To create a trustworthy, visually stunning digital arcade experience where players can compete, earn rewards, and have genuine fun without financial risk.

### Values
- 🎯 **Integrity**: Transparent economy, honest policies, server-authoritative
- 💎 **Premium Quality**: High-end UX, modern design, smooth interactions
- 🤝 **Trustworthy**: Clear support, fast responses, real human engagement
- 🚀 **Innovative**: Polished games, retention loops, exciting features
- ♿ **Inclusive**: Accessible design, diverse player welcome

---

## Visual Identity

### Color Palette

#### Primary Colors
- **Electric Blue**: `#00D9FF` (primary CTA, highlights, glow)
- **Royal Purple**: `#9D4EDD` (secondary accents, gradient pairs)

#### Dark Mode (Primary)
- **Dark Background**: `#0F0F1E` (main bg)
- **Dark Surface**: `#1A1A2E` (cards, containers)
- **Text Primary**: `#FFFFFF` (headings, body)
- **Text Secondary**: `#B0B0C0` (descriptions, metadata)

#### Semantic Colors
- **Success**: `#00D084` (positive actions, rewards)
- **Warning**: `#FFB800` (alerts, caution)
- **Error**: `#FF4757` (destructive, problems)

#### Gradients
- **Primary Gradient**: Electric Blue → Royal Purple (`135deg`)
- **Glow Effect**: Cyan/Violet radial gradient with opacity

### Typography

**Font Stack**
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

**Text Hierarchy**
- **H1**: 56px, 700 weight, gradient (hero)
- **H2**: 32px, 700 weight, primary color (page titles)
- **H3**: 24px, 700 weight, secondary color (section headers)
- **Body**: 16px, 400 weight, text-secondary
- **Small**: 14px, 400 weight, muted text
- **Label**: 12px, 600 weight, all-caps (input labels)

### Components

#### Buttons
- **Primary**: Electric blue gradient, glow shadow on hover
- **Secondary**: Transparent with purple border
- **Danger**: Red gradient, confirmation required
- **Disabled**: 50% opacity, no pointer

#### Cards
- **Background**: Dark surface with 1px border (1-2% opacity primary color)
- **Hover**: Border brighten, slight lift (`translateY(-5px)`)
- **Glow**: Optional, 10-20px shadow on interaction

#### Inputs
- **Border**: 1px primary with 30% opacity
- **Focus**: Full opacity border + glow shadow
- **Error**: Red border, error message below

### Spacing Scale
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### Border Radius
- **None**: 0px
- **Small**: 4px (tight, inputs)
- **Medium**: 8px (cards, buttons)
- **Large**: 12px (modals, large cards)
- **Full**: 9999px (pills, avatars)

### Shadows & Glow
- **Subtle**: 0 2px 8px rgba(0,0,0,0.3)
- **Medium**: 0 10px 30px rgba(0,217,255,0.1)
- **Glow**: 0 0 20px rgba(0,217,255,0.4)
- **Heavy**: 0 20px 60px rgba(0,0,0,0.5)

### Animation & Motion

#### Easing
- **Ease-In**: Slow start → fast end
- **Ease-Out**: Fast start → slow end
- **Ease-In-Out**: Smooth both
- **Cubic Bezier**: `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce)

#### Timing
- **Quick**: 150ms (hover, small interactions)
- **Normal**: 300ms (transitions, reveals)
- **Slow**: 600ms (page animations, suspense)

#### Effects
- **Fade**: Opacity 0 → 1 (300ms ease-out)
- **Scale**: Transform scale 0.95 → 1 (300ms ease-out)
- **Lift**: TranslateY 2px → 0 (200ms ease-out)
- **Glow**: Box-shadow expand (300ms ease-out)
- **Float**: Subtle up/down motion (20s infinite bounce)

### Visual Restrictions
- ❌ **Avoid**: Pixelated graphics, comic sans, skeuomorphic casino look
- ❌ **Avoid**: Auto-playing audio, heavy animations that slow
- ❌ **Avoid**: Cheap-looking gradients or neon overload
- ❌ **Avoid**: Blinking, flashing content (accessibility)
- ✅ **Do**: Smooth easing, premium typography, intentional whitespace
- ✅ **Do**: Glassmorphism sparingly (blur + semi-transparency)
- ✅ **Do**: Modern, clean UI with personality

---

## Voice & Tone

### Personality
- **Friendly** — Approachable, conversational, human
- **Confident** — Trust the platform, we know what we're doing
- **Exciting** — Energy around games, rewards, progression
- **Clear** — Jargon-free, direct, no fluff

### Tone Variations

#### Error Messages
*Empathetic, solution-focused*
- ❌ "Error 401: Unauthorized"
- ✅ "Oops! Please log in to play."

#### Success Messages
*Celebratory, brief*
- ❌ "Transaction processed successfully"
- ✅ "🎉 You earned 50 credits!"

#### Support
*Patient, thorough, warm*
- ❌ "Please provide all required information."
- ✅ "Help us help you — tell us what happened?"

#### Legal / Policy
*Clear, professional, honest*
- ❌ "Credits may vary in value"
- ✅ "Credits are entertainment currency. They have no real-world cash value."

### Writing Guidelines
- **Use "you"** instead of "user" or "account holder"
- **Use contractions** — "can't", "you'll", "we're"
- **Use active voice** — "You earned" not "Credits were earned"
- **Be specific** — "You have 5 games remaining" not "Some games left"
- **Give clear CTAs** — "Start Playing", "Buy Credits", not "Continue"
- **Avoid jargon** — Plain language for technical concepts
- **Match the moment** — Casual in-game, formal in legal pages

### Brand Statements

#### About Arcade Gaming
*"Arcade games are pure fun. No stakes, just skill and luck. We've brought that timeless joy online with a modern twist."*

#### About Credits
*"Credits are our virtual currency. You buy them with real money, spend them on games, and win more through play. They're only good on our platform."*

#### About Trust
*"We're transparent about how the game works. Server decides outcomes, all plays are logged, your account is always your control."*

---

## Logo & Wordmark

### Logo Mark
- **Symbol**: Lightning bolt + arcade joystick (stylized, single line)
- **Color**: Electric blue with purple accent
- **Usage**: Social, favicon, app icon, branding

### Wordmark
- **Format**: "Mini Arcade Royale" (or config variant)
- **Font**: Custom or Montserrat Bold
- **Color**: Gradient electric blue → purple
- **Minimum Size**: 100px width for legibility

### Clear Space
Maintain padding around logo equal to bolt width.

### Don'ts
- Don't rotate logo
- Don't add drop shadows or effects
- Don't use on backgrounds with insufficient contrast
- Don't stretch or distort proportions

---

## Imagery & Photography

### Game Screenshots
- High-resolution, 2x pixel density
- Showcase normal gameplay, not exaggerated outcomes
- Highlight premium feel, smooth animations
- Include UI elements for authenticity

### Player Avatars
- Circular (9999px radius)
- 64x64 min, 512x512 max for scaling
- Optional gradient background if no custom image
- Default avatar: First letter of username in circle

### Icons
- Use Lucide React, Heroicons, or consistent custom set
- 24px base size for UI, 32–56px for large graphics
- Stroke weight: 2px (consistent)
- Color: Match text color (inherit) or primary

---

## Compliance & Legal Branding

### Required Disclosures
- Include "credits have no real-world cash value" in store
- Show "Not redeemable for money" in credits policy
- Include age verification (18+) on signup (if applicable)
- Show "Terms, Privacy, Refund Policy" footer links

### No Gambling Language
- Don't use: "odds", "bet", "wager", "pot", "rake", "jackpot"
- Do use: "play", "win", "rewards", "earn", "balance"

### Responsible Gaming
- Optional: Show balance summary every 30 min
- Optional: Set session limits
- Optional: Weekly summary email

---

## Design System Tokens

### CSS Variables (Example)
```css
:root {
  --color-primary: #00D9FF;
  --color-primary-dark: #0099BB;
  --color-secondary: #9D4EDD;
  --color-secondary-light: #C77DFF;
  
  --bg-dark: #0F0F1E;
  --bg-surface: #1A1A2E;
  
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0C0;
  
  --color-success: #00D084;
  --color-warning: #FFB800;
  --color-error: #FF4757;
  
  --spacing-unit: 4px;
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
  --shadow-md: 0 10px 30px rgba(0,217,255,0.1);
  --shadow-glow: 0 0 20px rgba(0,217,255,0.4);
}
```

---

## Success Criteria

- [x] Color palette defined and tested for accessibility
- [x] Typography hierarchy established
- [x] Voice & tone guidelines clear
- [x] Design restrictions and principles documented
- [x] Component design patterns ready for implementation
- [ ] Design system component library (Phase 1)
