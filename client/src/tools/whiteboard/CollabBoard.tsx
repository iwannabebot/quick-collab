import React, { useRef, useState, useEffect, useCallback, ChangeEvent } from 'react';

import * as signalR from "@microsoft/signalr";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BasePageProps } from '../../BasePageProps';
import { getToken } from '../../auth/authService';

type Coordinate = {
    x: number;
    y: number;
};

export const CollabBoard: React.FC<BasePageProps> = (props) => {

    const navigate = useNavigate();
    const location = useLocation();

    const roomId = useParams();
    const [roomKey, setRoomKey] = useState<string | null>(null);

    useEffect(() => {
        const roomKey = (roomId as any)["roomId"];
        setRoomKey(roomKey);
    }, [roomId]);

    const [socketConnection, setSocketConnection] = useState<signalR.HubConnection | null>(null);

    const createConnection = async () => {
        if (props.hubBuilder) {
            let connection = props.hubBuilder.withUrl("https://localhost:7003/hubs/collab-board", { accessTokenFactory: () => getToken() }).build();
            try {
                await connection.start();
                setSocketConnection(connection);
            } catch (e: any) {
                if (e.errorType === "FailedToNegotiateWithServerError") {
                    if (e.message && e.message.indexOf("Status code '401'") !== -1) {
                        navigate("/login", {
                            state: {
                                // eslint-disable-next-line no-restricted-globals
                                from: location.pathname
                            }
                        });
                    }
                }
            }
        }
    };

    const joinRoom = useCallback(async () => {
        if (socketConnection) {
            await socketConnection.send("JoinRoom", roomKey);
        }
    }, [socketConnection]);

    const leaveRoom = useCallback(async () => {
        if (socketConnection) {
            await socketConnection.send("LeaveRoom", roomKey);
        }
    }, [socketConnection]);


    useEffect(() => {
        if (socketConnection) {
            socketConnection.onreconnecting((error?: Error) => {
                if (error?.name === "FailedToNegotiateWithServerError") {
                    if (error.message && error.message.indexOf("Status code '401'") !== -1) {
                        navigate("/login", {
                            state: {
                                // eslint-disable-next-line no-restricted-globals
                                from: location.pathname
                            }
                        });
                    }
                }
            });
            socketConnection.onclose((error?: Error) => {
                if (error?.name === "FailedToNegotiateWithServerError") {
                    if (error.message && error.message.indexOf("Status code '401'") !== -1) {
                        navigate("/login", {
                            state: {
                                // eslint-disable-next-line no-restricted-globals
                                from: location.pathname
                            }
                        });
                    }
                }
                console.warn(error);
            });

            socketConnection.on("CollabHub.UnauthorizedRoom", () => {
                navigate("/room", {
                    state: {
                        // eslint-disable-next-line no-restricted-globals
                        from: location.pathname,
                        roomId: roomKey
                    }
                });
            });

            socketConnection.on("CollabHub.JoinRoom", (args: any) => {
                console.log("RoomJoined", args);
            });

            socketConnection.on("CollabHub.LeaveRoom", (args: any) => {
                console.log("RoomLeft", args);
            });

            if (roomKey)
                joinRoom();
        }
    }, [socketConnection]);

    useEffect(() => {
        createConnection();
    }, [props.hubBuilder]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D>();
    const [isPainting, setIsPainting] = useState(false);
    const [cvheight, setCvheight] = useState<string | number | undefined>((window.innerHeight as number) - 90);
    const [cvwidth, setCvwidth] = useState<string | number | undefined>(window.innerWidth);
    const [position, setPosition] = useState<Coordinate | undefined>(undefined);

    useEffect(() => {
        window.addEventListener("resize", () => {
            setCvheight((window.innerHeight as number) - 90);
            setCvwidth(window.innerWidth);
        });
        return () => window.removeEventListener("resize", () =>{
            setCvheight((window.innerHeight as number) - 90);
            setCvwidth(window.innerWidth);
        });
    })

    const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
        if (!canvasRef.current) {
            return;
        }

        const canvas: HTMLCanvasElement = canvasRef.current;
        return { x: event.pageX - canvas.offsetLeft, y: event.pageY - canvas.offsetTop };
    };

    const getTouchCoordinates = (event: TouchEvent): Coordinate | undefined => {
        if (!canvasRef.current) {
            return;
        }

        const canvas: HTMLCanvasElement = canvasRef.current;
        return { x: event.touches[0].pageX - canvas.offsetLeft, y: event.touches[0].pageY - canvas.offsetTop };
    };

    const startPaintMouse = useCallback((event: MouseEvent) => {
        const coordinates = getCoordinates(event);
        if (coordinates) {
            setPosition(coordinates);
            setIsPainting(true);
            if (context) {
                context.fillStyle = 'red';
                context.lineJoin = 'round';
                context.lineWidth = 5;
                context.beginPath();
                context.arc(coordinates.x, coordinates.y, 3, 0, 2 * Math.PI, true);
                context.closePath();
                context.fill();
            }
        }
    }, []);

    const startPaintTouch = useCallback((event: TouchEvent) => {
        const coordinates = getTouchCoordinates(event);
        if (coordinates) {
            setPosition(coordinates);
            setIsPainting(true);
        }
    }, []);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousedown', startPaintMouse);
        return () => {
            canvas.removeEventListener('mousedown', startPaintMouse);
        };
    }, [startPaintMouse]);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('touchstart', startPaintTouch);
        return () => {
            canvas.removeEventListener('touchstart', startPaintTouch);
        };
    }, [startPaintTouch]);

    const paintMouse = useCallback(
        (event: MouseEvent) => {
            if (isPainting) {
                const newPosition = getCoordinates(event);
                if (position && newPosition) {
                    drawLine(position, newPosition);
                    setPosition(newPosition);
                }
            }
        },
        [isPainting, position]
    );

    const paintTouch = useCallback(
        (event: TouchEvent) => {
            if (isPainting) {
                const newPosition = getTouchCoordinates(event);
                if (position && newPosition) {
                    drawLine(position, newPosition);
                    setPosition(newPosition);
                }
            }
        },
        [isPainting, position]
    );

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousemove', paintMouse);
        return () => {
            canvas.removeEventListener('mousemove', paintMouse);
        };
    }, [paintMouse]);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('touchmove', paintTouch);
        return () => {
            canvas.removeEventListener('touchmove', paintTouch);
        };
    }, [paintTouch]);

    const exitPaint = useCallback(() => {
        setIsPainting(false);
        setPosition(undefined);
    }, []);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mouseup', exitPaint);
        canvas.addEventListener('mouseleave', exitPaint);
        canvas.addEventListener('touchend', exitPaint);
        canvas.addEventListener('touchcancel', exitPaint);
        return () => {
            canvas.removeEventListener('mouseup', exitPaint);
            canvas.removeEventListener('mouseleave', exitPaint);
            canvas.removeEventListener('touchend', exitPaint);
            canvas.removeEventListener('touchcancel', exitPaint);
        };
    }, [exitPaint]);

    const drawLine = (originalPosition: Coordinate, newPosition: Coordinate) => {
        if (context) {
            context.strokeStyle = 'red';
            context.lineJoin = 'round';
            context.lineWidth = 5;

            context.beginPath();
            context.moveTo(originalPosition.x, originalPosition.y);
            context.lineTo(newPosition.x, newPosition.y);
            context.closePath();

            context.stroke();
        }
    };

    useEffect(() => {
        if (canvasRef) {
            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext('2d');
                if (context)
                    setContext(context);
            }
        }
    }, [canvasRef]);


    return (
        <>
            <div>
                <span>Room ID: {roomKey}</span>
            </div>
            <canvas ref={canvasRef} height={cvheight} width={cvwidth}></canvas>
        </>
    );
}

export default CollabBoard;
