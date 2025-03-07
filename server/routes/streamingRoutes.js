import express from 'express';
import { streamVideo } from '../controller/streamingController.js'; // Fix the import path
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/:videoId', protectRoute, streamVideo);

export default router;