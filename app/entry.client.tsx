// import * as React from "react";
import { RemixBrowser } from "@remix-run/react";
// import { hydrateRoot } from "react-dom/client";
console.log(`env: ${process.env.NODE_ENV}`);
// if (process.env.NODE_ENV === "test") {
require("react-dom").hydrate(<RemixBrowser />, document);
// } else {
//   hydrateRoot(document, <RemixBrowser />);
// }
// function hydrate() {
//   React.startTransition(() => {
//     hydrateRoot(
//       document,
//       <React.StrictMode>
//         <RemixBrowser />
//       </React.StrictMode>
//     );
//   });
// }

// if (window.requestIdleCallback) {
//   window.requestIdleCallback(hydrate);
// } else {
//   window.setTimeout(hydrate, 1);
// }
