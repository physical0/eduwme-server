import mongoose from 'mongoose';

const courseBatchSchema = new mongoose.Schema({
  courseBatchId: { type: String, required: true, unique: true },
  dateCreated: { type: Date, required: true },
  courseList: { type: [String], required: true },
  coursesLength: { type: Number, required: true },
  stage: { type: Number, required: true },
});

// Add indexes for better query performance
courseBatchSchema.index({ courseBatchId: 1 }, { unique: true }); // For batch lookups by ID
courseBatchSchema.index({ stage: 1 });                           // For filtering by stage
courseBatchSchema.index({ dateCreated: -1 });                    // For sorting by creation date

const CourseBatch = mongoose.model('CourseBatch', courseBatchSchema);
export default CourseBatch;