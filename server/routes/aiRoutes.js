import express from 'express';
import { dbService } from '../services/dbService.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const lowerMsg = message.toLowerCase();
    const products = await dbService.findProducts();
    
    let occasion = '';
    let budget = 99999;
    let recipient = '';

    // Occasion matching
    if (lowerMsg.includes('anniversary') || lowerMsg.includes('wedding')) occasion = 'Anniversary';
    else if (lowerMsg.includes('birthday')) occasion = 'Birthday';
    else if (lowerMsg.includes('flower') || lowerMsg.includes('rose') || lowerMsg.includes('lily')) occasion = 'Flowers';
    else if (lowerMsg.includes('chocolate')) occasion = 'Chocolate Hampers';
    else if (lowerMsg.includes('teddy') || lowerMsg.includes('plush')) occasion = 'Teddy Bears';
    else if (lowerMsg.includes('baby') || lowerMsg.includes('kid')) occasion = 'Baby Gifts';
    else if (lowerMsg.includes('custom') || lowerMsg.includes('photo') || lowerMsg.includes('frame')) occasion = 'Customized Gifts';

    // Budget matching
    const budgetMatch = lowerMsg.match(/(?:under|below|around|budget of|₹|\$)\s*(\d+)/i) || lowerMsg.match(/(\d+)\s*(?:rupees|rs|bucks)/i);
    if (budgetMatch) {
      budget = Number(budgetMatch[1]);
    }

    // Recommendation logic
    let recommended = [];
    if (occasion) {
      recommended = products.filter(p => 
        (p.category.toLowerCase() === occasion.toLowerCase() || p.name.toLowerCase().includes(occasion.toLowerCase())) &&
        p.price <= budget
      );
    }

    // If no occasion-specific product matches, sort by rating and search description
    if (recommended.length === 0) {
      recommended = products.filter(p => p.price <= budget);
    }

    // Sort by rating to show best first
    recommended.sort((a, b) => b.ratingAverage - a.ratingAverage);
    const topPick = recommended[0];
    const alternates = recommended.slice(1, 3);

    let replyText = '';
    if (topPick) {
      replyText = `Hello! I am your GenZ AI Assistant. Based on your details, I highly recommend the **${topPick.name}** (₹${topPick.price.toLocaleString()}). ${topPick.description.substring(0, 120)}... It is rated highly (${topPick.ratingAverage}⭐) by our customers.`;
      
      if (alternates.length > 0) {
        replyText += `\n\nOther luxury options within your preference:\n` + 
          alternates.map(a => `- **${a.name}** (₹${a.price.toLocaleString()})`).join('\n');
      }
    } else {
      replyText = "Hello! I am your GenZ AI Assistant. I couldn't find any direct matches in that price range. Try searching for 'hampers' or 'chocolates' around ₹1,500!";
    }

    res.json({
      reply: replyText,
      products: recommended.slice(0, 3) // Return product data for card rendering
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
