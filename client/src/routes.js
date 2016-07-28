import React from 'react';
import {Router, Route} from 'react-router';
import App from './components/App.jsx';
import Login from './containers/Login.jsx';
import RecordQuestion from './containers/RecordQuestion.jsx';
import RecordAnswer from './containers/RecordAnswer.jsx';
import Topic from './containers/Topic.jsx';

// import VideoPlayer from './components/VideoPlayer.jsx';
import Error from './components/Error.jsx';

export default (
  <Route path="/" component={App}>
    <Route path="login" component={Login} />
    <Route path="record/question" component={RecordQuestion} />
    <Route path="qa/:id" component={Topic} />
    <Route path="qa/:id/answer" component={RecordAnswer} />
    <Route path="*" component={Error} />
  </Route>
);
