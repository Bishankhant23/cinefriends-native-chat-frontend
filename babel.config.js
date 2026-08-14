const fs = require('fs');
const path = require('path');

// Load .env variables for Metro
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = process.env[key] || val;
    }
  });
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['module:@react-native/babel-preset', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-worklets/plugin',
      function inlineEnv({ types: t }) {
        return {
          visitor: {
            MemberExpression(path) {
              if (path.get("object").matchesPattern("process.env")) {
                const key = path.get("property").node.name;
                if (key === 'BACKEND_URL' || key === 'SOCKET_URL') {
                  const val = process.env[key];
                  if (val !== undefined) {
                    path.replaceWith(t.valueToNode(val));
                  }
                }
              }
            }
          }
        };
      }
    ],
  };
};



