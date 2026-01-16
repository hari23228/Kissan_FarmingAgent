const express = require('express');
const router = express.Router();
const pricesService = require('../services/pricesService');
const groqPriceService = require('../services/groqPriceService');

/**
 * GET /api/prices/current
 * Fetch current market prices from both APIs
 * Query params: crop, state, district
 */
router.get('/current', async (req, res) => {
  try {
    const { crop, state, district } = req.query;
    
    if (!crop) {
      return res.status(400).json({ 
        success: false, 
        error: 'Crop parameter is required' 
      });
    }

    console.log(`\n📊 Price request: ${crop}, ${state || 'All India'}, ${district || 'All districts'}`);
    
    // Fetch comprehensive price data
    const priceData = await pricesService.getPriceData(crop, state, district);
    
    if (!priceData.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch price data from APIs'
      });
    }

    // Generate market insights
    const insights = pricesService.generateMarketInsights(priceData);

    res.json({
      success: true,
      commodity: priceData.commodity,
      mandis: priceData.mandis,
      trends: priceData.trends,
      insights,
      timestamp: priceData.timestamp
    });
  } catch (error) {
    console.error('❌ Error in /prices/current:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/prices/recommendation
 * Get AI-powered selling recommendation
 * Body: { crop, quantity, unit, state, district, preferredMandi }
 */
router.post('/recommendation', async (req, res) => {
  try {
    const { crop, quantity, unit, state, district, preferredMandi } = req.body;
    
    if (!crop || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Crop and quantity are required' 
      });
    }

    console.log(`\n🤖 Recommendation request: ${quantity}${unit || 'kg'} of ${crop}`);
    
    // Get comprehensive price data
    const priceData = await pricesService.getPriceData(crop, state, district);
    
    if (!priceData.mandis || priceData.mandis.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No mandi data available for this crop and location'
      });
    }

    // Prepare user context
    const userContext = {
      crop,
      quantity,
      unit: unit || 'kg',
      state,
      district,
      preferredMandi
    };

    // Generate AI recommendation
    const recommendation = await groqPriceService.generateSellingRecommendation(
      priceData,
      userContext
    );

    // Calculate expected earnings
    const bestMandi = priceData.mandis.find(m => m.name === recommendation.bestMandi) 
      || priceData.mandis[0];
    
    const quantityInQuintal = unit === 'quintal' ? parseFloat(quantity) : parseFloat(quantity) / 100;
    const expectedEarnings = (bestMandi.modalPrice * quantityInQuintal).toFixed(2);

    res.json({
      success: true,
      commodity: crop,
      quantity: `${quantity} ${unit || 'kg'}`,
      recommendation: {
        action: recommendation.action,
        actionText: recommendation.actionText,
        bestMandi: recommendation.bestMandi,
        expectedPrice: recommendation.expectedPrice,
        expectedEarnings,
        reasons: recommendation.reasons,
        confidence: recommendation.confidence
      },
      mandis: priceData.mandis.slice(0, 5),
      trends: priceData.trends,
      insights: pricesService.generateMarketInsights(priceData),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in /prices/recommendation:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/prices/explain
 * Get detailed explanation for a recommendation
 * Body: { crop, state, district, recommendation }
 */
router.post('/explain', async (req, res) => {
  try {
    const { crop, state, district, recommendation } = req.body;
    
    if (!crop || !recommendation) {
      return res.status(400).json({ 
        success: false, 
        error: 'Crop and recommendation data are required' 
      });
    }

    console.log(`\n💬 Explanation request for ${crop}`);
    
    // Get price data
    const priceData = await pricesService.getPriceData(crop, state, district);
    
    // Generate explanation
    const explanation = await groqPriceService.explainRecommendation(
      priceData,
      recommendation,
      { crop, state, district }
    );

    res.json({
      success: true,
      explanation: explanation.explanation,
      priceData: {
        mandis: priceData.mandis.slice(0, 3),
        trends: priceData.trends
      }
    });
  } catch (error) {
    console.error('❌ Error in /prices/explain:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/prices/ask
 * Ask Kisan AI about prices
 * Body: { query, crop, state, district }
 */
router.post('/ask', async (req, res) => {
  try {
    const { query, crop, state, district, conversationHistory } = req.body;
    
    if (!query || !crop) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query and crop are required' 
      });
    }

    console.log(`\n💬 Price query: "${query}" for ${crop}`);
    
    // Get price data
    const priceData = await pricesService.getPriceData(crop, state, district);
    
    // Get AI answer
    const answer = await groqPriceService.answerPriceQuery(
      query,
      priceData,
      conversationHistory || []
    );

    res.json({
      success: true,
      query,
      answer: answer.answer,
      context: {
        commodity: crop,
        mandis: priceData.mandis.slice(0, 3).map(m => ({
          name: m.name,
          price: m.modalPrice
        })),
        trend: priceData.trends.trend
      }
    });
  } catch (error) {
    console.error('❌ Error in /prices/ask:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/prices/compare
 * Compare prices across multiple mandis
 * Query params: crop, state, mandis (comma-separated)
 */
router.get('/compare', async (req, res) => {
  try {
    const { crop, state, mandis } = req.query;
    
    if (!crop) {
      return res.status(400).json({ 
        success: false, 
        error: 'Crop parameter is required' 
      });
    }

    console.log(`\n🔄 Compare mandis for ${crop}`);
    
    // Get price data
    const priceData = await pricesService.getPriceData(crop, state);
    
    // Filter by requested mandis if specified
    let mandiList = priceData.mandis;
    if (mandis) {
      const requestedMandis = mandis.split(',').map(m => m.trim().toLowerCase());
      mandiList = priceData.mandis.filter(m => 
        requestedMandis.some(rm => m.name.toLowerCase().includes(rm))
      );
    }

    // Calculate comparison metrics
    if (mandiList.length > 0) {
      const prices = mandiList.map(m => m.modalPrice);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);

      res.json({
        success: true,
        commodity: crop,
        mandis: mandiList,
        comparison: {
          average: avgPrice.toFixed(2),
          highest: maxPrice,
          lowest: minPrice,
          difference: (maxPrice - minPrice).toFixed(2),
          bestMandi: mandiList.find(m => m.modalPrice === maxPrice)?.name,
          count: mandiList.length
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No mandis found for comparison'
      });
    }
  } catch (error) {
    console.error('❌ Error in /prices/compare:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
