import { Router } from 'express';
import {
  listIdeas, getIdea, createIdea, updateIdea, deleteIdea,
  voteIdea, unvoteIdea, updateStatus,
  getStats, getBookmarked, getMyIdeas, getOptions,
} from '../controllers/ideaController.js';
import {
  createIdeaRules, updateIdeaRules, statusRules, listIdeasRules, objectIdRule, runValidation,
} from '../middleware/validate.js';
import { protect, identify, requireRole } from '../middleware/auth.js';

const router = Router();

// Static /meta/* routes must be declared before the /:id routes, otherwise
// Express would try to match "meta" itself as an :id (and fail CastError).
router.get('/meta/options', getOptions);
router.get('/meta/stats', identify, getStats);
router.get('/meta/bookmarks', protect, getBookmarked);
router.get('/meta/mine', protect, getMyIdeas);

router.get('/', identify, listIdeasRules, runValidation, listIdeas);
router.post('/', protect, createIdeaRules, runValidation, createIdea);

router.get('/:id', identify, objectIdRule, runValidation, getIdea);
router.put('/:id', protect, objectIdRule, updateIdeaRules, runValidation, updateIdea);
router.delete('/:id', protect, objectIdRule, runValidation, deleteIdea);

router.patch('/:id/vote', protect, objectIdRule, runValidation, voteIdea);
router.delete('/:id/vote', protect, objectIdRule, runValidation, unvoteIdea);

router.patch('/:id/status', protect, requireRole('reviewer'), objectIdRule, statusRules, runValidation, updateStatus);

export default router;
