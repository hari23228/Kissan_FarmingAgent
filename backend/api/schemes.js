const express = require('express');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { query, category, state } = req.query;
    
    // TODO: Implement scheme search
    // - Search government schemes database
    // - Filter by category, state
    // - Return matching schemes
    
    res.json({
      success: true,
      schemes: [
        {
          id: '1',
          name: 'PM-KISAN',
          description: 'Direct income support to farmers',
          category: 'Financial Support',
          eligibility: ['Small farmers', 'All states'],
          benefits: '₹6000 per year'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Get scheme details
    
    res.json({
      success: true,
      scheme: {
        id,
        name: 'Sample Scheme',
        description: 'Detailed description',
        howToApply: ['Step 1', 'Step 2'],
        documents: ['ID proof', 'Land records'],
        applicationUrl: 'https://example.com/apply'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/recommend', async (req, res) => {
  try {
    const { userProfile } = req.body;
    
    // TODO: Recommend schemes based on user profile
    
    res.json({
      success: true,
      recommendations: []
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
