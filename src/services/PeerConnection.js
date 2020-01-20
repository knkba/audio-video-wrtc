import MediaDevice from './MediaDevice';
import Emitter from './Emitter';
import Peer from 'peerjs';

class PeerConnection extends Emitter {
  /**
     * Create a PeerConnection.
     * @param {String} clientID - ID of the client.
     */
  constructor(clientID) {
    super();
    this.mediaDevice = new MediaDevice();
    this.clientID = clientID;
    this.peer = new Peer(clientID, { debug: 1 });
    this.call = null;
    this.init();
  }

  init() {
    this.peer
      .on('call', (call => {
        this.call = call;
        this.emit('call', call);
      }));
  }

  /**
   * Starting the call
   * @param {Boolean} isCaller - isCaller
   * @param {String} friendID - id of remote client
   * @param {Object} config - configuration for the call {audio: boolean, video: boolean}
   */
  start(isCaller, friendID, config) {
    this.mediaDevice
      .on('stream', (stream) => {
        this.emit('localStream', stream);
        if (!isCaller) {
          this.call.answer(stream); // Answer the call with an A/V stream.
          this.call.on('stream', (remoteStream) => {
            this.emit('peerStream', remoteStream);
          });
          this.call.on('close', () => { console.log('close'); });
        } else {
          const call = this.peer.call(friendID, stream);
          call.on('stream', (remoteStream) => {
            this.emit('peerStream', remoteStream);
          });
          call.on('close', () => { console.log('close'); });
        }
      })
      .on('error', (error) => {
        this.stop(true);
        console.log('cerrando peer', error);
      })
      .start(config);
    return this;
  }

  /**
   * Stop the call
   * @param {Boolean} isStarter
   */
  stop(isStarter) {
    if (isStarter) {
      //this.peer.disconnect();
    }
    this.call = null;
    this.mediaDevice.stop();
    this.off();
    return this;
  }

}

export default PeerConnection;
