import { Router } from "express";

import { createExercise } from "../controllers/exercise/createExercise.js";
import { getExerciseById } from "../controllers/exercise/getExerciseById.js";
import { getExercise } from "../controllers/exercise/getExercise.js";
import { updateExercise } from "../controllers/exercise/updateExercise.js";
import { deleteExercise } from "../controllers/exercise/deleteExercise.js";

import { isAdmin, isUser } from "../middlewares/middleware.js";

const router = Router();

// Exercises Routes
router.get("/getExercise/:exerciseId", isUser, getExerciseById);
router.get("/getExercise", isUser, getExercise);
router.post("/createExercise", isAdmin, createExercise);
router.put("/updateExercise", isAdmin, updateExercise);
router.delete("/deleteExercise", isAdmin, deleteExercise);

export default router;
