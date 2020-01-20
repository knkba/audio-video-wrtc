import React, { Component } from 'react';
import _ from 'lodash';
import PeerConnection from './services/PeerConnection';
import MainWindow from './components/MainWindow';
import CallWindow from './components/CallWindow';
import CallModal from './components/CallModal';

import './css/app.scss';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: '' + new Date().getTime(),
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null
    };
    this.pc = new PeerConnection(this.state.clientId)
      .on('call', (call) => {
        this.setState({ callModal: 'active', callFrom: call.peer });
      });
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
  }

  startCall(isCaller, friendID, config) {
    this.config = config;
    this.pc
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', src => this.setState({ peerSrc: src }))
      .start(isCaller, friendID, config);
  }

  rejectCall() {
    this.pc.stop(false);
    this.setState({ callModal: '' });
  }

  endCall(isStarter) {
    this.pc.stop(isStarter);
    this.config = null;
    this.setState({
      callWindow: '',
      callModal: '',
      localSrc: null,
      peerSrc: null
    });
  }

  render() {
    const { clientId, callFrom, callModal, callWindow, localSrc, peerSrc } = this.state;
    return (
      <div>
        <MainWindow
          clientId={clientId}
          startCall={this.startCallHandler}
        />
        {!_.isEmpty(this.config) && (
          <CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={this.config}
            mediaDevice={this.pc.mediaDevice}
            endCall={this.endCallHandler}
          />
        )}
        <CallModal
          status={callModal}
          startCall={this.startCallHandler}
          rejectCall={this.rejectCallHandler}
          callFrom={callFrom}
        />
      </div>
    );
  }
}
