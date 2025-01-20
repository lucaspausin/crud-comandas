import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['polling', 'websocket'],
})
export class CalendarGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    @Inject(forwardRef(() => CalendarService))
    private calendarService: CalendarService,
  ) {}

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CalendarGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway inicializado');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado al calendario: ${client.id}`);
    // Enviar eventos actuales al cliente cuando se conecta
    client.emit('connected', {
      message: 'Conectado al servidor de calendario',
    });

    // Enviar todos los eventos solo en la conexión inicial
    const events = await this.calendarService.findAll();
    client.emit('calendarUpdate', events);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado del calendario: ${client.id}`);
  }

  @SubscribeMessage('requestUpdate')
  async handleRequestUpdate(client: Socket) {
    this.logger.log(`Cliente ${client.id} solicitó actualización`);
    const events = await this.calendarService.findAll();
    client.emit('calendarUpdate', events);
  }

  // Método para emitir actualizaciones del calendario a todos los clientes
  async emitCalendarUpdate(event: any, type: 'single' | 'all' = 'all') {
    this.logger.log(`Emitiendo actualización del calendario - tipo: ${type}`);
    try {
      if (type === 'single') {
        // Emitir solo el evento nuevo/actualizado
        this.server.emit('calendarEvent', { type: 'add', event });
        this.logger.log('Evento individual emitido con éxito');
      } else {
        // Emitir todos los eventos (usado en conexión inicial o solicitud explícita)
        const events = event || (await this.calendarService.findAll());
        this.logger.debug(`Emitiendo ${events.length} eventos`);
        this.server.emit('calendarUpdate', events);
        this.logger.log('Actualización completa emitida con éxito');
      }
    } catch (error) {
      this.logger.error('Error al emitir actualización:', error);
      throw error;
    }
  }
}
