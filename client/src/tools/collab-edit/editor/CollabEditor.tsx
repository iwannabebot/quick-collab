import React, { useRef, useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './CollabEditor.css';

import * as signalR from "@microsoft/signalr";
import * as monaco from "monaco-editor";
import * as collab from "../collab";
import Editor, { useMonaco } from "@monaco-editor/react";
import { BasePageProps } from '../../../BasePageProps';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../../../auth/authService';

// monaco
export type Monaco = typeof monaco;

export const CollabEditor: React.FC<BasePageProps> = (props) => {

  const roomId = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const monacoObj = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [remoteCursorManager, setRemoteCursorManager] = useState<collab.RemoteCursorManager | null>(null);
  const [remoteSelectionManager, setRemoteSelectionManager] = useState<collab.RemoteSelectionManager | null>(null);
  const [editorContentManager, setEditorContentManager] = useState<collab.EditorContentManager | null>(null);
  const [remoteSelection, setRemoteSelection] = useState<collab.RemoteSelection | null>(null);
  const [remoteCursor, setRemoteCursor] = useState<collab.RemoteCursor | null>(null);
  const [socketConnection, setSocketConnection] = useState<signalR.HubConnection | null>(null);
  const [roomKey, setRoomKey] = useState<string | null>(null);

  useEffect(() => {
    const roomKey = (roomId as any)["roomId"];
    setRoomKey(roomKey);
  }, [roomId]);

  const handleEditorWillMount = (monaco: Monaco) => {
    console.log("beforeMount: the monaco instance:", monaco);
    // here is the monaco instance
    // do something before editor is mounted
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    console.log("onMount: the editor instance:", editor);
    console.log("onMount: the monaco instance:", monaco);
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
    // setRemoteSelection(_remoteSelectionManager?.addSelection("jDoe", "red", "John Doe"));
    // setRemoteCursor(_remoteCursorManager?.addCursor("jDoe", "blue", "John Doe"));
  };

  const handleEditorChange = (value: string | undefined, event: monaco.editor.IModelContentChangedEvent) => {
    // here is the current value
  };

  const handleEditorValidation = (markers: monaco.editor.IMarker[]) => {
    // model markers
    // markers.forEach(marker => console.log('onValidate:', marker.message));
  };

  const joinRoom = useCallback(async () => {
    if (socketConnection) {
      const roomPass = sessionStorage.getItem("room:" + roomKey);
      await socketConnection.send("JoinRoom", roomKey, roomPass);
    }
  }, [socketConnection]);

  const leaveRoom = useCallback(async () => {
    if (socketConnection) {
      const roomPass = sessionStorage.getItem("room:" + roomKey);
      await socketConnection.send("LeaveRoom", roomKey, roomPass);
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
        console.warn(error);
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
      socketConnection.on("CollabCodeJoinRoom", (args: any) => {
        console.log("RoomJoined", args);
      });

      socketConnection.on("connectionWillReconnect", () => {
        console.log("connectionWillReconnect");
      });
      socketConnection.on("CollabCodeLeaveRoom", (args: any) => {
        console.log("RoomLeft", args);
      });

      socketConnection.on("CollabCodeSetSelection", (args: any) => {
        console.log("SetSelection", args);
      });

      socketConnection.on("CollabCodeResetSelection", (args: any) => {
        console.log("ResetSelection", args);
      });

      socketConnection.on("CollabCodeSetCursor", (args: any) => {
        console.log("SetCursor", args);
      });

      socketConnection.on("CollabCodeResetCursor", (args: any) => {
        console.log("ResetCursor", args);
      });

      socketConnection.on("CollabCodeAddContent", (args: any) => {
        console.log("AddContent", args);
      });

      socketConnection.on("CollabCodeRemoveContent", (args: any) => {
        console.log("RemoveContent", args);
      });
      if (roomKey)
        joinRoom();
    }
  }, [socketConnection]);

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

  useEffect(() => {
    createConnection();
  }, [props.hubBuilder])


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
