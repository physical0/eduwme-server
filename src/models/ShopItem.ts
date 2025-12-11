import mongoose from 'mongoose';

const shopItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { data: Buffer, contentType: String }, // Store image as binary data
  price: { type: Number, required: true, min: 1 },
  category: {
    type: String,
    enum: ['avatar', 'background', 'badge', 'theme', 'powerup'],
    required: true
  },
  dateCreated: { type: Date, default: Date.now },
  isAvailable: { type: Boolean, default: true },
});

// Add indexes for better query performance
shopItemSchema.index({ itemId: 1 }, { unique: true });          // For item lookups by ID
shopItemSchema.index({ category: 1 });                          // For filtering by category
shopItemSchema.index({ price: 1 });                             // For price-based sorting/filtering
shopItemSchema.index({ isAvailable: 1 });                       // For filtering available items
shopItemSchema.index({ category: 1, isAvailable: 1 });          // Compound index for category+availability
shopItemSchema.index({ dateCreated: -1 });                      // For sorting by creation date

const ShopItem = mongoose.model('ShopItem', shopItemSchema);
export default ShopItem;