# SayHi DApp 👋

A modern, multi-chain decentralized application that allows users to interact with various blockchain networks through a beautiful and responsive interface.

## 🌟 Features

- **Multi-Chain Support**: Seamlessly interact with multiple blockchain networks
- **Modern UI/UX**: Beautiful gradient-based design with responsive layouts
- **Theme Support**: Multiple built-in themes including:
  - Windows
  - Dark
  - Cyber
  - Sunrise
  - Oceans
  - Vibe
  - Rainbows
  - Retro
- **Wallet Integration**: Easy connection with Web3 wallets using ethers.js
- **Progress Tracking**: Visual progress indicators for blockchain interactions
- **Responsive Design**: Fully responsive layout that works on all devices
- **Error Handling**: Elegant error display and transaction status updates

## 🛠️ Technology Stack

- **Frontend**: React 19
- **Blockchain Integration**: ethers.js v5
- **Routing**: React Router v7
- **Build Tool**: Vite 6
- **Development**: ESLint for code quality
- **Styling**: Custom CSS with modern features like CSS Grid and Flexbox

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- A Web3 wallet (e.g., MetaMask)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/0xliquidated/sayhi.git
cd sayhi
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 🎨 Themes

The application comes with multiple built-in themes that can be easily switched between. Each theme provides a unique visual experience while maintaining the app's functionality.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1600px and above)
- Laptop (1200px)
- Tablet (900px)
- Mobile (600px and below)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure

```
sayhi/
├── contracts/         # Smart contract files
├── public/           # Public assets
├── src/
│   ├── assets/      # Application assets
│   ├── components/  # React components
│   ├── styles/      # CSS styles and themes
│   └── utils/       # Utility functions
├── index.html       # Entry HTML file
└── vite.config.js   # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the blazing fast build tool
- ethers.js team for the blockchain integration tools
- The blockchain community for continuous support and inspiration

Work In Progress:

SayHi is a basic dapp designed to boost onchain interactions on various mainnet and testnet EVM networks.

To make the most out of this dapp, deploy your own version of the SayHi.sol contract and add your own unique signature.  Deploy this on as many chains as you like, then change the contract addresses for each network.  

The idea is thast deploying your own smart contract + interacting with it frequently should improve the quality of the wallet and it's on-chain footprint.

Deploying your own version of the smart contract is optional, and the dapp can be interacted with as-is to simply boost contract interactions on the various supported chains.

I will attempt to add as many new chains as I can while also improving UI and adding more gamification features. 
