import Router from 'express';
import { getPrivacy, updatePrivacy,getAll
,
} from '../controllers/privacy.controller.js';

const router = Router();

router.get('/getPrivacy', getPrivacy).patch('/updatePrivacy', updatePrivacy);
router.get('/getAll', getAll);
// router.get('/privacy', getPrivacy).put('/privacy', updatePrivacy);
// router.get('/terms', getTerms).put('/terms', updateTerms);
// router.get('/refund', getRefund).put('/refund', updateRefund);
export default router;