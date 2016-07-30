import Record from './../components/Record.jsx';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import { browserHistory } from 'react-router';
import { addQuestion } from './../actions/questionAction.jsx';
import SpeechTags from './../components/SpeechTags.jsx';


class RecordQuestion extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      tags: []
    }
    this.addToState = this.addToState.bind(this);
    this.addTags = this.addTags.bind(this);
  }

  addToState(data) {
    var question = {
      ...data,
      userId: this.props.userId
    }
    // call action creator which will redirect to topic page
    this.props.addQuestion(question);
  }

  addTags(data) {
    var data = data.split(' ');
    console.log('BEFORE FILTER', data);
    data = data.filter(tag => tag.length > 4);
    console.log('AFTER', data);
    this.setState({
      tags: data
    });
  }

  render(){
    return (
      <div>
        <h1>What's your question?</h1>
        <Record addToState={this.addToState} apiUrl={'/api/questions'} userId={this.props.userId} addTags={this.addTags}/>
        <SpeechTags tags={this.state.tags} />
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    userId: state.user ? state.user.id : null
  };
}
function mapDispatchToProps(dispatch) {
  return {
    addQuestion: bindActionCreators(addQuestion, dispatch)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(RecordQuestion);