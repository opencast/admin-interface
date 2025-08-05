import React, { PropsWithChildren, ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import {
  configureStore,
  EnhancedStore,
  ReducersMapObject,
} from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P];
};

export type AppStore<S> = EnhancedStore<S>;

interface ExtendedRenderOptions<S> extends Omit<RenderOptions, "queries"> {
  preloadedState?: DeepPartial<S>;
  store?: AppStore<S>;
  reducers?: ReducersMapObject<S>;
  useRouter?: boolean;
}

// Setup store with generic reducers and optional preloaded state
export function setupStore<S>(
  reducers: ReducersMapObject<S>,
  preloadedState?: DeepPartial<S>,
): AppStore<S> {
  return configureStore({
    reducer: reducers,
    preloadedState: preloadedState as S,
  });
}

// Render function with providers - store or reducers must be provided
export function renderWithProviders<S>(
  ui: ReactElement,
  options?: ExtendedRenderOptions<S>,
) {
  // Destructure options or fallback to empty object
  const {
    preloadedState,
    store,
    reducers,
    useRouter = false,
    ...renderOptions
  } = options ?? {};

  // Create store if not provided
  const usedStore =
    store ?? (reducers ? setupStore(reducers, preloadedState) : undefined);
  if (!usedStore) {
    throw new Error(
      "You must provide either a store or reducers to setupStore",
    );
  }

  function Wrapper({ children }: PropsWithChildren<unknown>) {
    if (useRouter) {
      return (
        <Provider store={usedStore!}>
          <MemoryRouter>{children}</MemoryRouter>
        </Provider>
      );
    }
    return <Provider store={usedStore!}>{children}</Provider>;
  }

  return {
    store: usedStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
