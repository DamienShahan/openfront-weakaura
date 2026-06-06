# OpenFront.io Unit Attack Overlay

A small JavaScript overlay for displaying unit information from the game UI.

The overlay reads the visible troop and attack values from the page, then shows a compact summary in the bottom-left corner of the screen.

## Features

- Shows current units and max units
- Shows the current unit percentage
- Shows the selected attack amount
- Calculates how many units will remain after the attack
- Calculates the remaining percentage after the attack
- Updates every 100ms
- Includes a close button to stop and remove the overlay
- Colors percentages based on safe/danger ranges

## Example Output

```text
Units: 150K / 300K 🛡️ 50%
Attack: 50K
After: 100.0K ⚔️ 33%
```

## Percentage Colors

Both the current unit percentage and the after-attack percentage use the same color stages:

| Percentage Range | Color |
|---:|---|
| 0% - 8.99% | Red |
| 9% - 19.99% | Orange |
| 20% - 59.99% | Green |
| 60% - 79.99% | Orange |
| 80% - 100% | Red |

## Usage

Open the game page, then open the browser developer console.

In Firefox or Chrome, this is usually:

```text
F12 → Console
```

Then paste the full script into the console and press Enter.

## Stop the Overlay

Click the `✕` button on the overlay, or run this in the console:

```js
unitOverlayStop()
```

## Notes

- This is designed to be pasted into the browser console.
- It is not a browser extension.
- The script depends on the current page structure and image names like `SwordIcon`.
- If the game updates its HTML structure, the selectors may need to be adjusted.
- Running the script again automatically stops the previous overlay first.

## Possible Future Improvements

- Package as a Firefox or Chrome extension
- Add a draggable overlay position
- Save the overlay position
- Add settings for update rate and color thresholds
- Add a toggle for showing or hiding each row
