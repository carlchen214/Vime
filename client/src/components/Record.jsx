'use strict';
import { getPreSignedUrl, getSupportedTypes, putObjectToS3, postVideoUrl } from '../recordUtil.js';

export default class Record extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      mediaRecorder: null,
      stream: null,
      streamVidUrl: null,
      toggleRecText: 'Start Recording',
      isRec: false,
      blobs: [],
      superBlob: null,
      recVidUrl: null,
      link: '',
      finishedRecording: false,
      uploading: false,
      formText: '',
      intervalHandle: null   
    };
  }

  componentDidMount() {
    this.checkUserProtocol();
    this.requestUserMedia(); 
    this.speechToText();
  }

  render() {
    return (
      <div className="col s8 offset-s2">
        <br/>
        <video className={this.state.finishedRecording ? 'hide' : ''} id="gum" src={this.state.streamVidUrl} autoPlay muted width="100%"></video>
        <video className={this.state.finishedRecording ? '' : 'hide'} id="recorded" src={this.state.recVidUrl} width="100%"></video>
        <div>
          <br/>
          <form>
          <input value={this.state.formText} onChange={e => {this.handleFormText(e)}}/>
          </form>
          <a className="waves-effect waves-light btn blue darken-1" id="record" onClick={this.toggleRec.bind(this)}>{this.state.toggleRecText}</a>
          <a className={this.state.finishedRecording ? 'waves-effect waves-light btn blue darken-1' : 'hide waves-effect waves-light btn blue darken-1'} id="upload" onClick={this.uploadRec.bind(this)}>Submit</a>
        </div>
        <div className={this.state.uploading ? 'progress' : 'hide progress'}>
          <div className="indeterminate"></div>
        </div>
      </div>
    );
  }

  handleFormText(e) {
    this.setState({
      formText: e.target.value
    });
  }

  speechToText(){
    
  }

  checkUserProtocol() {
    console.log('inside checkUserProtocol');

    let isSecureOrigin = location.protocol === 'https:' || location.host === 'localhost:3000';
    if (!isSecureOrigin) {
      alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
        '\n\nChanging protocol to HTTPS');
      location.protocol = 'HTTPS';
    }   
  }


  requestUserMedia() {
    console.log('inside requestUserMedia');

    //Use native web api for Media Recorder (https://developers.google.com/web/updates/2016/01/mediarecorder)
    //to get the user audio and video
    return navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then((stream) => {
      this.handleConnect(stream);
    })
    .catch(this.handleError);
  }

  handleConnect(stream) {
    console.log('inside handleConnect');

    //Set the stream state
    //Take user media and create a url that will be added to the video tag src in the DOM
    console.log('Stream connected');
    this.setState({
      stream: stream,
      streamVidUrl: window.URL.createObjectURL(stream)
    });
  }

  handleError(error) {
    console.log('inside handleError');

    //Catch and log error on request of user media
    console.log('error in request of user media:', error);
  }

  toggleRec() {
    console.log('inside toggleRec');

    //If the user is recording invoke stopRec
    //else invoke startRec if the user is not recording
    if (this.state.isRec) {
      this.stopRec();
    } else {
      this.startRec();
    }
  }

  startRec() {
    console.log('inside startRec');
    if (!this.state.stream) {
      this.requestUserMedia()
        .then(() => {
        this.openMediaRecorder();
      })
    } else {
      this.openMediaRecorder();
    }
    // Check browser and set the supported types to options variable
  }

  openMediaRecorder() {
    let options = getSupportedTypes();
      //Toggle button text and set isRec boolean to true and finishedRecording boolean to false
      //Set blobs to an empty array 
      //Instantiate MediaRecorder 
      let mediaRecorder = new MediaRecorder(this.state.stream, options);
      this.setState({
        toggleRecText: 'Stop Recording',
        isRec: true,
        mediaRecorder: mediaRecorder,
        blobs: [],
        finishedRecording: false
      });

      //When data becomes available, call function to handle the data
      mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
      mediaRecorder.start(10); // collect 10ms of data 
  }

  handleDataAvailable(event) {
    console.log('inside handleDataAvailable');

    //If there is data add the data to the blobs array
    if (event.data && event.data.size > 0) {
      this.setState({
        blobs: this.state.blobs.concat(event.data)
      });
    }
  }

  stopRec() {
    console.log('inside stopRec');


    //Stop the mediaRecorder and toggle
    this.state.mediaRecorder.stop();

    // Close streams to turn off webcam and mic
    var audioTrack = this.state.stream.getTracks()[0];
    var videoTrack = this.state.stream.getTracks()[1];
    audioTrack.stop();
    videoTrack.stop();

    let options = {
      type: 'video/webm'
    };
    //Create a new blob from the array of blobs
    let superBlob = new Blob(this.state.blobs, options);
    this.setState({
      toggleRecText: 'Start Recording',
      isRec: false,
      superBlob: superBlob,
      finishedRecording: true,
      recVidUrl: window.URL.createObjectURL(superBlob),
      stream: null
    });
    document.getElementById('recorded').controls = true;
  }

  uploadRec() {
    console.log('inside uploadRec');

    //Set the uploading to true to show the loader bar
    this.setState({
      uploading: true
    })
    //Get the pre-signed url from the server, data in promise is in the following format
    //{ preSignedUrl: examplePreSignedUrl, publicUrl: examplePublicUrl }
    getPreSignedUrl()
    .then((data) => {
      //Upload data to S3 with pre-signed url
      //extend the data object to include the superBlob
      data.superBlob = this.state.superBlob;
      return putObjectToS3(data);
    })
    .then((videoData) => {
      //Take the video's publicUrl and post to the server
      return postVideoUrl(videoData.publicUrl, this.props.apiUrl, this.props.userId, this.props.questionId);
    })
    .then((data) => {
      // call the container's function which dispatches action
      this.props.addToState(data);
      //Set the share link and remove the spinner from the page
      // NEED TO FIX: 
      // ERROR IS: CAN'T SET STATE ON UNMOUNTED COMPONENT
      // this.setState({
      //   uploading: false
      // });
    })
    .catch((err) => {
      throw err;
    });
  }
}
