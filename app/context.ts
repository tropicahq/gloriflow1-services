import type { Session, User } from "better-auth";
import { createContext, RouterContextProvider } from "react-router";

export const sessionContext = createContext<{ user: User, session: Session } | null>(null)
const contextProvider = new RouterContextProvider();

