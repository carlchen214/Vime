import Record from './../components/Record.jsx';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import { browserHistory } from 'react-router';
import { addQuestion } from './../actions/questionAction.jsx';
import Chip from 'material-ui/Chip';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();



class RecordQuestion extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      removedTags: [],
      tagData: []
    }
    this.styles = {
      chip: {
        margin: 4
      },
      wrapper: {
        display: 'flex',
        flexWrap: 'wrap'
      }
    };
    this.addToState = this.addToState.bind(this);
    this.addTags = this.addTags.bind(this);
  }

  render(){
    return (
      <div>
        <h1>What's your question?</h1>
        <Record addToState={this.addToState} apiUrl={'/api/questions'} userId={this.props.userId} addTags={this.addTags}/>
        <div>
        {this.state.tagData.length > 0 ? <h4>I got some tags for ya:</h4> : null}
          <MuiThemeProvider>
          <div style={this.styles.wrapper}>
            {this.state.tagData.map(this.renderTag, this)}
          </div>
          </MuiThemeProvider>
        </div>
      </div>
    );
  }

  renderTag(data) {
    return (
      <Chip
        key={data.key}
        onRequestDelete={() => this.handleRequestDelete(data.key)}
        style={this.styles.chip}
      >
        {data.label}
      </Chip>
    );
  }

  addToState(data) {
    var question = {
      ...data,
      userId: this.props.userId
      // tags: this.state.tagData - this.state.removedTags
    }
    // call action creator which will redirect to topic page
    this.props.addQuestion(question);
  }

  addTags(data) {
    var data = data.split(' ');
    // console.log('BEFORE FILTER', data);
    data = data.filter(tag => tag.length > 4);
    // use a better filter to parse out nouns, people, places
    // http://nlp-compromise.github.io/website/#demos 
    // console.log('AFTER', data);

    var tagData = [];
    for (var i = 0; i < data.length; i++) {
      tagData.push({
        key: i,
        label: data[i]
      }); 
    }
    this.setState({
      tagData: tagData
    });
  }

  handleRequestDelete(key) {
    console.log('deleting tag');
    var tagData = this.state.tagData;
    const tagIndexToRemove = tagData.map((tag) => tag.key).indexOf(key);
    var tagToRemove = tagData.splice(tagIndexToRemove, 1);
    this.setState({
      tagData: tagData,
      removedTags: this.state.removedTags.concat([tagToRemove])
    });
  }
}
//        <SpeechTags tags={this.state.tags} removeTag={null} />


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