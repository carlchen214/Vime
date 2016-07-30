'use strict';
import Chip from './../../../node_modules/material-ui/Chip';

export default class SpeechTags extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
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
  }
  componentWillReceiveProps() {
    var tagData = [];
    for (var i = 0; i < this.props.tags.length; i++) {
      tagData.push({
        key: i,
        label: this.props.tags[i]
      }); 
    }
    this.setState({
      tagData: tagData
    });
  }

  handleRequestDelete(key) {
    console.log('deleting tag');
    this.tagData = this.state.tagData;
    const tagToDelete = this.tagData.map((tag) => tag.key).indexOf(key);
    this.tagData.splice(chipToDelete, 1);
    this.setState({tagData: this.tagData});
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

      // {this.props.tags.map((tag, i) => 
      //   <div key={i}>{tag}
      //   </div>
      // )}
  render() {
    return (
      <div>
      {this.props.tags.length > 0 ? <h4>Select tags</h4> : null}
        <div style={this.styles.wrapper}>
          {this.state.tagData.map(this.renderTag, this)}
        </div>
      </div>
    );
  }
}

SpeechTags.propTypes = { tags: React.PropTypes.array.isRequired };
