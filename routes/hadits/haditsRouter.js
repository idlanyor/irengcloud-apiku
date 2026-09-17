import { Router } from 'express';

export function createHaditsRouter({ haditsController }) {
  const router = Router();

  router.get('/books', haditsController.getBooks);
  router.get('/search', haditsController.searchHadits);
  router.get('/:imam/:number', haditsController.getHaditsByNumber);
  router.get('/:imam', haditsController.getHaditsList);

  return router;
}
