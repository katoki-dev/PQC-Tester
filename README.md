# QuantumVault PQC-Tester

A professional, browser-based auditing tool for testing Post-Quantum Cryptographic (PQC) operations. This application allows developers and security auditors to verify ML-DSA (signatures) and ML-KEM (encapsulation) implementations against the QuantumVault Backend.

## 🚀 Key Features

-   **PQC Native Support**: Integrated with `@noble/post-quantum` for client-side signing and verification using ML-DSA-87.
-   **Operation Presets**: Quickly test Sign/Verify, KEM (Encapsulate/Decapsulate), and Authenticated Encryption (GCM).
-   **Security Console**: Real-time logging of API requests, responses, and latencies with full JSON inspector.
-   **Mobile Responsive**: Fully optimized layout for Desktop, Tablet, and Mobile viewports.
-   **Enterprise Hardened**: Supports mTLS authentication and specialized signature headers for API hardening.

## 🛠️ Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or higher)
-   [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/katoki-dev/PQC-Tester.git
   cd PQC-Tester
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Usage

1. Configure your **Vault Endpoint** (default is `https://be.quantumvault.tech`).
2. Set your **Auth Key ID** and **Unified Private Key** (PEM for RSA or Hex for ML-DSA).
3. Select an operation tab (**Sign**, **KEM**, or **GCM**).
4. Run the operation and monitor the results in the **Security Console**.

## 🧪 Technical Stack

-   **Frontend**: React 19 + Vite
-   **Styling**: Vanilla CSS (Modern CSS variables + Glassmorphism)
-   **Cryptography**: 
    -   `@noble/post-quantum`: ML-DSA signing.
    -   `node-forge`: RSA operations.
    -   `axios`: Hardened API communication.

---

*Verified for the QuantumVault Security Audit Suite.*
