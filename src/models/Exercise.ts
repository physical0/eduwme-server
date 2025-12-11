import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  courseBatchId: { type: String, required: true },
  title: { type: String, required: true },
  difficultyLevel: { type: Number, required: true },
  dateCreated: { type: Date, required: true },
  animType: { type: String, required: true },
  type: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: String, required: true }
});

// Add indexes for better query performance
exerciseSchema.index({ exerciseId: 1 }, { unique: true });      // For exercise lookups by ID
exerciseSchema.index({ courseId: 1 });                          // For filtering exercises by course
exerciseSchema.index({ courseBatchId: 1 });                     // For filtering exercises by batch
exerciseSchema.index({ difficultyLevel: 1 });                   // For filtering by difficulty
exerciseSchema.index({ type: 1 });                              // For filtering by exercise type
exerciseSchema.index({ courseId: 1, courseBatchId: 1 });        // Compound index for course+batch queries
exerciseSchema.index({ dateCreated: -1 });                      // For sorting by creation date

const Exercise = mongoose.model('Exercise', exerciseSchema);
export default Exercise;