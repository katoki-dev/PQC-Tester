# QuantaVault PQC API Tester

A robust, specialized tool for testing Post-Quantum Cryptography (PQC) API endpoints. Built to streamline the audit and verification process for QuantaVault's cryptographic operations.

## 🚀 Key Features

-   **PQC Operations**: Built-in presets for `Sign`, `Verify`, `Encapsulate`, `Decapsulate`, `Encrypt`, and `Decrypt` using ML-KEM and ML-DSA algorithms.
-   **Key Management**: Seamlessly manage PQC keys with presets for listing, creating, and rotating keys.
-   **Audit Helpers**: A dedicated system to fetch active policies and automatically populate `pqcKeyId` and `authKeyId` fields, reducing manual copy-pasting.
-   **Mobile Responsive**: Fully optimized for mobile use with a toggleable sidebar and a vertically stacked layout on small screens.
-   **Large Body Support**: Resizable textareas and scrollable panes to handle large JSON request and response bodies with no truncation.
-   **Request History**: Automatically saves the last 50 requests locally for quick restoration.
-   **Keyboard Shortcuts**: Press `Ctrl + Enter` (or `Cmd + Enter` on Mac) to quickly send requests.

## 🛠️ Getting Started

1.  **Configure Connection**:
    -   Enter your **API Base URL** (e.g., `http://localhost:5000/api`).
    -   Paste your **JWT Token** in the sidebar to authorize requests.
    -   Click **Test Connection** to verify connectivity to the `/health` endpoint.

2.  **Select an Operation**:
    -   Use the **Quick Operations** bar to load presets for various PQC tasks.
    -   The HTTP method, path, and a template body will be automatically loaded.

3.  **Use Audit Helpers (Recommended)**:
    -   Click **Refresh Policies** in the sidebar.
    -   Select a policy from the dropdown.
    -   The `pqcKeyId` and `authKeyId` in your request body will be automatically updated with the correct values from the selected policy.

4.  **Send & Analyze**:
    -   Modify the request body or headers as needed.
    -   Click **Send** or use the shortcut.
    -   View the status, response time, and full response body in the right/bottom pane.

## 🧪 Technical Details

-   **Stack**: Vanilla HTML5, CSS3, and modern JavaScript (ES6+).
-   **No Dependencies**: Completely standalone tool, no `npm install` required.
-   **Storage**: Uses `localStorage` to persist your request history and connection settings.
-   **Responsive Design**: Uses CSS Flexbox and Media Queries for a seamless experience across desktop, tablet, and mobile.

---

*Part of the QuantaVault Security Audit Tooling Suite.*
