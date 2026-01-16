const mongoose = require('mongoose');

const diseaseHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropType: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  diagnosis: {
    diseaseName: String,
    confidence: Number,
    severity: String,
    description: String
  },
  remedy: {
    organic: [String],
    chemical: [String],
    preventive: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DiseaseHistory', diseaseHistorySchema);
