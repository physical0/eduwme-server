import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseBatchId: { type: String, required: true },
  courseId: { type: String, required: true, unique: true },
  title: { type: String, required: true, unique: true },
  logo: {
    data: Buffer,
    contentType: String
  },
  level: { type: Number, required: true },
  dateCreated: { type: Date, required: true },
  exerciseBatchList: { type: [String], required: true },
  exercisesLength: { type: Number, required: true },
});

// Add indexes for better query performance
courseSchema.index({ courseId: 1 }, { unique: true });     // For course lookups by ID
courseSchema.index({ courseBatchId: 1 });                  // For filtering courses by batch
courseSchema.index({ title: 1 }, { unique: true });        // For searching by title
courseSchema.index({ level: 1 });                          // For filtering by difficulty level
courseSchema.index({ dateCreated: -1 });                   // For sorting by creation date

const Course = mongoose.model('Course', courseSchema);
export default Course;


