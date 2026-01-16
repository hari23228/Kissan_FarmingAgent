const Groq = require('groq-sdk');

/**
 * Groq AI Service for Market Price Analysis
 * Generates intelligent selling recommendations based on real market data
 */

class GroqPriceService {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (apiKey) {
      this.groq = new Groq({ apiKey });
      console.log('✅ Groq AI Service initialized for price analysis');
    } else {
      console.warn('⚠️ GROQ_API_KEY not configured - AI recommendations will use fallback');
      this.groq = null;
    }
    
    this.model = 'llama-3.3-70b-versatile';
  }

  /**
   * Generate selling recommendation based on market data
   */
  async generateSellingRecommendation(priceData, userContext) {
    if (!this.groq) {
      return this.getFallbackRecommendation(priceData);
    }

    try {
      const prompt = this.buildRecommendationPrompt(priceData, userContext);
      
      console.log(`🤖 Generating AI selling recommendation for ${priceData.commodity}...`);

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are Kisan AI, an expert agricultural market advisor helping Indian farmers make selling decisions. 
            
Your job is to analyze real market data and provide actionable selling advice. 

Guidelines:
- Base ALL recommendations on the actual data provided
- Be specific about prices, trends, and mandis
- Give clear "Sell now" or "Wait" recommendations
- Explain your reasoning with real numbers
- Keep language simple and farmer-friendly
- Always mention specific mandi names and prices
- Include at least 3 concrete reasons for your recommendation`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.model,
        temperature: 0.3,
        max_tokens: 800,
      });

      const aiResponse = completion.choices[0]?.message?.content || '';
      
      // Parse the response
      const recommendation = this.parseAIRecommendation(aiResponse, priceData);
      
      console.log(`✅ AI recommendation generated: ${recommendation.action}`);
      
      return {
        success: true,
        ...recommendation
      };
    } catch (error) {
      console.error('❌ Error generating AI recommendation:', error.message);
      return this.getFallbackRecommendation(priceData);
    }
  }

  /**
   * Build comprehensive prompt with real market data
   */
  buildRecommendationPrompt(priceData, userContext) {
    const { commodity, mandis, trends, varietyData } = priceData;
    const { quantity, unit, state, preferredMandi } = userContext;

    // Format mandi data
    const mandiInfo = mandis.slice(0, 5).map((m, i) => 
      `${i + 1}. ${m.name}: Min ₹${m.minPrice}, Modal ₹${m.modalPrice}, Max ₹${m.maxPrice} (${m.variety || 'standard'})`
    ).join('\n');

    // Format trend data
    const trendInfo = `
Trend: ${trends.trend}
Change: ${trends.change}%
Days analyzed: ${trends.days}
Recent average: ₹${trends.recentAvg}
Earlier average: ₹${trends.olderAvg}`;

    return `MARKET ANALYSIS REQUEST

COMMODITY: ${commodity}
FARMER'S QUANTITY: ${quantity} ${unit}
STATE: ${state || 'Not specified'}
PREFERRED MANDI: ${preferredMandi || 'Any nearby'}

REAL MARKET DATA (from Government APIs):

MANDI PRICES (Current):
${mandiInfo}
Total mandis available: ${mandis.length}

PRICE TRENDS (Last ${trends.days} days):
${trendInfo}

TASK: Analyze this real market data and provide a selling recommendation.

Your response MUST include:

1. RECOMMENDATION: Either "Sell now" or "Wait for better prices"

2. BEST MANDI: Name the specific mandi with best price (use actual names from data)

3. EXPECTED EARNINGS: Calculate based on quantity × best modal price

4. REASONS: Provide 3-4 specific reasons using actual data:
   - Price trend (rising/falling/stable)
   - Comparison between mandis
   - Market demand indicators
   - Any urgent factors

5. ALTERNATIVE: If prices are low, suggest when to wait or which mandi to monitor

Format your response clearly with these sections. Be specific with numbers and mandi names.`;
  }

  /**
   * Parse AI response into structured recommendation
   */
  parseAIRecommendation(aiResponse, priceData) {
    // Extract recommendation action
    let action = 'sell_now';
    const lowerResponse = aiResponse.toLowerCase();
    
    if (lowerResponse.includes('wait') || lowerResponse.includes('hold')) {
      action = 'wait';
    }

    // Extract best mandi (or use highest from data)
    const bestMandi = priceData.mandis[0] || { 
      name: 'Unknown', 
      modalPrice: 0 
    };

    // Parse reasons (look for bullet points or numbered items)
    const reasons = [];
    const lines = aiResponse.split('\n');
    
    for (const line of lines) {
      if (line.match(/^[•\-*\d]/) || line.includes('✓')) {
        const cleaned = line.replace(/^[•\-*\d.)\s]+/, '').trim();
        if (cleaned.length > 10) {
          reasons.push(cleaned);
        }
      }
    }

    // If no reasons found, extract from insights
    if (reasons.length === 0) {
      const insights = this.extractInsights(aiResponse);
      reasons.push(...insights.slice(0, 3));
    }

    return {
      action,
      actionText: action === 'sell_now' ? 'Sell now' : 'Wait for better prices',
      bestMandi: bestMandi.name,
      expectedPrice: bestMandi.modalPrice,
      reasons: reasons.slice(0, 4),
      fullExplanation: aiResponse,
      confidence: this.calculateConfidence(priceData.trends)
    };
  }

  /**
   * Extract insights from text
   */
  extractInsights(text) {
    const sentences = text.split(/[.!?]\s+/);
    return sentences
      .filter(s => s.length > 20 && s.length < 150)
      .slice(0, 3)
      .map(s => s.trim());
  }

  /**
   * Calculate confidence score based on data quality
   */
  calculateConfidence(trends) {
    let score = 50;
    
    if (trends.days >= 5) score += 20;
    if (Math.abs(trends.change) > 3) score += 15;
    if (trends.trend !== 'stable') score += 15;
    
    return Math.min(95, score);
  }

  /**
   * Generate explanation for why the recommendation was made
   */
  async explainRecommendation(priceData, recommendation, userContext) {
    if (!this.groq) {
      return this.getFallbackExplanation(recommendation);
    }

    try {
      const prompt = `The farmer received this selling recommendation: "${recommendation.actionText}"

MARKET DATA:
- Commodity: ${priceData.commodity}
- Best Mandi: ${recommendation.bestMandi} (₹${recommendation.expectedPrice})
- Price Trend: ${priceData.trends.trend} (${priceData.trends.change}%)
- Total Mandis: ${priceData.mandis.length}

Explain in simple terms WHY this recommendation makes sense. Include:
1. What the market data shows
2. Why this is a good/bad time to sell
3. What risks the farmer should consider
4. Alternative actions if they disagree

Keep it conversational and helpful. Use specific numbers from the data.`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are Kisan AI, explaining market recommendations to farmers in simple, clear language.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.model,
        temperature: 0.4,
        max_tokens: 600,
      });

      return {
        success: true,
        explanation: completion.choices[0]?.message?.content || ''
      };
    } catch (error) {
      console.error('❌ Error generating explanation:', error.message);
      return this.getFallbackExplanation(recommendation);
    }
  }

  /**
   * Handle farmer's questions about prices using Groq
   */
  async answerPriceQuery(query, priceData, conversationHistory = []) {
    if (!this.groq) {
      return {
        success: false,
        answer: 'AI service is not available. Please check your configuration.'
      };
    }

    try {
      const contextPrompt = `MARKET CONTEXT:
Commodity: ${priceData.commodity}
Mandis: ${priceData.mandis.slice(0, 3).map(m => `${m.name} (₹${m.modalPrice})`).join(', ')}
Trend: ${priceData.trends.trend} (${priceData.trends.change}%)

FARMER'S QUESTION: ${query}

Provide a helpful, specific answer using the market data above.`;

      const messages = [
        {
          role: 'system',
          content: 'You are Kisan AI, answering farmers questions about market prices using real data.'
        },
        ...conversationHistory,
        {
          role: 'user',
          content: contextPrompt
        }
      ];

      const completion = await this.groq.chat.completions.create({
        messages,
        model: this.model,
        temperature: 0.5,
        max_tokens: 500,
      });

      return {
        success: true,
        answer: completion.choices[0]?.message?.content || ''
      };
    } catch (error) {
      console.error('❌ Error answering query:', error.message);
      return {
        success: false,
        answer: 'I apologize, but I encountered an error. Please try again.'
      };
    }
  }

  /**
   * Fallback recommendation when Groq is unavailable
   */
  getFallbackRecommendation(priceData) {
    const bestMandi = priceData.mandis[0] || { name: 'Unknown', modalPrice: 0 };
    const trend = priceData.trends.trend;
    
    let action = 'sell_now';
    let reasons = [];

    if (trend === 'rising') {
      reasons = [
        `Prices have increased by ${Math.abs(priceData.trends.change)}% recently`,
        `${bestMandi.name} offers good price of ₹${bestMandi.modalPrice}`,
        'Market trend is positive'
      ];
    } else if (trend === 'falling') {
      action = 'wait';
      reasons = [
        `Prices declining by ${Math.abs(priceData.trends.change)}%`,
        'Better to wait for market recovery',
        'Monitor prices for next few days'
      ];
    } else {
      reasons = [
        'Prices are stable in current market',
        `${bestMandi.name} has competitive rate`,
        'Good time for planned selling'
      ];
    }

    return {
      success: true,
      action,
      actionText: action === 'sell_now' ? 'Sell now' : 'Wait for better prices',
      bestMandi: bestMandi.name,
      expectedPrice: bestMandi.modalPrice,
      reasons,
      fullExplanation: 'Recommendation based on market data analysis.',
      confidence: 70
    };
  }

  /**
   * Fallback explanation
   */
  getFallbackExplanation(recommendation) {
    return {
      success: true,
      explanation: `The recommendation to "${recommendation.actionText}" is based on current market conditions and price trends. ${recommendation.bestMandi} offers a competitive price of ₹${recommendation.expectedPrice}.`
    };
  }
}

module.exports = new GroqPriceService();
