import React, { useRef, useState, useEffect, useCallback, ChangeEvent } from 'react';
import logo from './logo.svg';
import './CollabEditor.css';

import * as signalR from "@microsoft/signalr";
import * as monaco from "monaco-editor";
import * as collab from "../collab";
import Editor, { useMonaco } from "@monaco-editor/react";
import { BasePageProps } from '../../../BasePageProps';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../../../auth/authService';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, CircularProgress, Button } from '@mui/material';

// monaco
export type Monaco = typeof monaco;

export const CollabEditor: React.FC<BasePageProps> = (props) => {

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
      let connection = props.hubBuilder.withUrl("https://localhost:7003/hubs/collab-code", { accessTokenFactory: () => getToken() }).build();
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

  const monacoObj = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [remoteCursorManager, setRemoteCursorManager] = useState<collab.RemoteCursorManager | null>(null);
  const [remoteSelectionManager, setRemoteSelectionManager] = useState<collab.RemoteSelectionManager | null>(null);
  const [editorContentManager, setEditorContentManager] = useState<collab.EditorContentManager | null>(null);
  const [remoteSelection, setRemoteSelection] = useState<collab.RemoteSelection | null>(null);
  const [remoteCursor, setRemoteCursor] = useState<collab.RemoteCursor | null>(null);
  
  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    const _remoteCursorManager = new collab.RemoteCursorManager({
      editor: editor,
      tooltips: true,
      tooltipDuration: 2
    });
    const _remoteSelectionManager = new collab.RemoteSelectionManager({ editor: editor });
    const _contentManager = new collab.EditorContentManager({
      editor: editor,
      onInsert(index, text) {
        console.log("Insert", index, text);
      },
      onReplace(index, length, text) {
        console.log("Replace", index, length, text);
      },
      onDelete(index, length) {
        console.log("Delete", index, length);
      }
    });
    setRemoteCursorManager(_remoteCursorManager);
    setRemoteSelectionManager(_remoteSelectionManager);
    setEditorContentManager(_contentManager);

    editorRef.current?.onDidChangeCursorPosition((e) => {
      console.log(JSON.stringify(e));
    });

    editorRef.current?.onDidChangeCursorSelection((e) => {
      console.log(JSON.stringify(e));
    });
  };

  const handleEditorChange = (value: string | undefined, event: monaco.editor.IModelContentChangedEvent) => {
    // here is the current value
  };

  const handleEditorValidation = (markers: monaco.editor.IMarker[]) => {
    // model markers
    // markers.forEach(marker => console.log('onValidate:', marker.message));
  };

  useEffect(() => {
    if(socketConnection && editorRef && editorRef.current) {
      socketConnection.on("CollabHub.Code.SetSelection", (args: any) => {
        console.log("SetSelection", args);
      });

      socketConnection.on("CollabHub.Code.ResetSelection", (args: any) => {
        console.log("ResetSelection", args);
      });

      socketConnection.on("CollabHub.Code.SetCursor", (args: any) => {
        console.log("SetCursor", args);
      });

      socketConnection.on("CollabHub.Code.ResetCursor", (args: any) => {
        console.log("ResetCursor", args);
      });

      socketConnection.on("CollabHub.Code.AddContent", (args: any) => {
        console.log("AddContent", args);
      });

      socketConnection.on("CollabHub.Code.RemoveContent", (args: any) => {
        console.log("RemoveContent", args);
      });
    }
  }, [socketConnection, editorRef, editorRef.current]);

  

  


  return (
    <>
      <div>
        <span>Room ID: {roomKey}</span>
      </div>
      <Editor
        height={"300px"}
        defaultLanguage="javascript"
        defaultValue=""
        theme="light"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        onValidate={handleEditorValidation}
      />
    </>
  );
}

export default CollabEditor;
