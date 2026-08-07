# Halo Chat UI and Motion Specification

This document describes the current Halo chat experience in implementation-level detail so it can be reproduced in another chat product. It covers layout, visual language, interaction states, motion, responsive behavior, accessibility, and the timing logic behind the simulated AI response.

The goal is not to copy framework-specific class names. The goal is to preserve the experience: a calm financial interface, asymmetric message treatment, fast tactile controls, and a visible but restrained AI lifecycle.

## 1. Experience principles

The chat should feel:

- **Calm and trustworthy.** It belongs inside a financial product, so the interface avoids playful bounce, saturated gradients, and ornamental motion.
- **AI-native but not AI-themed everywhere.** Violet is reserved for Halo-specific moments: the sparkle mark, the composer response glow, the Vault icon, and contextual “Ask Halo” actions.
- **Fast under direct manipulation.** Buttons respond in approximately 150 ms and compress slightly while pressed.
- **Legible as a conversation.** User messages are contained in subtle bubbles; assistant messages are unboxed editorial text. This makes the assistant feel like part of the product rather than a second person in a messaging app.
- **Explicit about system state.** “Thinking,” streaming, completion actions, errors, and disabled submission are represented independently.
- **Stable while content changes.** The conversation column keeps a fixed maximum width, the composer stays at the bottom, and scrolling follows the active response without moving the whole page.

## 2. Technology-neutral component model

```text
ChatPage
├── StickyPageHeader
│   ├── MobileSidebarTrigger
│   ├── ActiveChatTitle
│   └── MobileChatActions
│       ├── NewChatButton
│       └── HistoryButton
├── ChatWorkspace
│   ├── DesktopHistoryRail
│   │   ├── NewChatButton
│   │   ├── RecentChatList
│   │   └── VaultLink
│   ├── MobileHistorySheet
│   └── ConversationPane
│       ├── ScrollViewport
│       │   └── ConversationColumn
│       │       ├── EmptyState
│       │       └── MessageList
│       │           ├── UserMessage
│       │           └── AssistantMessage
│       │               ├── ThinkingIndicator
│       │               ├── StreamingResponse
│       │               ├── OptionalRichResult
│       │               ├── ResponseActions
│       │               └── NegativeFeedbackReasons
│       └── ComposerDock
│           ├── AnswerModeSegmentedControl
│           ├── ThinkingGlow
│           ├── AutoGrowingTextarea
│           ├── SendButton
│           └── SafetyDisclaimer
├── VaultDialog
└── DeleteConfirmationDialog
```

The global product shell also exposes an **Ask Halo command launcher**. It can open from a header field or `Command/Ctrl + K`, show suggested prompts, and deep-link the selected prompt into a new response on the chat page.

## 3. Design tokens

### 3.1 Typography

- Primary family: `Instrument Sans Variable`.
- Fallback stack: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
- Apply antialiasing and optimized text rendering globally.
- Default chat copy: `14px`, relaxed line height (approximately `1.625`).
- Mobile textarea copy: `16px` to avoid iOS input zoom; reduce to `14px` from the medium breakpoint.
- Chat title: `14px`, medium weight, truncated to one line.
- User and assistant body copy: `14px`, regular weight.
- Suggested prompts and history titles: `13px`.
- Mode control and feedback reasons: `12px`.
- Metadata, section labels, and disclaimer: `11px`.
- Section labels use medium weight, uppercase, and `0.05em` letter spacing.
- Large financial values use tabular figures and slightly negative tracking.

### 3.2 Shape

The base radius is `10px` (`0.625rem`). Derived shapes:

| Element | Radius |
| --- | ---: |
| Small menu item / compact button | `6–8px` |
| History row / segmented control | `8px` |
| Composer | `12px` |
| Rich-result card / upload target | `12px` |
| User message bubble | `16px` |
| Empty-state Halo mark | `16px` |
| Prompt chip / tag / badge | Fully rounded |

Use one-pixel borders. Shadows are restrained: a very light shadow on the composer, cards, and ordinary buttons; a stronger but still soft shadow on elevated dialogs, menus, and sheets.

### 3.3 Light theme colors

Colors use OKLCH so the relationships remain perceptually consistent.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.22 0.015 270);

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.22 0.015 270);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.22 0.015 270);

  --primary: oklch(0.23 0.015 265);
  --primary-foreground: oklch(0.98 0.003 265);
  --secondary: oklch(0.95 0.007 265);
  --secondary-foreground: oklch(0.23 0.015 265);
  --muted: oklch(0.95 0.007 265);
  --muted-foreground: oklch(0.5 0.015 265);

  --border: oklch(0.92 0.007 265);
  --input: oklch(0.89 0.009 265);
  --ring: oklch(0.23 0.015 265);

  --halo: oklch(0.56 0.12 285);
  --halo-foreground: oklch(1 0 0);
  --halo-subtle: oklch(0.97 0.016 285);
  --halo-border: oklch(0.91 0.03 285);

  --positive: oklch(0.56 0.13 155);
  --positive-subtle: oklch(0.97 0.025 155);
  --negative: oklch(0.56 0.17 27);
  --warning: oklch(0.66 0.13 78);
}
```

Color usage rules:

- Use near-black `--primary` for primary actions, not Halo violet.
- Use `--halo` only to identify AI-related affordances or AI activity.
- Use `--secondary` for user bubbles, selected rows, segmented-control tracks, and quiet hover fills.
- Use `--muted-foreground` for metadata, placeholders, idle icons, and disclaimers.
- Use the neutral `--ring` for focus. Focus is an interaction state, not an AI semantic state.
- Green is reserved for confirmed success and positive financial change.
- Red is reserved for destructive actions, alerts, and negative financial change.

### 3.4 Dark theme colors

```css
.dark {
  --background: oklch(0.18 0.012 285);
  --foreground: oklch(0.96 0.006 75);
  --card: oklch(0.22 0.014 285);
  --card-foreground: oklch(0.96 0.006 75);
  --popover: oklch(0.22 0.014 285);
  --popover-foreground: oklch(0.96 0.006 75);
  --primary: oklch(0.96 0.006 75);
  --primary-foreground: oklch(0.22 0.014 285);
  --secondary: oklch(0.28 0.016 285);
  --muted: oklch(0.28 0.016 285);
  --muted-foreground: oklch(0.72 0.012 75);
  --border: oklch(0.31 0.016 285);
  --input: oklch(0.34 0.018 285);
  --ring: oklch(0.92 0.01 285);
  --halo: oklch(0.7 0.13 285);
  --halo-foreground: oklch(0.18 0.012 285);
  --halo-subtle: oklch(0.25 0.025 285);
  --halo-border: oklch(0.38 0.045 285);
  --positive: oklch(0.7 0.13 155);
  --negative: oklch(0.68 0.16 27);
}
```

## 4. Motion language

### 4.1 Shared motion tokens

```css
:root {
  --motion-fast: 160ms;
  --motion-base: 220ms;
  --motion-slow: 300ms;
  --motion-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-ease-in: cubic-bezier(0.4, 0, 1, 1);
}
```

The product personality is crisp and calm. It does not use springs or bounce. Use the strong ease-out curve for entrances and direct state feedback. Use the standard curve only for continuous, repeating indicators such as thinking dots or the streaming caret.

### 4.2 Motion matrix

| Interaction | Property | Duration | Easing | Start → end |
| --- | --- | ---: | --- | --- |
| Standard button hover/state | color, background, border, shadow, opacity | `150ms` | ease-out | Current state → target state |
| Standard button press | transform | `150ms` | ease-out | `scale(1)` → `scale(0.98)` |
| Compact mode tab press | transform | `150ms` | ease-out | `scale(1)` → `scale(0.97)` |
| Stock range press | transform | `150ms` | ease-out | `scale(1)` → `scale(0.96)` |
| Destructive icon press | transform | `150ms` | ease-out | `scale(1)` → `scale(0.90)` |
| Suggested-prompt chip | background, border, transform | `150ms` | ease-out | Border/fill change; press to `0.98` |
| Assistant text first reveal | opacity | `150ms` | framework animation ease | `0` → `1` |
| Negative-feedback reasons | opacity + vertical transform | `200ms` | framework entrance ease | `opacity 0`, `translateY(-4px)` → settled |
| Tooltip open | opacity + scale + side offset | `150ms` | strong ease-out | `opacity 0`, `scale(0.95)`, `8px` offset → settled |
| Tooltip close | opacity + scale | `100ms` | strong ease-out | Settled → `opacity 0`, `scale(0.95)` |
| Dropdown open | opacity + scale + side offset | `150ms` | strong ease-out | `opacity 0`, `scale(0.95)`, `8px` offset → settled |
| Dropdown close | opacity + scale | `100ms` | strong ease-out | Settled → hidden |
| Dialog overlay open / close | opacity | `200ms / 150ms` | default animation curve | `0 ↔ 0.5` black overlay |
| Dialog panel open / close | opacity + scale | `200ms / 150ms` | strong ease-out | `opacity 0`, `scale(0.95)` ↔ settled |
| Mobile history sheet open / close | translate + opacity overlay | `300ms / 200ms` | strong ease-out | `translateX(-100%) ↔ 0` |
| Composer thinking glow | opacity | `220ms` | strong ease-out | `0 → 0.55` |
| Composer thinking glow | transform | `300ms` | strong ease-out | `scale(0.9, 0.78) → scale(1)` |
| Thinking dots | opacity + `translateY` | `1100ms`, infinite | ease-in-out | Staggered three-dot loop |
| Streaming caret | opacity | `800ms`, infinite | ease-in-out | `1 ↔ 0.2` |
| Programmatic scroll after completion | scroll position | Browser smooth scroll | browser-defined | Current → bottom |

Do not use `transition: all`. Name the exact animated properties. Most movement should stay on `transform` and `opacity`.

### 4.3 Press feedback

All ordinary pressable controls slightly compress while active. The exact amount reflects visual size:

- Full buttons and prompt chips: `scale(0.98)`.
- Compact segmented options: `scale(0.97)`.
- Very compact range buttons: `scale(0.96)`.
- Small close/delete glyph buttons: `scale(0.90)`.

Disabled buttons do not scale. Under reduced motion, press transforms are removed.

## 5. Page geometry

### 5.1 Overall shell

- Header height: `56px`.
- Chat workspace height: `100svh - 56px`.
- The header is sticky at the top with `z-index: 20`, a bottom hairline, `80%` background opacity, and medium backdrop blur.
- The workspace is a horizontal flex layout on desktop and a single conversation pane on mobile.
- Prevent horizontal overflow with `min-width: 0` on the conversation region.

### 5.2 Conversation column

- Maximum width: `768px` (`max-width: 48rem`).
- Horizontally centered within the available conversation pane.
- Horizontal padding: `16px` on mobile, `24px` at `640px` and above.
- Top and bottom content padding: `24px`.
- Message stack gap: `24px`.
- The inner conversation viewport owns vertical scrolling; the product shell does not scroll as a whole.

### 5.3 Desktop history rail

At `768px` and above:

- Width: `256px`.
- Fixed against the left edge of the chat workspace.
- Does not shrink.
- Right hairline separates it from the conversation.
- Layout: New Chat button at top, independently scrolling recent-chat list in the middle, Vault utility pinned at bottom.

Below `768px`, remove the rail from layout entirely and expose it in a left-side sheet.

### 5.4 Composer dock

- Sits after the scroll viewport in the conversation flex column, so it remains visible at the bottom without using fixed positioning.
- Uses `80%` background opacity plus medium backdrop blur so content passing behind it remains softly visible.
- Matches the conversation column’s `768px` maximum width and horizontal padding.
- Top padding: `8px`.
- Bottom padding: maximum of `12px` and `env(safe-area-inset-bottom)`.
- The segmented answer-mode control sits `8px` above the composer.
- Disclaimer sits `8px` below the composer.

## 6. Header behavior

On the chat page, the global search launcher is intentionally hidden because the composer is already the primary input.

Desktop:

- Active chat title is centered independently of the side actions.
- Title max width is `40%` of the header and truncates on one line.
- Account connection, notifications, and user account actions remain at the right.

Mobile:

- The application navigation trigger remains at the left.
- Chat title stays in the remaining center space and truncates.
- New Chat and History are `40 × 40px` ghost buttons on the right with `20px` icons.
- Notification and account-avatar controls are hidden on this page to prevent crowding; they remain available elsewhere in the product.

## 7. Empty state

When the active chat has no messages:

- Center content horizontally and vertically inside a minimum height of `55vh`.
- Halo mark container: `48 × 48px`, `16px` radius, `--halo-subtle` background, `--halo` foreground.
- Sparkle icon: `24px`.
- Intro copy begins `16px` below the mark, has a maximum width around `448px`, uses `14px` muted text, and relaxed leading.
- Prompt chips begin `24px` below the copy.
- Chips wrap, center, and use `8px` gaps.
- Chip styling: fully rounded, one-pixel neutral border, card background, `16px` horizontal and `8px` vertical padding, `13px` text.
- Hover: border becomes `--halo-border`; fill becomes a very light translucent `--halo-subtle`.
- Press: `scale(0.98)`.
- Selecting a chip submits immediately; it does not merely populate the textarea.

The current prompt set uses three financial suggestions plus one stock example. Another product should substitute domain-relevant prompts while preserving the count, line length, and wrapping behavior.

## 8. Message presentation

### 8.1 User message

- Align to the right.
- Maximum width: `85%` of the conversation column.
- Background: `--secondary`.
- Text: `--foreground`.
- Radius: `16px` on every corner; there is no speech-tail treatment.
- Padding: `16px` horizontal, `10px` vertical.
- Type: `14px`, relaxed line height.
- No avatar, name label, timestamp, shadow, border, or entrance animation.

### 8.2 Assistant message

- Align to the full text column.
- No bubble, background, border, avatar, or assistant name.
- Text: `14px`, relaxed line height, `--foreground`.
- The first visible response text fades from transparent to opaque over `150ms`.
- During streaming, render an inline caret after the last chunk.
- Only after completion should rich results and response actions appear.

This asymmetry is central to the design. Do not place both roles in matching bubbles when porting it.

### 8.3 Thinking indicator

Render a single inline row at least `32px` high:

```text
Thinking  • • •
```

- `14px` muted text.
- `8px` gap between label and dot group.
- Three `4 × 4px` circular dots in the current text color.
- `3px` gap between dots.
- Give the row `role="status"` and `aria-live="polite"`.

Animation:

```css
@keyframes thinking-dot {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.thinking-dot {
  animation: thinking-dot 1.1s ease-in-out infinite;
}
.thinking-dot:nth-child(2) { animation-delay: 120ms; }
.thinking-dot:nth-child(3) { animation-delay: 240ms; }
```

### 8.4 Streaming response

The current prototype reveals text in word-sized chunks:

1. Split the response with a pattern equivalent to `\S+\s*` so whitespace stays attached to each word.
2. Start with empty response text and status `streaming`.
3. Append one chunk every `32ms`.
4. When the last chunk appears, switch status to `complete`.

The visual caret is `1.5px` wide, `1em` high, offset `2px` from the text, vertically aligned slightly below the baseline, fully rounded, and uses the current text color.

```css
@keyframes stream-caret {
  0%, 45% { opacity: 1; }
  55%, 100% { opacity: 0.2; }
}

.stream-caret {
  display: inline-block;
  width: 1.5px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.12em;
  border-radius: 999px;
  background: currentColor;
  animation: stream-caret 0.8s ease-in-out infinite;
}
```

While streaming:

- Set `aria-busy="true"` on the response container.
- Hide the partial text from assistive technology if it would be re-announced on every chunk.
- Provide a stable screen-reader-only message such as “Halo is writing a response.”
- Do not show copy or feedback controls until completion.

In a real token-streaming integration, preserve the same presentation but batch incoming tokens into visually useful chunks. Updating the DOM on every model token can cause excess layout and scroll work.

### 8.5 Completed response actions

Place actions `8px` below the response in a horizontal row with a `2px` gap:

- Copy
- Good response
- Needs work

Each action:

- `28 × 28px`.
- `6px` radius.
- `14px` icon.
- Idle color is muted.
- Hover and active selection use `--secondary` background and foreground text color.
- The visible control is icon-only; provide a complete `aria-label`.

Copy behavior:

- Write the full completed response to the clipboard.
- Replace the copy glyph with a check glyph immediately, without a fade or morph.
- Change the accessible label from “Copy” to “Copied.”
- Restore the copy glyph after `1000ms`.

Voting behavior:

- Clicking the selected vote again clears it.
- Selecting thumbs-up hides and resets any negative-reason follow-up.
- Selecting thumbs-down reveals the negative-reason row.

### 8.6 Negative feedback reasons

- Appears `8px` below the action row.
- Flexible horizontal row that wraps on narrow screens.
- `6px` gaps.
- Entrance: `200ms` fade plus `4px` downward settle from above.
- Prompt and chips use `12px` type.
- Chips are fully rounded with a neutral border and `10px × 4px` internal padding.
- Hover uses a soft secondary fill and foreground text.
- Choosing any reason replaces the row with: “Thanks — this helps Halo improve.”

## 9. Composer

### 9.1 Answer-mode segmented control

The control switches between **Simple** and **Deep** answer modes.

- Track: content width, `8px` radius, `--secondary` background, `2px` padding, `12px` text.
- Each option: `6px` radius, `10px` horizontal and `4px` vertical padding, medium weight, capitalized label.
- Selected option: card background, foreground text, extra-small shadow.
- Unselected option: muted text; hover promotes it to foreground.
- State transition: color, background, shadow, and transform over `150ms` ease-out.
- Press scale: `0.97`.
- Tooltip delay for this control: `500ms`.
- Simple tooltip explains that the answer does not refer to provided financial information.
- Deep tooltip explains that it does refer to provided financial information.

The selected mode is captured at send time. Changing the mode after submission must not alter the response already in progress.

### 9.2 Composer surface

- Outer surface: `12px` radius, one-pixel border, card background, very light shadow.
- Content aligns to the bottom so the send button stays anchored as the textarea grows.
- Gap between textarea and button: `8px`.
- Padding: `16px` left, `6px` right, `6px` vertical.
- On focus within: border changes to `--ring`; add a `2px` ring using the ring color at approximately `15%` opacity.
- Border and ring state change without moving layout.

Textarea:

- One row by default.
- Transparent background, no independent border or outline.
- `6px` vertical padding.
- Relaxed leading.
- Cannot be manually resized.
- Auto-grows to its content height, capped at `160px`; after that it scrolls internally.
- Placeholder: “Ask me anything about your finances,” in muted text.
- `Enter` submits; `Shift + Enter` inserts a newline.
- Whitespace-only content cannot submit.

Send button:

- `32 × 32px`.
- `8px` radius.
- Near-black primary background with contrasting icon.
- Up-arrow icon: `16px`.
- Disabled when the trimmed draft is empty; disabled opacity is `50%` and pointer interaction is removed.

### 9.3 Assistant-activity glow

The glow is a status surface behind the composer, not a decorative ambient animation.

Structure the composer as two layers:

```html
<div class="composer-shell is-thinking">
  <span class="composer-glow" aria-hidden="true"></span>
  <div class="composer-surface">…</div>
</div>
```

Geometry and stacking:

- Shell is `position: relative` and creates an isolated stacking context.
- Composer surface is `position: relative; z-index: 1`.
- Glow is absolute at `z-index: 0`, extending `3px` beyond all sides.
- Glow radius: `14.4px` (`0.9rem`), slightly larger than the surface.
- Glow color: solid `--halo`.
- Glow never accepts pointer input.

Idle state:

```css
opacity: 0;
transform: scale(0.9, 0.78);
transform-origin: center;
```

Thinking or streaming state:

```css
opacity: 0.55;
transform: scale(1);
```

Transition opacity over `220ms` and transform over `300ms`, both with `cubic-bezier(0.16, 1, 0.3, 1)`. The glow remains active for both `thinking` and `streaming`, then settles away when the response becomes complete.

There is deliberately no looping gradient motion. The repeating dots and caret already communicate ongoing activity; the glow communicates the larger state change.

### 9.4 Disclaimer

- Center below the composer.
- `11px`, muted, relaxed leading.
- Copy: “AI can make mistakes. Please consult with your financial advisor before taking any actions.”
- This is persistent rather than conditionally shown.

## 10. Send and response state machine

Use explicit message states. Do not infer “thinking” from an empty string alone.

```ts
type AssistantStatus = "thinking" | "streaming" | "complete"
```

State sequence:

```text
IDLE
  └─ submit(valid draft)
      ├─ append user message
      ├─ append empty assistant message with status=thinking
      ├─ clear composer
      └─ THINKING
          └─ after 600ms
              ├─ reduced motion: set full text and status=complete
              └─ otherwise: status=streaming
                  └─ append one word chunk every 32ms
                      └─ final chunk: status=complete
```

Important implementation details:

- Generate both message IDs at submission.
- Capture the active chat ID and answer mode at submission so later navigation or mode changes do not redirect the response.
- Keep timer handles and clear them when the chat surface unmounts.
- Multiple chats may have independent in-progress assistant messages.
- “Assistant is active” is true if any assistant message in the active conversation has `thinking` or `streaming` status.
- Use that derived state to control the composer glow and scroll behavior.

### 10.1 Scrolling

Whenever the active message list or assistant-active state changes, scroll the conversation viewport to its bottom.

- During thinking and streaming: use instant/automatic scroll. Frequent smooth-scroll calls fight each other and feel unstable.
- After completion or ordinary message changes: use smooth scrolling.
- Scope the scrolling to the conversation viewport; never call a whole-page scroll.

In production, add a “user has scrolled away from bottom” guard. Automatic following should pause if the user intentionally reads earlier content, and resume through an explicit “jump to latest” affordance.

## 11. Chat history

### 11.1 Recent rows

Each history row contains a title and relative date:

- Full width.
- `8px` radius.
- `10px` left padding, `40px` right padding, `8px` vertical padding.
- Title: `13px`, medium, one-line truncation.
- Date: `11px`, muted.
- Active row: solid `--secondary` fill.
- Inactive hover: `--secondary` at approximately `60%` opacity.
- Color transition only; do not animate row position when selecting a chat.

Selecting a row immediately swaps the conversation and closes the mobile sheet.

### 11.2 Row action menu

- More button is `28 × 28px`, centered vertically, `6px` from the right edge.
- On touch-sized layouts it is always visible.
- At `768px` and above it is initially transparent and fades in when the row is hovered, focused within, or its menu is open.
- Hover/open state uses a translucent background and foreground text.
- Menu width: `144px`.
- Rename and Delete actions include leading icons; Delete uses destructive color.

### 11.3 Inline rename

Replace the row with a secondary-filled form rather than opening a dialog.

- Input receives focus and selects all text immediately.
- Input height: `28px`.
- On focus: neutral border plus a low-opacity ring.
- `Enter` saves by blurring.
- Blur saves a non-empty trimmed title.
- `Escape` cancels without saving.
- Do not animate between the row and input; immediacy is preferable for this frequent editing action.

### 11.4 Delete confirmation

Deleting a chat requires a centered dialog:

- Maximum width: approximately `384px`.
- Title: “Delete chat?”
- Description quotes the chat title and states that removal cannot be undone.
- Mobile buttons stack in reverse order; from the small breakpoint they align horizontally to the right.
- Cancel uses an outline style; deletion uses a destructive filled style.
- On completion, show a success toast reading “Chat deleted.”
- If the deleted chat was active, activate the first remaining chat.
- If no chats remain, create and activate a fresh empty chat.

### 11.5 Vault utility

The Vault is separated from recent chats by a top border and anchored at the bottom because it is a chat utility, not a peer conversation.

- Row padding: `10px × 8px` inside an `8px` radius.
- Left icon container: `28 × 28px`, `6px` radius, Halo subtle background and Halo foreground.
- Label: `13px`, medium.
- Document count: `11px`, muted, right aligned.
- Hover: soft secondary fill.

## 12. Mobile history sheet

- Triggered from the header’s History button.
- Enters from the left.
- Width: `288px`.
- Full viewport height with a right border and elevated shadow.
- No New Chat row inside; New Chat already exists in the mobile header.
- Add `24px` top padding so the absolute close button does not overlap the first list item.
- Overlay is black at `50%` opacity.
- Overlay opens in `200ms` and closes in `150ms`.
- Panel opens in `300ms` and closes in `200ms`, using strong ease-out.
- Selecting a conversation or Vault closes the sheet.
- Escape and overlay click also close it through the dialog primitive.
- Focus must be trapped while open and restored to the trigger on close.

## 13. Command launcher

Outside the chat page, the header contains an Ask Halo launcher:

- Height: `36px`.
- Rounded rectangular card field with border, small shadow, and `13px` placeholder.
- Halo sparkle at the left.
- `Command + K` keycap at the right when space allows.
- Hover shifts the border to `--halo-border` and fill to a very light Halo tint.

Opening behavior:

- Click or global `Command/Ctrl + K` toggles it.
- Dialog is positioned around `22%` from the top rather than perfectly centered vertically.
- Maximum width at the small breakpoint: `672px`.
- Search input row height: `48px`.
- Result list maximum height: `420px`.
- Groups: a dynamic “Ask” action for typed text, Suggested prompts, then navigation actions.
- Selecting a prompt closes the launcher and navigates to the chat page with the prompt encoded in the URL.
- The chat page consumes the URL prompt once, submits it, and replaces the URL to remove the query parameter.

The launcher uses the same dialog motion as other centered dialogs: overlay `200/150ms`, panel fade and `0.95 → 1` scale in `200ms`, reverse in `150ms`.

## 14. Tooltips, dropdowns, dialogs, and toasts

### Tooltips

- Global initial delay: `200ms`; answer-mode tooltips override to `500ms`.
- Dark foreground background with inverse text.
- `12px` balanced text, `12px × 6px` padding, `6px` radius.
- Use trigger-aware transform origin.
- Enter from the trigger side with an `8px` offset, `0.95` scale, and fade over `150ms`.
- Close over `100ms`.
- Include a small rotated-square arrow.

### Dropdown menus

- Minimum width: `128px`, one-pixel border, popover background, `4px` padding, `6px` radius, medium shadow.
- Use trigger-aware transform origin.
- Same `150ms` open and `100ms` close motion as tooltips.
- Items use `8px × 6px` padding, `14px` text, `100ms` color transition, and a quiet accent fill on keyboard focus.

### Dialogs

- Overlay: fixed viewport, black at `50%`, `z-index: 50`.
- Panel: centered with `translate(-50%, -50%)`, width up to viewport minus `32px`, `8px` radius, border, `24px` padding, and elevated shadow.
- Open: fade plus `scale(0.95 → 1)` in `200ms`.
- Close: reverse in `150ms`.
- Close button: top-right, reduced idle opacity, full opacity on hover, `scale(0.90)` on press.
- Modal transform origin stays centered.

### Toasts

- Default visible duration: `4000ms`.
- Use success toasts after document upload and chat deletion.
- Uploaded-document toast includes a description explaining that Halo will use the documents to tailor guidance.

## 15. Optional rich response: stock card

When the assistant recognizes a supported stock request, the completed response can append a structured stock card. It appears only after streaming completes.

Card:

- `12px` top margin.
- `12px` radius, one-pixel border, card background, small shadow, clipped overflow.
- Header padding: `16px`, increasing to `20px` horizontally on wider screens.
- Symbol: `16px`, semibold.
- Company name and metadata: `12px` muted.
- Price: `28px`, semibold, tabular figures, tight line height and slightly negative tracking.
- Gain/loss: `12px`, medium, green or red, with direction icon.
- Chart: full width and `192px` high.
- Chart line: `2.25px`, no default dots, no chart-draw animation.
- Active hover dot: `3.5px` radius with a `2px` card-colored stroke.
- Range row has a top divider and `12px` vertical padding.

Range controls use the same compact segmented language as the answer mode, but press to `scale(0.96)`. On range change, data updates without an animated chart redraw. This avoids motion competing with financial interpretation.

## 16. Vault dialog

The Vault dialog uses the shared centered-dialog motion and has a maximum width around `512px`.

Upload target:

- Full width, `12px` radius, `2px` dashed border, `24px` horizontal and `32px` vertical padding.
- Centered vertical stack with `8px` gaps.
- Upload icon container: `36 × 36px`, `12px` radius, Halo subtle background.
- Idle hover: Halo-tinted border and very light Halo fill.
- Active drag: solid Halo border and stronger Halo subtle fill.
- Transition color only; do not scale the full drop zone.

Document rows:

- `8px` radius, `8px` padding, `10px` gap.
- File icon container: `32 × 32px`, secondary background.
- Filename: `13px`, medium, truncated.
- Metadata: `11px`, muted.
- Delete action: `28 × 28px`, hidden by opacity on pointer layouts and revealed on group hover or keyboard focus.
- Destructive hover uses a translucent red background and red foreground.
- Delete press scale: `0.90`.

## 17. Responsive rules

Primary breakpoint: `768px`.

| Behavior | Below `768px` | `768px` and above |
| --- | --- | --- |
| History | Left-side sheet | Persistent `256px` rail |
| New Chat | Header icon | Full-width rail button |
| History action menu | Always visible | Revealed on hover/focus/open |
| Header account + bell | Hidden on chat page | Visible |
| Textarea font | `16px` | `14px` |
| Conversation padding | `16px` | `24px` |

Secondary breakpoint: `640px`.

- Increase conversation horizontal padding to `24px`.
- Dialog footers switch from stacked mobile layout to right-aligned row layout.
- Command launcher can reach its `672px` maximum width.

Use `svh` for the chat workspace so mobile browser chrome does not cover the composer. Always include safe-area bottom padding.

## 18. Reduced motion

Reduced motion changes movement, not information.

When `prefers-reduced-motion: reduce` is active:

- Skip word-by-word response streaming after the `600ms` thinking phase; reveal the full response and mark it complete.
- Stop thinking-dot movement. Leave all three dots visible at `0.55` opacity.
- Hide the streaming caret.
- Set the composer glow directly to final scale; animate opacity only for `150ms`.
- Remove dialog, sheet, tooltip, dropdown, and message transform/zoom/slide animations.
- Remove active press scaling.
- Remove suggestion-chip and segmented-control transform transitions.
- Preserve short color and opacity changes when they communicate focus, selection, hover, or status.

Reference CSS:

```css
@media (prefers-reduced-motion: reduce) {
  .thinking-dot {
    opacity: 0.55;
    transform: none;
    animation: none;
  }

  .stream-caret {
    display: none;
    animation: none;
  }

  .composer-glow {
    transform: scale(1);
    transition: opacity 150ms ease-out;
    will-change: auto;
  }

  .pressable:active {
    transform: none;
  }
}
```

## 19. Accessibility and input behavior

- All icon-only buttons require explicit accessible labels.
- Thinking status uses `role="status"` and polite live announcements.
- Streaming uses `aria-busy`; avoid announcing every partial chunk.
- Tooltips supplement labels and never serve as the only accessible name.
- Dialogs and sheets trap focus, close on Escape, and restore focus to their triggers.
- Selected segmented options and chart ranges expose state with `aria-pressed` or an equivalent semantic control.
- The active history row must be visually clear; consider `aria-current` in the port.
- Focus-visible state uses a neutral high-contrast ring and must remain visible in both themes.
- Touch targets in the mobile header are `40px`; retain at least that size.
- Hover-only action disclosure must also reveal on focus.
- Use pointer-capability media queries if adding any transform-based hover motion; touch devices should not inherit sticky hover effects.
- The textarea submits on Enter and creates a newline on Shift + Enter. Preserve native composition events for IME input in a production implementation.
- Keep the financial-safety disclaimer visible and readable; do not hide it in a tooltip.

## 20. Portable implementation sketch

```ts
function send(rawText: string) {
  const text = rawText.trim()
  if (!text) return

  const chatId = activeChatId
  const capturedMode = currentMode
  const userId = nextMessageId()
  const assistantId = nextMessageId()

  appendMessages(chatId, [
    { id: userId, role: "user", text },
    { id: assistantId, role: "assistant", text: "", status: "thinking" },
  ])
  clearDraft()

  registerTimeout(600, async () => {
    const response = await resolveResponse(text, capturedMode)

    if (prefersReducedMotion()) {
      updateAssistant(chatId, assistantId, response, "complete")
      return
    }

    const chunks = response.match(/\S+\s*/g) ?? [response]
    updateAssistant(chatId, assistantId, "", "streaming")

    let index = 0
    registerInterval(32, (stop) => {
      index += 1
      const complete = index >= chunks.length
      updateAssistant(
        chatId,
        assistantId,
        complete ? response : chunks.slice(0, index).join(""),
        complete ? "complete" : "streaming"
      )
      if (complete) stop()
    })
  })
}
```

For a real API, begin the thinking state immediately, replace the fixed `600ms` transition with the arrival of the first meaningful content event, and maintain a minimum thinking visibility only if necessary to prevent a flash. Do not intentionally delay an already available answer merely to imitate the prototype.

## 21. Acceptance criteria

### Visual

- Conversation content stays centered and never exceeds `768px`.
- Desktop history is exactly `256px`; mobile history is exactly `288px` and off-canvas.
- User messages are right-aligned secondary bubbles; assistant messages remain unboxed.
- Halo violet appears only on AI affordances and active AI state.
- Composer, rich cards, menus, and dialogs use consistent radii, borders, and restrained shadows.
- Empty state remains vertically balanced at short and tall viewport heights.

### Motion

- Pressing a normal button gives immediate subtle compression and releases cleanly.
- The composer glow begins as soon as an assistant message enters thinking state and remains through streaming.
- Thinking dots loop with `120ms` stagger and only `2px` vertical travel.
- Response text starts after the thinking state and reveals in `32ms` word chunks in the prototype mode.
- Completion removes the caret and glow, then exposes actions and any rich result.
- Menus and tooltips open in `150ms` and close in `100ms` from their trigger origin.
- Dialogs open in `200ms` and close in `150ms`; sheets open in `300ms` and close in `200ms`.
- No financial chart line animates when data or range changes.

### Interaction

- Empty prompt chips submit immediately.
- Enter submits and Shift + Enter creates a newline.
- Composer grows to `160px`, then scrolls internally.
- Whitespace-only drafts keep Send disabled.
- Copy confirmation appears instantly and resets after one second.
- Downvote exposes reason chips; another vote resets them.
- Selecting a history item closes the mobile sheet.
- Rename supports focus/select-all, Enter, blur, and Escape correctly.
- Deleting the last chat creates a new empty chat.
- Deep-linked prompts are consumed exactly once even under development strict-mode rendering.

### Accessibility and reduced motion

- Keyboard focus is visible everywhere.
- Icon-only actions have useful names.
- Live response state is announced without re-reading every streamed chunk.
- All transforms, loops, and slides are removed or simplified as specified under reduced motion.
- Dialog focus is trapped and restored.
- Mobile primary actions maintain `40px` touch targets and respect safe areas.

## 22. Source map in the current project

These files are the implementation sources from which this specification was derived:

- `src/routes/ask.tsx` — chat state, layout, history, message lifecycle, composer, feedback, and responsive sheet.
- `src/index.css` — product tokens, thinking dots, streaming caret, composer glow, and reduced-motion overrides.
- `src/components/ask-halo.tsx` — global command launcher and deep-linked prompts.
- `src/components/ask/stock-widget.tsx` — optional structured stock response.
- `src/components/ask/vault.tsx` — Vault dialog, upload target, and document rows.
- `src/components/site-header.tsx` — sticky header and responsive chat actions.
- `src/components/ui/button.tsx` — shared button geometry and press response.
- `src/components/ui/dialog.tsx` — centered modal motion.
- `src/components/ui/sheet.tsx` — mobile off-canvas motion.
- `src/components/ui/tooltip.tsx` and `src/components/ui/dropdown-menu.tsx` — origin-aware overlay motion.

When porting, treat the values in this document as the behavioral contract. Framework primitives may change, but the state sequence, geometry, motion timings, accessibility behavior, and restrained visual hierarchy should remain intact.
