# Online Ink Editor

A web-based editor for creating and testing [ink](https://www.inklestudios.com/ink/) interactive narrative stories. This editor provides a split-pane interface with real-time compilation and preview.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd online-ink-editor
```

1. Install dependencies:

```bash
npm install
```

1. Start the development server:

```bash
npm run dev
```

1. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Write Ink Code**: Type or paste your Ink story in the left editor pane
2. **See Live Preview**: The story automatically compiles and runs in the right pane
3. **Make Choices**: Click on choices to progress through your story
4. **Restart**: Use the Restart button to replay from the beginning
5. **Save**: Use File → Save Project to store in localStorage
6. **Export**: Use File → Export as JSON to download your story
7. **View Stats**: Use Story → Story Statistics to see detailed analytics

## Sample Ink Story

The editor comes with a simple starter story. Here's a more complex example:

```ink
VAR player_name = "Hero"
VAR health = 100

=== start ===
Welcome to the adventure, {player_name}!

* [Explore the forest]
    -> forest
* [Enter the cave]
    -> cave

=== forest ===
You venture into the dark forest.
~ health = health - 10
Your health is now {health}.

* [Continue deeper]
    -> forest_deep
* [Return to start]
    -> start

=== forest_deep ===
You found a treasure!
-> END

=== cave ===
The cave is cold and dark.
-> END
```

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [ink](https://www.inklestudios.com/ink/) - The narrative scripting language.
- [inkjs](https://github.com/y-lohse/inkjs) - JavaScript port of ink.
- [CodeMirror](https://codemirror.net/) - Code editor component.
