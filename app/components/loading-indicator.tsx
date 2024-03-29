import { useFetchers, useTransition } from "@remix-run/react";
import { useEffect } from "react";
import toast from "react-hot-toast";

const delayInMs = 200;

export function LoadingIndicator() {
  const fetchers = useFetchers();
  const transition = useTransition();

  const loading =
    transition.state === "loading" ||
    transition.state === "submitting" ||
    fetchers.some((f) => f.state === "loading" || f.state === "submitting");

  useEffect(() => {
    if (loading) onLoadingStart();
    else onLoadingEnd();

    return () => onLoadingEnd();
  }, [loading]);

  return null;
}

// TODO move into component, using refs
let loading = false;
let timeout: number | undefined = undefined;
let toastId: string | undefined;

function onLoadingStart() {
  loading = true;

  timeout = window.setTimeout(() => {
    if (loading) toastId = toast.loading("Loading…");
  }, delayInMs);
}

function onLoadingEnd() {
  loading = false;
  if (toastId) toast.dismiss(toastId);
  if (timeout) window.clearTimeout(timeout);
}
