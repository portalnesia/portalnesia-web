import {ComponentType, FC, useEffect, useState} from 'react'
import io,{Socket as ISocket} from 'socket.io-client'
import { useRouter } from 'next/router';
import { useSelector,useDispatch } from '@redux/store';
import type { State } from '@type/redux';
import useAPI from '@design/hooks/api';

export type {ISocket}

let loading=false,socket: ISocket|undefined=undefined;
export default function useSocket() {
    const {get} = useAPI();
    const [mySocket,setMySocket] = useState(socket);

    useEffect(()=>{
        function onConnection() {
            loading=false;
        }
        function onDisconnect() {
            loading=false;
            setMySocket(undefined);
            getSocket();
        }
        async function getSocket() {
            if(!socket && typeof window !== 'undefined' && !loading) {
                loading=true;
                try {
                    const token = await get<string>(`/v2/internal/socket`);
                    const sockets = io(`${process.env.NEXT_PUBLIC_API_URL}/v2`,{transports: ['websocket'],auth:{token}});
                    sockets.once('connect',onConnection);
                    sockets.once('disconnect',onDisconnect);

                    socket = sockets;
                    setMySocket(sockets);
                } catch {
                    loading=false;
                }
            }
        }
        
        getSocket();
    },[get])

    return mySocket;
}

export function Socket({onRef}: {onRef?:(ref: ISocket)=>void}) {
    const socket = useSocket();

    useEffect(()=>{
        if(socket && onRef) {
          onRef(socket);
        }
    },[socket,onRef])

    useEffect(()=>{
        function onReconnect() {
          socket?.emit('konek')
        }
        socket?.on('reconnect',onReconnect)
        socket?.on('connect',onReconnect)
        return ()=>{
          socket?.off('reconnect',onReconnect)
          socket?.off('connect',onReconnect)
        }
    },[socket])

    return null;
}

export function withSocket<P extends object>(Component: ComponentType<P>): FC<P & ({socket?: ISocket})> {
    /* eslint-disable-next-line react/display-name */
    return (props: P)=>{
        const socket = useSocket();

        useEffect(()=>{
            function onReconnect() {
              socket?.emit('konek')
            }
            socket?.on('reconnect',onReconnect)
            socket?.on('connect',onReconnect)
            return ()=>{
              socket?.off('reconnect',onReconnect)
              socket?.off('connect',onReconnect)
            }
        },[socket])

        return <Component {...props as P} socket={socket} />
    }
}