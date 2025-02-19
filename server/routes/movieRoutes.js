import express from 'express';
import { getMovieByCategory, getMovieDetails, getMovieTrailers, getSimilarMovie, getTrendingMovie } from '../controller/movieController.js';

const router = express.Router();

router.get('/trending', getTrendingMovie);
router.get('/:id/trailers', getMovieTrailers);
router.get('/:id/details', getMovieDetails);
router.get('/:id/similar', getSimilarMovie);
router.get('/:category', getMovieByCategory);

export default router;