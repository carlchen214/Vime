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
      intervalHandle: null,
      speechRecognition: null,
      formText: '',
      finalTranscript: '',
      isListening: false
    };
  }

  componentDidMount() {
    this.checkUserProtocol();
    this.requestUserMedia(); 
    this.loadSpeech();
  }

  render() {
    return (
      <div className="col s8 offset-s2">
        <br/>
        <video className={this.state.finishedRecording ? 'hide' : ''} id="gum" src={this.state.streamVidUrl} autoPlay muted width="100%"></video>
        <video className={this.state.finishedRecording ? '' : 'hide'} id="recorded" src={this.state.recVidUrl} width="100%"></video>
        <div>
          <br/>
          <a className="waves-effect waves-light btn blue darken-1" id="record" onClick={this.toggleRec.bind(this)}>{this.state.toggleRecText}</a>
          <a className={this.state.finishedRecording ? 'waves-effect waves-light btn blue darken-1' : 'hide waves-effect waves-light btn blue darken-1'} id="upload" onClick={this.uploadRec.bind(this)}>Submit</a>
        </div>
        <div className={this.state.uploading ? 'progress' : 'hide progress'}>
          <div className="indeterminate"></div>
        </div>
      </div>
    );
  }

/*
  For trying to transcribe the entire question, but not worth it because speech analysis isn't good enough. 
  <form>
  <div className="input-field">
    <textarea id="question-text" className="materialize-textarea" value={this.state.finalTranscript} onChange={e => {this.handleTextChange(e)}}> </textarea>
    <label htmlFor="question-text">Your question</label>
  </div>
  </form>
*/

  handleTextChange(e) {
    this.setState({
      finalTranscript: e.target.value
    });
  }

  startSpeech(event) {
    this.setState({
      finalTranscript: '',
      isListening: true
    }) 
    // this.state.speechRecognition.lang = select_dialect.value;
    // ^ not needed, default is whatever language set on HTML file
    // console.log('START SPEECH');

    this.state.speechRecognition.start();
  }

  stopSpeech(event) {
    this.setState({
      isListening: false
    });
    // console.log('STOP SPEECH');
    this.state.speechRecognition.stop();
  }

  loadSpeech(){
    // https://developers.google.com/web/updates/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API
    if ('webkitSpeechRecognition' in window) {
      var speechRecognition = new webkitSpeechRecognition();
      speechRecognition.continuous = true;
      /* 
      The default value for continuous is false, meaning that when the user stops talking, speech recognition will end. This mode is great for simple text like short input fields. In this demo, we set it to true, so that recognition will continue even if the user pauses while speaking.
      */
      speechRecognition.interimResults = true;

      speechRecognition.onstart = function() {};
      speechRecognition.onresult = function(event) {
        var interimTranscript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            this.setState({
              finalTranscript: this.state.finalTranscript + event.results[i][0].transcript
            });
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      }.bind(this);
      speechRecognition.onerror = function(event) {};
      speechRecognition.onend = function() {
        this.props.addTags(this.state.finalTranscript);
      }.bind(this);
      this.setState({
        speechRecognition: speechRecognition
      })
    }
  }

  checkUserProtocol() {
    // console.log('inside checkUserProtocol');

    let isSecureOrigin = location.protocol === 'https:' || location.host === 'localhost:3000';
    if (!isSecureOrigin) {
      alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
        '\n\nChanging protocol to HTTPS');
      location.protocol = 'HTTPS';
    }   
  }


  requestUserMedia() {
    // console.log('inside requestUserMedia');

    //Use native web api for Media Recorder (https://developers.google.com/web/updates/2016/01/mediarecorder)
    //to get the user audio and video
    return navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then((stream) => {
      this.handleConnect(stream);
    })
    .catch(this.handleError);
  }

  handleConnect(stream) {
    // console.log('inside handleConnect');

    //Set the stream state
    //Take user media and create a url that will be added to the video tag src in the DOM
    // console.log('Stream connected');
    this.setState({
      stream: stream,
      streamVidUrl: window.URL.createObjectURL(stream)
    });
  }

  handleError(error) {
    // console.log('inside handleError');

    //Catch and log error on request of user media
    console.log('error in request of user media:', error);
  }

  toggleRec() {
    // console.log('inside toggleRec');

    //If the user is recording invoke stopRec
    //else invoke startRec if the user is not recording
    if (this.state.isRec) {
      this.stopRec();
    } else {
      this.startRec();
    }
    if (!this.state.isListening) {
      this.startSpeech(event);
    } else {
      this.stopSpeech(event);
    }
  }

  startRec() {
    // console.log('inside startRec');
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
    // console.log('inside handleDataAvailable');

    //If there is data add the data to the blobs array
    if (event.data && event.data.size > 0) {
      this.setState({
        blobs: this.state.blobs.concat(event.data)
      });
    }
  }

  stopRec() {
    // console.log('inside stopRec');


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
    // console.log('inside uploadRec');

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
