<h2>🔥 Firebase & Firestore Setup</h2>

<p>Follow these steps to set up Firebase and Firestore for the <code>diagram-builder</code> project.</p>

<h3>1️⃣ Create Firebase Project</h3>
<ol>
  <li>Go to <a href="https://console.firebase.google.com/" target="_blank">Firebase Console</a></li>
  <li>Click <strong>"Add Project"</strong></li>
  <li>Enter a project name (e.g., <code>diagram-builder</code>)</li>
  <li>(Optional) Disable Google Analytics</li>
  <li>Click <strong>"Create Project"</strong></li>
</ol>

<h3>2️⃣ Enable Authentication</h3>
<ol>
  <li>In Firebase Console, go to <strong>Authentication → Get Started</strong></li>
  <li>Open the <strong>Sign-in method</strong> tab</li>
  <li>Enable <strong>Email/Password</strong> provider</li>
  <li>Click <strong>Save</strong></li>
</ol>

<h3>3️⃣ Create Firestore Database</h3>
<ol>
  <li>Go to <strong>Firestore Database → Create Database</strong></li>
  <li>Choose <strong>Start in production mode</strong></li>
  <li>Select your region</li>
  <li>Click <strong>Enable</strong></li>
</ol>

<h3>4️⃣ Set Up Firestore Security Rules</h3>
<p>Go to <strong>Firestore Database → Rules</strong> tab and replace with the following:</p>

<pre><code>
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Diagrams collection
    match /diagrams/{diagramId} {
      allow read: if request.auth != null 
      
      allow create: if request.auth != null && 
        request.resource.data.ownerId == request.auth.uid;
      
      allow update, delete: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid ||
         (request.auth.uid in resource.data.collaborators.keys() &&
          resource.data.collaborators[request.auth.uid] == 'editor'));
    }
  }
}
</code></pre>

<h3>5️⃣ Get Firebase Config</h3>
<ol>
  <li>Go to <strong>Project Settings</strong> (gear icon in the sidebar)</li>
  <li>Scroll to the <strong>"Your apps"</strong> section</li>
  <li>Click the Web icon (<code>&lt;/&gt;</code>)</li>
  <li>Register your app (e.g., <code>diagram-builder-web</code>)</li>
  <li>Copy the Firebase configuration object</li>
</ol>

<h3>6️⃣ Create Environment Variables</h3>
<p>Create a <code>.env.local</code> file in the root of your <strong>Next.js</strong> project:</p>

<pre><code>NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
</code></pre>

<p>Replace each <code>your_...</code> with the actual values from your Firebase config object.</p>

## Getting Started

<h2> NPM Install</h2>
<pre><code>npm install</code></pre>

<h2>🚀 Start Development Server</h2>

<pre><code>npm run dev</code></pre>

<p>Then open your browser and go to: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>

<hr />

<h2>📖 Usage Guide</h2>

<h3>🔐 First-Time Setup</h3>

<h4>Sign Up</h4>
<ol>
  <li>Go to the login page</li>
  <li>Click <strong>"Don't have an account? Sign up"</strong></li>
  <li>Enter email, password, and select role (Editor or Viewer)</li>
  <li>Click <strong>"Sign up"</strong></li>
</ol>

<h4>Create Your First Diagram</h4>
<ol>
  <li>After login, you'll be redirected to the Dashboard</li>
  <li>Click <strong>"Create New Diagram"</strong> (Editors only)</li>
  <li>Enter a diagram title</li>
  <li>Click <strong>"Create"</strong></li>
</ol>

<h4>Edit Diagrams</h4>
<ul>
  <li>Enter a label in the input field</li>
  <li>Click <strong>"Add Node"</strong> to create nodes</li>
  <li>Drag nodes to reposition them</li>
  <li>Click and drag from one node's edge to another to create connections</li>
  <li>Click <strong>"Save"</strong> to persist changes</li>
</ul>

<h4>Share Diagrams</h4>
<ol>
  <li>Open a diagram you own</li>
  <li>Click the <strong>"Share"</strong> button</li>
  <li>Invite users by email and assign <strong>Editor</strong> or <strong>Viewer</strong> access</li>
</ol>

<h4>⌨️ Keyboard Shortcuts</h4>
<ul>
  <li><kbd>Enter</kbd> (in node label input) — Add new node</li>
  <li><kbd>Backspace</kbd>/<kbd>Delete</kbd> — Delete selected nodes/edges (Editors only)</li>
</ul>

<hr />

<h2>📁 Project Structure</h2>

<pre><code>diagram-builder/
├── app/                      # Next.js app router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (redirects)
│   ├── login/               # Authentication page
│   ├── dashboard/           # User dashboard
│   ├── diagram/[id]/        # Diagram editor
│   └── profile/             # User profile
├── components/              # Reusable React components
├── lib/
│   ├── firebase/            # Firebase configuration & services
│   │   ├── config.ts        # Firebase initialization
│   │   ├── auth.ts          # Authentication functions
│   │   └── firestore.ts     # Database operations
│   └── types/               # TypeScript type definitions
│       └── index.ts         # All app types
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   └── usePermissions.ts    # Permission checking hook
├── __tests__/               # Unit and integration tests
└── .env.local               # Environment variables (not in git)
</code></pre>

<hr />

<h2>🧩 Database Schema</h2>

<h4>👤 Users Collection (<code>users/{userId}</code>)</h4>

<pre><code>interface User {
  email: string;
  role: 'editor' | 'viewer';
  createdAt: Timestamp;
}
</code></pre>

<h4>📊 Diagrams Collection (<code>diagrams/{diagramId}</code>)</h4>

<pre><code>interface Diagram {
  title: string;
  ownerId: string;
  ownerEmail: string;
  nodes: Node[];              // React Flow nodes
  edges: Edge[];              // React Flow edges
  collaborators: {
    [userId: string]: 'editor' | 'viewer';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
</code></pre>

<hr />

<h2>🧪 Testing</h2>

<h4>Run unit tests:</h4>
<pre><code>npm test</code></pre>

<h4>Run tests in watch mode:</h4>
<pre><code>npm test -- --watch</code></pre>

<h4>Run tests with coverage:</h4>
<pre><code>npm test -- --coverage</code></pre>

<hr />

<h2>🚀 Deployment</h2>

<h4>Deploy to <a href="https://vercel.com" target="_blank">Vercel</a>:</h4>
<ol>
  <li>Push your code to GitHub</li>
  <li>Go to <a href="https://vercel.com" target="_blank">Vercel</a></li>
  <li>Import your repository</li>
  <li>Add environment variables from <code>.env.local</code></li>
  <li>Click <strong>"Deploy"</strong></li>
</ol>
