import { Injectable } from '@nestjs/common';
import makeWASocket, { DisconnectReason, useSingleFileAuthState } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom';
import { SendMessageDto } from './dto/create-bot.dto';
import pino from  'pino';
import * as fs from 'fs'

import * as QRCode from 'qrcode'
import { AppGateway } from 'src/app.gateway';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { Observable, tap, map } from 'rxjs';
@Injectable()
export class WhatsappService {

    constructor(
        private socketService: AppGateway,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ){}

    bots: any[] = [];
    sock: any = false;
    key: string = "";
    instance = {
        key: this.key,
        qr: ''
    };

    connectToWhatsApp() {
        const { state, saveState } = useSingleFileAuthState('./auth_info_multi.json');
        this.instance.key = uuidv4();
        this.sock = makeWASocket({
            // can provide additional config here
            printQRInTerminal: false,
            browser: ['Whatsapp Darbelink', '', '3.0'],
            auth: state,
            logger: pino({
                level: 'silent',
            })
        });

        this.sock.ev.on('connection.update', (update: any) => {
            const { connection, lastDisconnect, qr } = update;
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

                console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect, );
                // reconnect if not logged out
                if (shouldReconnect) {
                    console.log('reconnect');
                    this.connectToWhatsApp();
                } else {
                    try {
                        fs.unlink('./auth_info_multi.json', (err) => {
                            console.log('err a');
                        });

                        // this.socketService.disconnectDarbelink({ user: this.sock });
                        const res = this.disconnectDarbeLink({ user: this.sock })
                        console.log('res');
                        console.log(res);
                    } catch (error) {
                        console.log('error');
                    }
                }
            } else if (connection === 'open') {
                if (fs.existsSync('./auth_info_multi.json')) {
                    this.socketService.connected({ user: this.sock });
                }
            }

            if (qr) {
                QRCode.toDataURL(qr).then((url) => {
                    this.instance.qr = url;
                    this.socketService.sendQrCode(this.instance);
                });
            }
        });

        this.sock.ev.on('creds.update', saveState);
    }

    async init() {
        this.connectToWhatsApp();
    }

    async create() {
        function makeId(length) {
            let result = '';
            const characters =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
    
        const token = makeId(36);
        const bot = {
          token,
        };
    
        const isTokenAlreadyExists = this.bots.find((b) => b.token === token);
        if (!isTokenAlreadyExists) {
            this.bots.push(bot);
        }

        return {
          token,
        };
    }
    
    async sendMessage(data: SendMessageDto) {
        const isValidToken = this.bots.find((b) => b.token === data.token);
    
        if (!isValidToken) {
          throw new Error(`Invalid Token`);
        }
    
        return await this.sock.sendMessage(`${data.phone}@s.whatsapp.net`, {
          text: data.message,
        });
    }
    
    async logOut() {
        try {
            fs.unlink('./auth_info_multi.json', (err) => {
                console.log('err b');
            });    
        } catch (error) {
            console.log('error');
        }
    }

    disconnectDarbeLink(data: object): Observable<AxiosResponse<any, any>> {

        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `Bearer ${this.configService.get<string>('clientid')}`,
        };

        console.log(headersRequest)
        console.log(`${this.configService.get<string>('darbelink_url')}/api/v2/whatsapp-service/disconnect`)

        return this.httpService.post(`${this.configService.get<string>('darbelink_url')}/api/v2/whatsapp-service/disconnect`, data, { headers: headersRequest })
                    .pipe(
                        tap((resp) => console.log(resp)),
                        map((resp) => resp.data),
                        tap((data) =>  console.log(data)),
                    );
    }
}
