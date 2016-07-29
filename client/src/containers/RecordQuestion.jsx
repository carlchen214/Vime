import Record from './../components/Record.jsx';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import { browserHistory } from 'react-router';
import { addQuestion } from './../actions/questionAction.jsx';
import { SpeechTags } from './../components/SpeechTags.jsx';
import tagActions from './../actions/tagActions.jsx';


class RecordQuestion extends React.Component {
  constructor(props){
    super(props);
    this.addToState = this.addToState.bind(this);
  }

  addToState(data) {
    var question = {
      ...data,
      userId: this.props.userId
    }
    // call action creator which will redirect to topic page
    this.props.addQuestion(question);
  }

  render(){
    return (
      <div>
        <h1>What's your question?</h1>
        <Record addToState={this.addToState} apiUrl={'/api/questions'} userId={this.props.userId}/>
        <SpeechTags tags={this.props.tags} />
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    userId: state.user ? state.user.id : null,
    tags: state.tags   
  };
}
function mapDispatchToProps(dispatch) {
  return {
    addQuestion: bindActionCreators(addQuestion, dispatch),
    tagActions: bindActionCreators(tagActions, dispatch)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(RecordQuestion);