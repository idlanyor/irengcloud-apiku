import { Router } from 'express';
import {
  getBooks,
  getHaditsByNumber,
  getHaditsList,
  searchHadits,
} from '../controllers/haditsController.js';

const router = Router();

// /api/v1/hadits/...
router.get('/books', getBooks);
router.get('/search', searchHadits);
router.get('/:imam/:number', getHaditsByNumber);
router.get('/:imam', getHaditsList);

export default router;
