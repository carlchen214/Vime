import React from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AnswerVideoGrid from './../components/AnswerVideoGrid.jsx';

export default class Topic extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      code: this.props.params.id
      // questionUrl
      // answers
    }
  }

  componentDidMount() {
    // find the correct question object by using params.id to match the code in this.props.questionsById
    // set this url to state, so it can be passed down into video src
    // find answers urls, so they can be passed down into video grid
  }

  render() {
    return (
      <div>
        <div className="col s8 offset-s2">
          <h4 className="center-align">Question</h4>
        </div>

        <div className="col s8 offset-s2">
            <video controls src={this.state.questionUrl} width="100%"/>
        </div>

        <br />
        <Link to=`/qa/${this.state.code}/answer` id="record-answer" className="btn-large waves-effect waves-light blue darken-1">Record Your Answer!</Link>
        <br />
        <div className="col s8 offset-s2">
          <h4 className="center-align">Answers</h4>
        </div>
        
        <AnswerVideoGrid videos={this.state.answers}/>

      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    questionsById: state.questionsById,
    answersOfQuestions: state.answersOfQuestions,
    user: state.user
  };
}
// function mapDispatchToProps(dispatch) {
  // return bindActionCreators(Actions, dispatch);
// }

export default connect(mapStateToProps, mapDispatchToProps)(Topic);


