/**
 * Schemes & Subsidy External API Service
 * Fetches government schemes and subsidies from external API
 * API Key is kept secure on server-side only
 */

export interface Scheme {
  id: string
  title: string
  description: string
  eligibility: string
  benefits: string
  how_to_apply?: string
  link?: string
  category: string
  state?: string
  ministry?: string
  launched_on?: string
  last_date?: string
}

export interface SchemesApiResponse {
  success: boolean
  data: Scheme[]
  error?: string
  total?: number
}

class SchemesApiService {
  private apiKey: string
  private baseUrl: string = 'https://api.data.gov.in/resource'
  // Resource ID for "Details of the Schemes implemented by The Department of Agriculture"
  private resourceId: string = '9afdf346-16d7-4f17-a2e3-684540c59a77'

  constructor() {
    this.apiKey = process.env.SCHEMES_API_KEY || ''
    if (!this.apiKey) {
      console.error('SCHEMES_API_KEY is not configured in environment variables')
    }
  }

  // Comprehensive scheme details - enriched data for API scheme names
  private schemeDetails: Record<string, Omit<Scheme, 'id' | 'title'>> = {
    'Mission of Integrated Development of Horticulture (MIDH)': {
      description: 'Promotes holistic growth of horticulture sector including fruits, vegetables, root & tuber crops, mushrooms, spices, flowers, aromatic plants, coconut, cashew, and cocoa.',
      eligibility: 'All farmers engaged in horticulture in identified areas',
      benefits: 'Subsidy for planting material (40-50%), protected cultivation, INM/IPM, organic farming, post-harvest management',
      category: 'seeds',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Apply through State Horticulture Mission/Department',
      link: 'https://midh.gov.in/',
    },
    'National Food Security Mission (NFSM)': {
      description: 'Increases production of rice, wheat, pulses, coarse cereals and commercial crops through area expansion and productivity enhancement.',
      eligibility: 'All farmers in targeted districts',
      benefits: 'Subsidized certified seeds (50%), INM/IPM support, farm mechanization assistance, cropping system demonstrations',
      category: 'seeds',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Contact District Agriculture Office',
      link: 'https://www.nfsm.gov.in/',
    },
    'National Mission on Oilseeds and Oil Palm (NMOOP)': {
      description: 'Promotes cultivation of oilseeds and oil palm to increase domestic production of vegetable oils and reduce import dependency.',
      eligibility: 'Farmers in identified districts for oil palm and oilseed cultivation',
      benefits: 'Planting material subsidy (85%), drip irrigation (50%), seed mini kits (free), price support mechanism',
      category: 'seeds',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Apply through State Agriculture/Horticulture Department',
      link: 'https://nmoop.gov.in/',
    },
    'National Mission on Agricultural Extension & Technology (NMAET)': {
      description: 'Strengthens agricultural extension services and technology dissemination to farmers through various sub-missions.',
      eligibility: 'All farmers, especially small and marginal',
      benefits: 'Training programs, farm advisory services, Kisan Call Centers, demonstrations, Krishi Vigyan Kendras',
      category: 'soil',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Contact nearest KVK or ATMA office',
      link: 'https://agricoop.nic.in/',
    },
    'National Mission for Sustainable Agriculture (NMSA) including Soil Health Card (SHC)': {
      description: 'Promotes sustainable agriculture through climate change adaptation, soil health management, and resource conservation.',
      eligibility: 'All farmers',
      benefits: 'Free soil testing, Soil Health Cards, rainfed area development, organic farming support, climate resilient varieties',
      category: 'soil',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Visit nearest Soil Testing Laboratory or KVK',
      link: 'https://soilhealth.dac.gov.in/',
    },
    'Crop Insurance Progamme (CIP)': {
      description: 'Comprehensive crop insurance coverage including PMFBY and RWBCIS to protect farmers against crop losses.',
      eligibility: 'All farmers including sharecroppers and tenant farmers growing notified crops',
      benefits: 'Insurance coverage at 1.5-5% premium (rest by Govt), compensation for yield loss due to natural calamities',
      category: 'insurance',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Apply through banks, CSCs, or pmfby.gov.in',
      link: 'https://pmfby.gov.in/',
    },
    'Integrated Scheme on Agriculture Cooperation (ISAC)': {
      description: 'Supports agricultural cooperatives for marketing, storage, processing and credit facilities.',
      eligibility: 'PACS, Marketing Federations, Cooperative Societies',
      benefits: 'Financial assistance for godowns, cold storage, market yards, processing units',
      category: 'credit',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Apply through NCDC or State Cooperative Department',
      link: 'https://ncdc.in/',
    },
    'Integrated Scheme for Agricultural Marketing (ISAM)': {
      description: 'Develops agricultural marketing infrastructure including e-NAM, GrAMs, and market intelligence.',
      eligibility: 'APMCs, FPOs, cooperatives, private entrepreneurs',
      benefits: 'Subsidy for market infrastructure (33.33%), e-NAM integration, market research support',
      category: 'credit',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Apply through State Agricultural Marketing Board',
      link: 'https://enam.gov.in/',
    },
    'Integrated Scheme on Agriculture Census, Economics and Statistics (ISACE&S)': {
      description: 'Generates agricultural statistics and census data for policy planning.',
      eligibility: 'Government statistical agencies',
      benefits: 'Agriculture census, crop area statistics, cost of cultivation studies',
      category: 'soil',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Data available at agricoop.gov.in',
      link: 'https://agricoop.gov.in/',
    },
    'Investment in Debentures of State Land Development Banks': {
      description: 'Provides long-term credit to farmers through State Land Development Banks.',
      eligibility: 'Farmers seeking long-term agricultural loans',
      benefits: 'Long-term loans at concessional rates for land development, irrigation, farm mechanization',
      category: 'credit',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Apply through State Land Development Bank branches',
      link: 'https://nabard.org/',
    },
    'Pradhan Mantri Krishi Sinchai Yojana (PMKSY)': {
      description: 'Ensures access to protective irrigation through micro irrigation and watershed development.',
      eligibility: 'All farmers for micro-irrigation systems',
      benefits: 'Subsidy 55% for small/marginal farmers, 45% for others on drip/sprinkler systems',
      category: 'irrigation',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Apply through State Agriculture/Horticulture Department',
      link: 'https://pmksy.gov.in/',
    },
    'Sub-Mission on Agricultural Mechanization (SMAM)': {
      description: 'Increases farm mechanization through subsidized equipment and custom hiring centres.',
      eligibility: 'Individual farmers, FPOs, cooperatives, entrepreneurs',
      benefits: '40-50% subsidy on farm machinery, support for CHCs (80% for cooperatives)',
      category: 'machinery',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Apply through DBT portal agrimachinery.nic.in',
      link: 'https://agrimachinery.nic.in/',
    },
    'Rashtriya Krishi Vikas Yojana (RKVY-RAFTAAR)': {
      description: 'Provides additional resources to states for agriculture development with focus on agri-enterprises.',
      eligibility: 'State governments, entrepreneurs, FPOs',
      benefits: 'Infrastructure development, agri-business incubation, innovation grants',
      category: 'machinery',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Apply through State Agriculture Department or RKVY portal',
      link: 'https://rkvy.nic.in/',
    },
    'Paramparagat Krishi Vikas Yojana (PKVY)': {
      description: 'Promotes organic farming through cluster approach with participatory guarantee system.',
      eligibility: 'Farmer groups forming clusters of 50+ farmers (20 hectares minimum)',
      benefits: '₹50,000/hectare over 3 years for organic inputs, certification, and marketing',
      category: 'organic',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Form farmer group and apply through State Agriculture Department',
      link: 'https://pgsindia-ncof.gov.in/',
    },
  }

  // Default scheme details for schemes not in our enriched data
  private getDefaultSchemeDetails(schemeName: string): Omit<Scheme, 'id' | 'title'> {
    // Determine category based on scheme name keywords
    let category = 'credit'
    const nameLower = schemeName.toLowerCase()
    if (nameLower.includes('irrigation') || nameLower.includes('water') || nameLower.includes('sinchai')) {
      category = 'irrigation'
    } else if (nameLower.includes('insurance') || nameLower.includes('bima')) {
      category = 'insurance'
    } else if (nameLower.includes('seed') || nameLower.includes('horticulture') || nameLower.includes('food')) {
      category = 'seeds'
    } else if (nameLower.includes('soil') || nameLower.includes('sustainable') || nameLower.includes('extension')) {
      category = 'soil'
    } else if (nameLower.includes('machinery') || nameLower.includes('mechanization')) {
      category = 'machinery'
    } else if (nameLower.includes('organic')) {
      category = 'organic'
    }

    return {
      description: `Government scheme: ${schemeName}. Contact your local agriculture office for detailed information.`,
      eligibility: 'Farmers as per scheme guidelines',
      benefits: 'Financial assistance and support as per scheme norms',
      category,
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      how_to_apply: 'Contact nearest Agriculture Department office or visit agricoop.nic.in',
      link: 'https://agricoop.nic.in/',
    }
  }

  // Mock data for when API doesn't return results
  private getMockSchemes(): Scheme[] {
    return [
      {
        id: '1',
        title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        description: 'Direct income support of ₹6,000 per year to small and marginal farmer families.',
        eligibility: 'Small and marginal farmers with cultivable landholding up to 2 hectares',
        benefits: '₹6,000 per year in three installments of ₹2,000 each',
        category: 'credit',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Apply through local agriculture office or PM-KISAN portal',
        link: 'https://pmkisan.gov.in/',
      },
      {
        id: '2',
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'Comprehensive crop insurance scheme to provide financial support to farmers in case of crop failure.',
        eligibility: 'All farmers including sharecroppers and tenant farmers',
        benefits: 'Insurance coverage for crop losses due to natural calamities, pests, and diseases',
        category: 'insurance',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Apply through banks, insurance companies, or Common Service Centers',
        link: 'https://pmfby.gov.in/',
      },
      {
        id: '3',
        title: 'Pradhan Mantri Krishi Sinchai Yojana (PMKSY)',
        description: 'Scheme to improve irrigation efficiency and expand cultivable area under irrigation.',
        eligibility: 'All farmers interested in micro-irrigation',
        benefits: 'Subsidy up to 55% for small farmers and 45% for others on drip/sprinkler systems',
        category: 'irrigation',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Apply through State Agriculture Department',
        link: 'https://pmksy.gov.in/',
      },
      {
        id: '4',
        title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
        description: 'Promotes farm mechanization through subsidized custom hiring centers and equipment.',
        eligibility: 'Individual farmers, FPOs, cooperatives',
        benefits: '40-50% subsidy on purchase of farm machinery',
        category: 'machinery',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Apply through DBT Agriculture portal or local agriculture office',
        link: 'https://agrimachinery.nic.in/',
      },
      {
        id: '5',
        title: 'Soil Health Card Scheme',
        description: 'Provides soil health cards to farmers with crop-wise recommendations for nutrients.',
        eligibility: 'All farmers',
        benefits: 'Free soil testing and personalized recommendations for improving soil health',
        category: 'soil',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Contact nearest soil testing laboratory or Krishi Vigyan Kendra',
        link: 'https://soilhealth.dac.gov.in/',
      },
      {
        id: '6',
        title: 'Kisan Credit Card (KCC)',
        description: 'Provides affordable credit to farmers for agricultural and allied activities.',
        eligibility: 'All farmers including tenant farmers and sharecroppers',
        benefits: 'Credit at 4% interest rate for loans up to ₹3 lakh for crop cultivation',
        category: 'credit',
        ministry: 'Ministry of Finance',
        how_to_apply: 'Apply through any bank branch or PM-KISAN portal',
        link: 'https://pmkisan.gov.in/',
      },
      {
        id: '7',
        title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
        description: 'Promotes organic farming through cluster approach with PGS certification.',
        eligibility: 'Farmer groups in clusters of 50+ farmers',
        benefits: '₹50,000 per hectare for 3 years for organic inputs and certification',
        category: 'organic',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Form a farmer group and apply through State Agriculture Department',
        link: 'https://pgsindia-ncof.gov.in/',
      },
      {
        id: '8',
        title: 'National Food Security Mission (NFSM)',
        description: 'Increases production of rice, wheat, pulses, and coarse cereals through area expansion.',
        eligibility: 'All farmers in targeted districts',
        benefits: 'Subsidized seeds, integrated nutrient management, and farm mechanization',
        category: 'seeds',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Contact District Agriculture Office',
        link: 'https://www.nfsm.gov.in/',
      },
      {
        id: '9',
        title: 'e-NAM (National Agriculture Market)',
        description: 'Online trading platform for agricultural commodities connecting APMC mandis across India.',
        eligibility: 'All farmers, traders, and buyers',
        benefits: 'Better price discovery, transparent bidding, reduced intermediaries',
        category: 'credit',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Register at enam.gov.in or through local APMC mandi',
        link: 'https://enam.gov.in/',
      },
      {
        id: '10',
        title: 'Rashtriya Krishi Vikas Yojana (RKVY)',
        description: 'Provides additional assistance to states for agriculture and allied sector development.',
        eligibility: 'State governments and individual farmers through state schemes',
        benefits: 'Infrastructure development, farm mechanization, and post-harvest management',
        category: 'machinery',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Apply through State Agriculture Department programs',
        link: 'https://rkvy.nic.in/',
      },
      {
        id: '11',
        title: 'Agriculture Infrastructure Fund (AIF)',
        description: 'Medium to long-term financing for post-harvest management and community farming assets.',
        eligibility: 'Farmers, FPOs, PACS, Agri-entrepreneurs, Startups',
        benefits: '3% interest subvention and credit guarantee up to ₹2 crore',
        category: 'credit',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Apply through banks or agriinfra.dac.gov.in portal',
        link: 'https://agriinfra.dac.gov.in/',
      },
      {
        id: '12',
        title: 'PM Kisan Maan Dhan Yojana',
        description: 'Pension scheme for small and marginal farmers providing ₹3,000 per month after age 60.',
        eligibility: 'Small and marginal farmers aged 18-40 years',
        benefits: '₹3,000 monthly pension after 60, family pension for spouse',
        category: 'insurance',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Register at CSC centers or maandhan.in',
        link: 'https://maandhan.in/',
      },
      {
        id: '13',
        title: 'National Mission on Oilseeds and Oil Palm (NMOOP)',
        description: 'Promotes cultivation of oilseeds and oil palm to reduce edible oil imports.',
        eligibility: 'Farmers in identified districts for oil palm cultivation',
        benefits: 'Planting material subsidy, drip irrigation support, and price support',
        category: 'seeds',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Contact District Horticulture Office',
        link: 'https://nmoop.gov.in/',
      },
      {
        id: '14',
        title: 'National Horticulture Mission (NHM)',
        description: 'Promotes holistic growth of horticulture sector including fruits, vegetables, and flowers.',
        eligibility: 'All farmers engaged in horticulture',
        benefits: 'Subsidy for planting material, protected cultivation, and post-harvest infrastructure',
        category: 'seeds',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Apply through State Horticulture Department',
        link: 'https://nhm.nic.in/',
      },
      {
        id: '15',
        title: 'Micro Irrigation Fund (MIF)',
        description: 'Dedicated fund to expand micro irrigation coverage under PMKSY.',
        eligibility: 'All farmers for drip and sprinkler irrigation',
        benefits: 'Additional top-up subsidy over PMKSY for micro irrigation systems',
        category: 'irrigation',
        ministry: 'Ministry of Agriculture',
        how_to_apply: 'Apply through State Agriculture/Horticulture Department',
        link: 'https://pmksy.gov.in/',
      },
    ]
  }

  // Category keyword mappings for better filtering
  private categoryKeywords: Record<string, string[]> = {
    'irrigation': ['irrigation', 'water', 'drip', 'sprinkler', 'micro irrigation', 'PMKSY', 'pradhan mantri krishi', 'sinchai'],
    'seeds': ['seed', 'fertilizer', 'urea', 'DAP', 'planting material', 'subsidy on seeds', 'NFSM', 'food security'],
    'machinery': ['machinery', 'tractor', 'equipment', 'farm mechanization', 'implement', 'harvester', 'SMAM'],
    'insurance': ['insurance', 'fasal bima', 'crop insurance', 'PMFBY', 'risk', 'coverage'],
    'soil': ['soil', 'health', 'testing', 'organic', 'fertilization', 'nutrient'],
    'credit': ['credit', 'loan', 'kisan', 'finance', 'subsidy', 'interest', 'KCC', 'PM-KISAN', 'samman nidhi'],
    'organic': ['organic', 'natural', 'pesticide free', 'zero budget', 'PKVY', 'paramparagat'],
    'all': [],
  }

  /**
   * Fetch schemes from external API
   * @param filters - Optional filters for category, state, etc.
   */
  async fetchSchemes(filters?: {
    category?: string
    state?: string
    limit?: number
    offset?: number
    search?: string
  }): Promise<SchemesApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Schemes API key is not configured')
      }

      // Build query parameters for data.gov.in API
      // Fetch more records and filter client-side for better category matching
      const params = new URLSearchParams({
        'api-key': this.apiKey,
        format: 'json',
        limit: '200', // Fetch more to filter client-side
        offset: (filters?.offset || 0).toString(),
      })

      // Note: Don't use API's category filter as it's not reliable
      // We'll filter client-side using keyword matching

      // Construct the correct API URL
      const url = `${this.baseUrl}/${this.resourceId}?${params.toString()}`

      console.log('Fetching schemes from:', url.replace(this.apiKey, '***'))

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Kisan-AI-Assistant/1.0',
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API request failed with status ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('API Response received:', { 
        recordsCount: data.records?.length || 0,
        totalRecords: data.total || 0 
      })

      // Transform API response to our schema
      let schemes = this.transformApiResponse(data)

      // If API returns no data, use mock schemes
      if (schemes.length === 0) {
        console.log('⚠️ API returned 0 results, using mock schemes data')
        schemes = this.getMockSchemes()
      }

      // Client-side category filtering using keyword matching
      if (filters?.category && filters.category !== 'all') {
        const keywords = this.categoryKeywords[filters.category] || [filters.category]
        schemes = schemes.filter(scheme => {
          const text = `${scheme.title} ${scheme.description} ${scheme.benefits} ${scheme.category}`.toLowerCase()
          return keywords.some(keyword => text.includes(keyword.toLowerCase()))
        })
        console.log(`Filtered to ${schemes.length} schemes for category: ${filters.category}`)
      }

      // Client-side state filtering (for mock data, all schemes are applicable to all states)
      // Real API data would have specific state information

      // Client-side search filtering
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        schemes = schemes.filter(scheme => {
          const text = `${scheme.title} ${scheme.description} ${scheme.benefits}`.toLowerCase()
          return text.includes(searchLower)
        })
        console.log(`Filtered to ${schemes.length} schemes matching: ${filters.search}`)
      }

      // Limit results
      const limit = filters?.limit || 20
      schemes = schemes.slice(0, limit)

      return {
        success: true,
        data: schemes,
        total: schemes.length,
      }
    } catch (error) {
      console.error('Error fetching schemes from external API:', error)
      // Return mock data on error
      console.log('⚠️ Using mock schemes due to API error')
      let schemes = this.getMockSchemes()
      
      // Apply category filter to mock data
      if (filters?.category && filters.category !== 'all') {
        const keywords = this.categoryKeywords[filters.category] || [filters.category]
        schemes = schemes.filter(scheme => {
          const text = `${scheme.title} ${scheme.description} ${scheme.benefits} ${scheme.category}`.toLowerCase()
          return keywords.some(keyword => text.includes(keyword.toLowerCase()))
        })
      }
      
      return {
        success: true,
        data: schemes.slice(0, filters?.limit || 20),
        total: schemes.length,
      }
    }
  }

  /**
   * Search schemes by keyword
   */
  async searchSchemes(query: string, limit: number = 50): Promise<SchemesApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Schemes API key is not configured')
      }

      const params = new URLSearchParams({
        'api-key': this.apiKey,
        format: 'json',
        limit: limit.toString(),
      })

      const url = `${this.baseUrl}/${this.resourceId}?${params.toString()}`

      console.log('Searching schemes with query:', query)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Kisan-AI-Assistant/1.0',
        },
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed with status ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      // Transform and filter results by search query
      const schemes = this.transformApiResponse(data)
      const queryLower = query.toLowerCase()
      const filteredSchemes = schemes.filter((scheme) =>
        scheme.title.toLowerCase().includes(queryLower) ||
        scheme.description.toLowerCase().includes(queryLower) ||
        scheme.category.toLowerCase().includes(queryLower) ||
        scheme.benefits.toLowerCase().includes(queryLower)
      )

      console.log(`Found ${filteredSchemes.length} schemes matching "${query}"`)

      return {
        success: true,
        data: filteredSchemes,
        total: filteredSchemes.length,
      }
    } catch (error) {
      console.error('Error searching schemes:', error)
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to search schemes',
      }
    }
  }

  /**
   * Transform API response to our standardized schema
   * Handles data.gov.in API response format and enriches with detailed information
   */
  private transformApiResponse(apiData: any): Scheme[] {
    try {
      console.log('Transforming API data, keys:', Object.keys(apiData))
      
      // data.gov.in typically returns: { records: [...], total: number, count: number }
      const records = apiData.records || apiData.data || apiData.result || []

      if (!Array.isArray(records)) {
        console.warn('API response does not contain an array of records')
        return []
      }

      console.log(`Transforming ${records.length} records from real API`)

      const transformed = records.map((record: any, index: number) => {
        // Log first record to understand structure
        if (index === 0) {
          console.log('First record structure:', Object.keys(record))
        }

        // Get scheme name from API (handles the specific data.gov.in format)
        const schemeName = record.name_of_mission___scheme || 
                          record.scheme_name || 
                          record.title || 
                          record.name || 
                          'Untitled Scheme'
        
        // Look up enriched details for this scheme
        const enrichedDetails = this.schemeDetails[schemeName] || this.getDefaultSchemeDetails(schemeName)

        return {
          id: record._id || record.id || record.s_no_ || `scheme-${Date.now()}-${index}`,
          title: schemeName,
          description: enrichedDetails.description,
          eligibility: enrichedDetails.eligibility,
          benefits: enrichedDetails.benefits,
          how_to_apply: enrichedDetails.how_to_apply,
          link: enrichedDetails.link,
          category: enrichedDetails.category,
          state: 'All India', // This dataset is for nationwide schemes
          ministry: enrichedDetails.ministry,
          launched_on: '',
          last_date: '',
        }
      })

      console.log(`✅ Successfully transformed ${transformed.length} schemes from real API with enriched data`)
      return transformed
    } catch (error) {
      console.error('Error transforming API response:', error)
      return []
    }
  }

  /**
   * Get scheme categories
   */
  async getCategories(): Promise<string[]> {
    const response = await this.fetchSchemes({ limit: 1000 })
    if (!response.success) return []

    const categories = new Set(response.data.map((scheme) => scheme.category))
    return Array.from(categories).sort()
  }

  /**
   * Get schemes by category
   */
  async getSchemesByCategory(category: string): Promise<SchemesApiResponse> {
    return this.fetchSchemes({ category })
  }
}

// Export singleton instance
export const schemesApiService = new SchemesApiService()
