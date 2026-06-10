const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Using a local fallback database for demonstration since no URI was provided)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema & Model
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// API Routes
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        // Save to database
        const newContact = new Contact({ name, email, subject, message });
        await newContact.save();

        res.status(201).json({ success: true, message: 'Message received successfully!' });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ success: false, error: 'Server error. Could not send message.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
