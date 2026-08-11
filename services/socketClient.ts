import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const SOCKET_URL = 'http://localhost:5001'; // 'https://cinefriends-native-chat-backend.onrender.com';

class SocketClient {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to Socket.io server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from Socket.io server');
      });
    }
    return this.socket;
  }

  registerUser(userId: string) {
    this.socket?.emit('register_user', { userId });
  }

  joinTopicRoom(tmdbId: number, userId: string, subTopic?: string) {
    this.socket?.emit('join_topic_room', { tmdbId, userId, subTopic });
  }

  leaveTopicRoom(tmdbId: number, userId: string) {
    this.socket?.emit('leave_topic_room', { tmdbId, userId });
  }

  sendTopicMessage(data: {
    tmdbId: number;
    senderId: string;
    content: string;
    messageType?: string;
    subTopic?: string;
    isSpoiler?: boolean;
    replyToId?: string | null;
    replyToUser?: string | null;
    replyToContent?: string | null;
  }) {
    this.socket?.emit('send_topic_message', data);
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.socket?.on('receive_topic_message', callback);
  }

  offReceiveMessage() {
    this.socket?.off('receive_topic_message');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketClient();
