import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { YjsRoomsProvider } from "./providers/yjs-provider/yjs-rooms-provider";

export default function App() {
  return (
    <YjsRoomsProvider>
      <Router
        root={(props) => (
          <MetaProvider>
            <Title>SolidStart - Bare</Title>
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        )}
      >
        <FileRoutes />
      </Router>
    </YjsRoomsProvider>
  );
}
