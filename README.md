# AI Boxing Coach

An intelligent boxing training application that provides programmable workouts with voice commands and AI-powered form analysis.

## Features

### 🥊 Interactive Workouts
- **Programmable Timer**: Configure rounds, duration, and rest periods
- **Voice Commands**: Real-time audio callouts for punches and defensive moves
- **Random Intervals**: Tests reflexes with randomized move sequences
- **Multiple Boxing Styles**: Support for Mexican, American, Cuban, Soviet, and Universal styles

### 🎯 AI Form Analysis
- **Video Recording**: Record your training sessions
- **Frame Analysis**: AI analyzes your technique from video frames
- **Style-Specific Feedback**: Get coaching based on your chosen boxing style
- **Detailed Reports**: Receive scores, strengths, and areas for improvement

### 🌍 Boxing Styles

- **Mexican Style**: Aggressive pressure fighting with heavy body punching and head movement
- **American Style**: Versatile style mixing power punching with defensive shoulder rolls
- **Cuban Style**: Technical amateur-based style emphasizing footwork, distance, and counter-punching
- **Soviet Style**: Systematic approach with emphasis on jabs, straight punches, and ring control
- **Universal**: Fundamental techniques used across all styles

## Getting Started

### Prerequisites
- Node.js 16+
- Modern web browser with camera access (for form analysis)
- Anthropic API key (for AI analysis feature)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/grantjm9992/boxingai.git
cd boxingai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (typically `http://localhost:5173`)

## Usage

### Workout Mode

1. Select your preferred boxing style
2. Configure workout parameters:
   - Number of rounds (1-12)
   - Round duration (1-5 minutes)
   - Rest duration (30-120 seconds)
   - Move callout interval (2-10 seconds)
3. Click "Start Workout"
4. Follow the voice commands during your training

### Analysis Mode

1. Configure your boxing style and preferences
2. Click "Record & Analyze Form"
3. Enter your Anthropic API key when prompted
4. Grant camera permissions
5. Record yourself performing boxing techniques
6. Stop recording to receive AI analysis
7. Review your score, strengths, and areas for improvement

## API Key Setup

To use the AI analysis feature, you need an Anthropic API key:

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Create an account or sign in
3. Generate an API key
4. Enter the key when prompted in the application

**Note**: Your API key is stored only in your browser session and is never sent to any server except Anthropic's API.

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **AI Analysis**: Anthropic Claude API with vision capabilities
- **Voice**: Web Speech API (SpeechSynthesis)
- **Video**: MediaRecorder API

## Features in Detail

### Voice Command System
The application uses the Web Speech API to provide real-time audio feedback:
- Announces round start/end
- Calls out random punches and defensive moves
- Adjustable pitch and rate for clear commands

### AI Analysis
Powered by Claude's vision capabilities:
- Analyzes video frames for form and technique
- Evaluates stance, guard, punch technique, and footwork
- Provides style-specific coaching
- Scores performance on a 1-10 scale

### Boxing Move Database
Includes comprehensive move sets:
- **Punches**: Jab, Cross, Hooks, Uppercuts, Body shots, Overhand, Shovel hook
- **Defense**: Slips, Ducks, Rolls, Blocks, Parries, Pull backs, Shoulder roll
- **Combinations**: One-two, One-two-hook, Double jab-cross, Hook-cross-hook, Body-head

## Browser Compatibility

- Chrome/Edge 80+ (recommended)
- Firefox 75+
- Safari 14+

Camera and microphone features require HTTPS in production.

## Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Security Notes

- The Anthropic SDK is configured with `dangerouslyAllowBrowser: true` for demonstration purposes
- For production deployments, implement a backend proxy to handle API keys securely
- Never commit your API keys to version control

## Future Enhancements

- Save workout history and progress tracking
- Custom workout templates
- Comparison videos for proper form demonstration
- Multi-angle analysis support
- Social features for sharing progress

## License

MIT

## Acknowledgments

- Anthropic for Claude AI
- The boxing community for style documentation and technique references
