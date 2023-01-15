import { Box, Button, Card, CardActions, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, FormLabel, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material';
import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken, getTokenWithNav } from '../auth/authService';
import { BasePageProps } from '../BasePageProps';

export interface Room {
    roomId: string;
    toolName: string;
    isActive: boolean;
}

export const Room: React.FC<BasePageProps> = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [createRoomOpen, setCreateRoomOpen] = React.useState(false);
    const [joinRoomOpen, setJoinRoomOpen] = React.useState(false);


    const [creating, setCreating] = React.useState(false);
    const [creatingFail, setCreatingFail] = React.useState(false);
    const [joining, setJoining] = React.useState(false);
    const [joiningFail, setJoiningFail] = React.useState(false);


    const [createType, setCreateType] = React.useState("Code");
    const [joinId, setJoinId] = React.useState("");
    const [roomPass, setRoomPass] = React.useState("");

    

    const createRoom = async (roomType: string, roomPass: string) => {
        setCreating(true);
        try {
            const token = getTokenWithNav(navigate);
            const response: Response = await fetch("https://localhost:7003/room", {
                body: JSON.stringify({
                    toolName: roomType,
                    password: roomPass
                }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            if (response.status === 200 || response.status === 201) {
                const room: Room = await response.json();
                if (room.isActive) {
                    setCreatingFail(false);
                    sessionStorage.setItem("room:" + room.roomId, roomPass);
                    if (room.toolName == "Code") {
                        navigate("/code/" + room.roomId);
                    } else if (room.toolName == "Whiteboard") {
                        navigate("/whiteboard/" + room.roomId);
                    }
                } else {
                    setCreatingFail(true);
                }
            } else if (response.status === 401) {
                navigate("/login", {
                    state: {
                        // eslint-disable-next-line no-restricted-globals
                        from: location.pathname
                    }
                });
            } else {
                setCreatingFail(true);
            }
        }
        catch (e: any) {
            setCreatingFail(true);
        }
        finally {
            setCreating(false);
            setCreateRoomOpen(false);
        }
    }

    const joinRoom = async (roomId: string, roomPass: string) => {
        setJoining(true);
        try {
            const token = getTokenWithNav(navigate);
            const response: Response = await fetch("https://localhost:7003/room/" + roomId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            if (response.status === 200) {
                const room: Room = await response.json();
                if (room.isActive) {
                    setJoiningFail(false);
                    sessionStorage.setItem("room:" + room.roomId, roomPass);
                    if (room.toolName == "Code") {
                        navigate("/code/" + room.roomId);
                    } else if (room.toolName == "Whiteboard") {
                        navigate("/whiteboard/" + room.roomId);
                    }
                } else {
                    setJoiningFail(true);
                }
            } else if (response.status === 401) {
                navigate("/login", {
                    state: {
                        // eslint-disable-next-line no-restricted-globals
                        from: location.pathname
                    }
                });
            } else {
                setJoiningFail(true);
            }
        }
        catch (e: any) {
            setJoiningFail(true);
        }
        finally {
            setJoining(false);
            setJoinRoomOpen(false);
        }
    }

    return (
        <div style={{ width: "100%", paddingTop: "24px" }}>

            <Stack style={{ justifyContent: "center" }} direction="row" spacing={5}>
                <Button variant="outlined" onClick={() => {
                    setCreateRoomOpen(true);
                }}>
                    Create Room
                </Button>
                <Button variant="outlined" onClick={() => {
                    setJoinRoomOpen(true);
                }}>
                    Join Room
                </Button>
                <Dialog open={createRoomOpen} onClose={() => {
                    setCreateRoomOpen(false);
                }}>
                    <DialogTitle>Create Room</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Create a collab room. You can use the room id to invite people to join with provided password
                        </DialogContentText>
                        <FormControl>
                            <InputLabel>Create Room</InputLabel>
                            <Select
                                label="Create Room"
                                value={createType}
                                onChange={(event: SelectChangeEvent) => {
                                    const roomType = event.target.value as string;
                                    setCreateType(roomType);
                                }}
                            >
                                <MenuItem value={"Code"}>Code Editor</MenuItem>
                                <MenuItem value={"Whiteboard"}>Whiteboard</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField label="Password" value={roomPass} placeholder="Minimum 6 characters" type={'password'}
                            onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                const roomPass = event.target.value as string;
                                setRoomPass(roomPass);
                            }}></TextField>
                    </DialogContent>
                    <DialogActions>
                        {
                            creating && <CircularProgress size={20} />
                        }
                        <Button onClick={() => {
                            setCreateRoomOpen(false);
                        }}>Cancel</Button>
                        <Button onClick={() => {
                            createRoom(createType, roomPass);
                        }}>Create Room</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={joinRoomOpen} onClose={() => {
                    setJoinRoomOpen(false);
                }}>
                    <DialogTitle>Join Room</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            To subscribe to this website, please enter your email address here. We
                            will send updates occasionally.
                        </DialogContentText>
                        <TextField label="Join Room" variant="outlined" onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                            const roomId = event.target.value as string;
                            setJoinId(roomId);
                        }} />
                        <TextField label="Password" value={roomPass} placeholder="Minimum 6 characters" type={'password'}
                            onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                const roomPass = event.target.value as string;
                                setRoomPass(roomPass);
                            }}></TextField>
                    </DialogContent>
                    <DialogActions>
                        {
                            joining && <CircularProgress size={20} />
                        }
                        <Button onClick={() => {
                            setCreateRoomOpen(false);
                        }}>Cancel</Button>
                        <Button onClick={() => {
                            joinRoom(joinId, roomPass);
                        }}>Join Room</Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </div>
    );
}