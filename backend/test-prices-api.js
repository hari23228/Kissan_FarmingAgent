/**
 * Test script for Market Prices API
 * Tests both government APIs and Groq AI integration
 */

const axios = require('axios');
require('dotenv').config();

const VARIETY_API = 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24';
const MANDI_API = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

console.log('\n🧪 Testing Market Prices APIs\n');

async function testVarietyPricesAPI() {
  console.log('1️⃣  Testing Variety-wise Prices API...');
  
  try {
    const response = await axios.get(VARIETY_API, {
      params: {
        'api-key': process.env.VARIETY_PRICES_API_KEY,
        format: 'json',
        limit: 5,
        'filters[commodity]': 'Tomato'
      },
      timeout: 10000
    });

    if (response.data && response.data.records) {
      console.log(`   ✅ Success! Received ${response.data.records.length} records`);
      if (response.data.records.length > 0) {
        const sample = response.data.records[0];
        console.log('   Sample data:', {
          commodity: sample.commodity,
          variety: sample.variety,
          state: sample.state,
          modal_price: sample.modal_price,
          date: sample.arrival_date
        });
      }
      return true;
    } else {
      console.log('   ⚠️  API returned empty data');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
    return false;
  }
}

async function testMandiPricesAPI() {
  console.log('\n2️⃣  Testing Mandi-specific Prices API...');
  
  try {
    const response = await axios.get(MANDI_API, {
      params: {
        'api-key': process.env.MANDI_PRICES_API_KEY,
        format: 'json',
        limit: 5,
        'filters[commodity]': 'Tomato'
      },
      timeout: 10000
    });

    if (response.data && response.data.records) {
      console.log(`   ✅ Success! Received ${response.data.records.length} records`);
      if (response.data.records.length > 0) {
        const sample = response.data.records[0];
        console.log('   Sample data:', {
          commodity: sample.commodity,
          market: sample.market || sample.mandi,
          min_price: sample.min_price || sample.minimum_price,
          max_price: sample.max_price || sample.maximum_price,
          modal_price: sample.modal_price || sample.mode_price,
          state: sample.state
        });
      }
      return true;
    } else {
      console.log('   ⚠️  API returned empty data');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
    return false;
  }
}

async function testGroqAPI() {
  console.log('\n3️⃣  Testing Groq AI API...');
  
  if (!process.env.GROQ_API_KEY) {
    console.log('   ⚠️  GROQ_API_KEY not configured');
    return false;
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Say "API test successful" in one sentence.'
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content || '';
    console.log('   ✅ Success!');
    console.log('   Response:', response);
    return true;
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return false;
  }
}

async function testBackendAPI() {
  console.log('\n4️⃣  Testing Backend API (if running)...');
  
  try {
    const response = await axios.get('http://localhost:5000/api/prices/current', {
      params: {
        crop: 'Tomato',
        state: 'Tamil Nadu'
      },
      timeout: 15000
    });

    if (response.data && response.data.success) {
      console.log('   ✅ Backend API is working!');
      console.log('   Mandis found:', response.data.mandis?.length || 0);
      console.log('   Trend:', response.data.trends?.trend);
      return true;
    } else {
      console.log('   ⚠️  Backend returned unexpected data');
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Backend server is not running');
      console.log('   Start it with: cd backend && npm run dev');
    } else {
      console.log('   ❌ Error:', error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log('Testing configuration:');
  console.log('VARIETY_PRICES_API_KEY:', process.env.VARIETY_PRICES_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('MANDI_PRICES_API_KEY:', process.env.MANDI_PRICES_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('');

  const results = {
    varietyAPI: await testVarietyPricesAPI(),
    mandiAPI: await testMandiPricesAPI(),
    groqAPI: await testGroqAPI(),
    backendAPI: await testBackendAPI()
  };

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results');
  console.log('='.repeat(60));
  console.log('Variety Prices API:', results.varietyAPI ? '✅ PASS' : '❌ FAIL');
  console.log('Mandi Prices API:', results.mandiAPI ? '✅ PASS' : '❌ FAIL');
  console.log('Groq AI API:', results.groqAPI ? '✅ PASS' : '❌ FAIL');
  console.log('Backend API:', results.backendAPI ? '✅ PASS' : '⚠️  NOT RUNNING');
  console.log('='.repeat(60));

  const totalPass = Object.values(results).filter(r => r === true).length;
  console.log(`\nPassed: ${totalPass}/4 tests`);

  if (totalPass >= 3) {
    console.log('\n✅ System is ready for use!');
  } else {
    console.log('\n⚠️  Please fix the failing tests before proceeding.');
    console.log('Refer to MARKET_PRICES_README.md for setup instructions.');
  }

  console.log('');
}

runTests().catch(console.error);
