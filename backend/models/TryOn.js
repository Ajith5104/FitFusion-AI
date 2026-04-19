import mongoose from 'mongoose';

const tryOnSchema = new mongoose.Schema({
  garmentUrl: {
    type: String,
    required: true,
  },
  personUrl: {
    type: String,
    required: true,
  },
  resultUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: 'Virtual Try-On result',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TryOn = mongoose.model('TryOn', tryOnSchema);

export default TryOn;
