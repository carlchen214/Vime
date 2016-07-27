const path = require('path');

const questionsController = require('./controllers/questionsController');
const answersController = require('./controllers/answersController');
const videosController = require('./controllers/videosController');
const usersController = require('./controllers/usersController');
const router = require('express').Router();

router.get('/api/questions', questionsController.getAllQuestions);
router.post('/api/questions', questionsController.createQuestion);

router.get('/api/question', questionsController.getQuestion);

router.get('/api/answers', answersController.getAnswersForQuestion);
router.post('/api/answers', answersController.createAnswer);

router.get('/api/presigned', videosController.generatePreSignedUrl);

router.post('/api/login', usersController.postUser);

// Send homepage when users route to videos or record endpoint
// React Router will handle showing the appropriate views
router.get('/QA/*', (req, res) => { res.sendFile(path.resolve(__dirname + '/../../client/index.html')); });
router.get('/record', (req, res) => { res.sendFile(path.resolve(__dirname + '/../../client/index.html')); });

//TODO
//Handle unknown routes;
//router.get(*, errorHandler);

module.exports = router;
