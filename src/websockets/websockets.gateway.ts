import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsersService } from 'src/users/users.service';
import { ChatService } from 'src/chat/chat.service';

@WebSocketGateway()
export class WSGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server;

  private async authenticateUser(client: any) {
    const token = client.handshake.query.token;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });
      return await this.usersService.findByUsername(payload.username);
    } catch (error) {
      // Handle authentication failure
      throw new Error('Invalid token');
    }
  }

  private async getSocketByUserId(userId: string): Promise<any> {
    const connectedClients = await this.server.fetchSockets();
    for (const clientSocket of connectedClients.values()) {
      if (clientSocket.data.userId === userId) {
        return clientSocket;
      }
    }
    return undefined;
  }

  async handleConnection(client: any) {
    try {
      const user = await this.authenticateUser(client);
      client.data.userId = user._id?.toString();
    } catch (error) {
      // Handle authentication failure
      client.disconnect();
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: { chatId: string; text: string },
    @ConnectedSocket() client: any,
  ): Promise<void> {
    // Create a new message in database
    const newMessage = await this.chatService.createChatMessage(
      message.chatId,
      client.data.userId,
      message.text,
    );

    // Notify all users within the room about the new message
    const chat = await this.chatService.getOneRoomById(
      message.chatId,
      client.data.userId,
    );

    if (chat) {
      chat.participantsUsers.forEach(async (participant) => {
        const participantSocket = await this.getSocketByUserId(participant.id); // Get the socket associated with the user ID
        if (participantSocket) {
          participantSocket.emit('message', newMessage);
        }
      });
    }
  }
}
