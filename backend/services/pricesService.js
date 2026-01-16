const axios = require('axios');

/**
 * Prices Service
 * Integrates with two government APIs:
 * 1. Variety-wise Daily Market Prices - For overall market trends
 * 2. Current Daily Price of Various Commodities from Markets - For mandi-specific prices
 */

class PricesService {
  constructor() {
    // API endpoints
    this.varietyPricesAPI = 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24';
    this.mandiPricesAPI = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    
    // API keys from environment
    this.varietyApiKey = process.env.VARIETY_PRICES_API_KEY;
    this.mandiApiKey = process.env.MANDI_PRICES_API_KEY;
    
    if (!this.varietyApiKey || !this.mandiApiKey) {
      console.warn('⚠️ API Keys missing. Set VARIETY_PRICES_API_KEY and MANDI_PRICES_API_KEY');
    }
  }

  /**
   * Fetch variety-wise market prices for a commodity
   * This provides overall market trends and variety-specific pricing
   */
  async fetchVarietyPrices(commodity, state = null) {
    try {
      const params = {
        'api-key': this.varietyApiKey,
        format: 'json',
        limit: 50,
        offset: 0
      };

      // Add filters - try both formats for compatibility
      if (commodity) {
        params['filters[commodity]'] = commodity;
      }

      if (state) {
        params['filters[state]'] = state;
      }

      console.log(`📊 Fetching variety prices for ${commodity}...`);
      console.log('Request params:', JSON.stringify(params, null, 2));
      
      const response = await axios.get(this.varietyPricesAPI, {
        params,
        timeout: 10000
      });

      if (response.data && response.data.records) {
        console.log(`✅ Fetched ${response.data.records.length} variety price records`);
        return {
          success: true,
          data: response.data.records,
          total: response.data.total || response.data.records.length
        };
      }

      return { success: false, data: [], total: 0 };
    } catch (error) {
      console.error('❌ Error fetching variety prices:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return { 
        success: false, 
        error: error.message,
        data: [],
        total: 0
      };
    }
  }

  /**
   * Fetch current mandi-specific prices for a commodity
   * This provides location-specific pricing data
   */
  async fetchMandiPrices(commodity, state = null, district = null) {
    try {
      const params = {
        'api-key': this.mandiApiKey,
        format: 'json',
        limit: 100,
        offset: 0
      };

      // Add filters
      if (commodity) {
        params['filters[commodity]'] = commodity;
      }

      if (state) {
        params['filters[state]'] = state;
      }

      if (district) {
        params['filters[district]'] = district;
      }

      console.log(`🏪 Fetching mandi prices for ${commodity}...`);
      console.log('Request params:', JSON.stringify(params, null, 2));
      
      const response = await axios.get(this.mandiPricesAPI, {
        params,
        timeout: 10000
      });

      if (response.data && response.data.records) {
        console.log(`✅ Fetched ${response.data.records.length} mandi price records`);
        return {
          success: true,
          data: response.data.records,
          total: response.data.total || response.data.records.length
        };
      }

      return { success: false, data: [], total: 0 };
    } catch (error) {
      console.error('❌ Error fetching mandi prices:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return { 
        success: false, 
        error: error.message,
        data: [],
        total: 0
      };
    }
  }

  /**
   * Normalize and structure mandi price data
   * Extract min, max, and modal prices for each mandi
   */
  normalizeMandiPrices(mandiData) {
    const mandiMap = new Map();

    mandiData.forEach(record => {
      const mandiName = record.market || record.mandi || 'Unknown Market';
      const minPrice = parseFloat(record.min_price || record.minimum_price || 0);
      const maxPrice = parseFloat(record.max_price || record.maximum_price || 0);
      const modalPrice = parseFloat(record.modal_price || record.mode_price || 0);
      const arrivalDate = record.arrival_date || record.date || new Date().toISOString();

      if (!mandiMap.has(mandiName) || new Date(arrivalDate) > new Date(mandiMap.get(mandiName).date)) {
        mandiMap.set(mandiName, {
          name: mandiName,
          minPrice,
          maxPrice,
          modalPrice,
          date: arrivalDate,
          district: record.district || '',
          state: record.state || '',
          variety: record.variety || '',
          commodity: record.commodity || ''
        });
      }
    });

    return Array.from(mandiMap.values());
  }

  /**
   * Calculate price trends from variety price data
   * Analyze if prices are rising, falling, or stable
   */
  calculatePriceTrends(varietyData) {
    if (!varietyData || varietyData.length === 0) {
      return { trend: 'stable', change: 0, days: 0 };
    }

    // Sort by date (most recent first)
    const sortedData = [...varietyData].sort((a, b) => {
      const dateA = new Date(a.arrival_date || a.date);
      const dateB = new Date(b.arrival_date || b.date);
      return dateB - dateA;
    });

    if (sortedData.length < 2) {
      return { trend: 'stable', change: 0, days: 1 };
    }

    // Get recent prices (last 7 days)
    const recentPrices = sortedData.slice(0, 7).map(r => 
      parseFloat(r.modal_price || r.mode_price || r.max_price || 0)
    );

    // Calculate average of first 3 and last 3
    const recent = recentPrices.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, recentPrices.length);
    const older = recentPrices.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, recentPrices.slice(-3).length);

    const change = ((recent - older) / older) * 100;

    let trend = 'stable';
    if (change > 2) trend = 'rising';
    else if (change < -2) trend = 'falling';

    return {
      trend,
      change: change.toFixed(2),
      days: recentPrices.length,
      recentAvg: recent.toFixed(2),
      olderAvg: older.toFixed(2)
    };
  }

  /**
   * Get comprehensive price data combining both APIs
   */
  async getPriceData(commodity, state = null, district = null) {
    try {
      console.log(`\n🔍 Getting comprehensive price data for ${commodity}...`);
      
      // Fetch from both APIs in parallel
      const [varietyResult, mandiResult] = await Promise.all([
        this.fetchVarietyPrices(commodity, state),
        this.fetchMandiPrices(commodity, state, district)
      ]);

      // Normalize mandi prices
      const mandis = this.normalizeMandiPrices(mandiResult.data || []);
      
      // Calculate trends
      const trends = this.calculatePriceTrends(varietyResult.data || []);

      // Sort mandis by modal price (descending)
      mandis.sort((a, b) => b.modalPrice - a.modalPrice);

      return {
        success: true,
        commodity,
        state,
        district,
        mandis,
        trends,
        varietyData: varietyResult.data || [],
        rawData: {
          variety: varietyResult,
          mandi: mandiResult
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting comprehensive price data:', error.message);
      throw error;
    }
  }

  /**
   * Generate market insights based on price data
   */
  generateMarketInsights(priceData) {
    const insights = [];

    // Trend insights
    if (priceData.trends.trend === 'rising') {
      insights.push(`Prices rising for last ${priceData.trends.days} days`);
    } else if (priceData.trends.trend === 'falling') {
      insights.push(`Prices declining over ${priceData.trends.days} days`);
    } else {
      insights.push('Prices stable in current market');
    }

    // Mandi comparison
    if (priceData.mandis.length > 1) {
      const highest = priceData.mandis[0];
      const lowest = priceData.mandis[priceData.mandis.length - 1];
      const difference = highest.modalPrice - lowest.modalPrice;
      
      if (difference > 100) {
        insights.push(`${highest.name} offers ₹${difference.toFixed(0)} more than ${lowest.name}`);
      } else {
        insights.push('Nearby mandis have similar prices');
      }
    }

    // Demand signal
    const avgPrice = priceData.mandis.reduce((sum, m) => sum + m.modalPrice, 0) / (priceData.mandis.length || 1);
    if (avgPrice > 1000) {
      insights.push('Market demand is strong');
    }

    return insights;
  }
}

module.exports = new PricesService();
