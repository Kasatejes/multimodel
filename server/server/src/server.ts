import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Nexus AI Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
