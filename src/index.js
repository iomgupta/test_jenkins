const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Set up middleware
app.use(express.json());

// Define routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sample API!', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// A simple function that can be tested
function greeting(name) {
  return `Hello, ${name}!`;
}

// Export for testing
module.exports = { app, greeting };

// Start the server if not being imported for tests
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
