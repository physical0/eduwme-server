import mongoose, { Schema } from "mongoose";

// Sub-schema for individual exercise progress
const exerciseProgressSchema = new Schema(
  {
    exerciseId: { type: String }, // Corresponds to Exercise.exerciseId
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      required: true,
    },
    score: { type: Number, min: 0, default: 0 }, // Optional: score achieved
    lastAttempted: { type: Date },
  },
  { _id: false },
); // No separate _id for each exercise progress entry within a course

// Sub-schema for progress within a single course
const courseProgressSchema = new Schema(
  {
    courseId: { type: String }, // Corresponds to Course.courseId
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      required: true,
    },
    totalExercisesInCourse: { type: Number, default: 0, required: true }, // Total exercises in the course
    // To calculate progressPercentage = (completedExercises / totalExercisesInCourse) * 100
    completedExercisesCount: { type: Number, default: 0, required: true },
    // totalExercisesInCourse might be populated when a user starts a course, by looking up the Course model
    exercises: [exerciseProgressSchema], // Detailed progress for each exercise in this course
  },
  { _id: false },
); // No separate _id for each course progress entry within a batch

// Sub-schema for progress within a course batch
const courseBatchProgressSchema = new Schema(
  {
    courseBatchId: { type: String }, // Corresponds to CourseBatch.courseBatchId
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      required: true,
    },
    totalCoursesInBatch: { type: Number, default: 0, required: true }, // Total exercises in the batch
    // To calculate progressPercentage = (completedCourses / totalCoursesInBatch) * 100

    completedCoursesCount: { type: Number, default: 0, required: true },
    // totalCoursesInBatch might be populated when a user starts a batch
    courses: [courseProgressSchema], // Detailed progress for each course in this batch
  },
  { _id: false },
); // No separate _id for each course batch progress entry

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[a-zA-Z0-9_]+$/,
  }, // Alphanumeric and underscores only, trim removes whitespace
  password: {
    type: String,
    required: true,
    select: false,
    match: /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{7,}$/
  }, // Password should be hashed before saving
  nickname: { type: String, trim: true },
  biodata: { type: String },
  profilePicture: {
    data: Buffer,
    contentType: { type: String, default: null }
  },   // Default profile picture
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  }, // Basic email validation
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true,
  },
  xp: { type: Number, default: 0, required: true }, // User's total experience points
  level: { type: Number, default: 1, required: true }, // User's overall level
  gems: { type: Number, default: 0, required: true }, // User's total gems
  inventory: [{
    itemId: { type: String, required: true },
    dateAcquired: { type: Date, default: Date.now },
    isEquipped: { type: Boolean, default: false }
  }], // User's inventory of items
  courseBatchesProgress: [courseBatchProgressSchema], // Array to store progress for all course batches
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date },
  streak: {
    type: Number,
    default: 0
  },
  lastLoginDate: {
    type: Date,
    default: null
  }
});

// Add indexes for better query performance
// These dramatically reduce latency by allowing MongoDB to use B-tree lookups instead of full collection scans

// Critical indexes for authentication and registration
userSchema.index({ username: 1 }, { unique: true }); // For login and duplicate checks
userSchema.index({ email: 1 }, { unique: true });    // For registration duplicate checks

// Indexes for common queries
userSchema.index({ role: 1 });                       // For filtering users by role (admin/user)
userSchema.index({ level: -1 });                     // For leaderboards (descending order)
userSchema.index({ xp: -1 });                        // For XP-based rankings (descending order)
userSchema.index({ lastLoginDate: -1 });             // For activity tracking and sorting

// Nested field indexes for inventory
userSchema.index({ "inventory.itemId": 1 });         // For checking if user owns an item
userSchema.index({ "inventory.isEquipped": 1 });     // For finding equipped items

// Nested field indexes for course batch progress
userSchema.index({ "courseBatchesProgress.courseBatchId": 1 }); // For finding user's batch progress
userSchema.index({ "courseBatchesProgress.status": 1 });        // For filtering by batch completion status

// Nested field indexes for course progress within batches
userSchema.index({ "courseBatchesProgress.courses.courseId": 1 }); // For finding specific course progress
userSchema.index({ "courseBatchesProgress.courses.status": 1 });   // For filtering by course completion status

// Nested field indexes for exercise progress within courses
userSchema.index({ "courseBatchesProgress.courses.exercises.exerciseId": 1 }); // For finding specific exercise progress
userSchema.index({ "courseBatchesProgress.courses.exercises.status": 1 });     // For filtering by exercise completion status

// Compound index for efficient duplicate checking during registration
userSchema.index({ username: 1, email: 1 });         // Optimizes $or queries

const User = mongoose.model("User", userSchema);

export default User;

