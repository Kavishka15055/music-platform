import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        lessonId: string;
        userName: string;
    }, client: Socket): void;
    handleLeaveRoom(data: {
        lessonId: string;
        userName: string;
    }, client: Socket): void;
    handleMessage(data: {
        lessonId: string;
        sender: string;
        message: string;
        role: string;
    }): void;
}
