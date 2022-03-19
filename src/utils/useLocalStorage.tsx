import type { Dispatch, SetStateAction } from "react";

import { useState } from "react";

export const useStateWithLocalStorage = <S,>(
  initialState: S | (() => S),
  key: string
): [S, Dispatch<SetStateAction<S>>] => {
  const [data, _setData] = useState(() => {
    const initialData =
      initialState instanceof Function ? initialState() : initialState;
    try {
      const dataFromStorage = localStorage.getItem(key);
      return dataFromStorage ? (JSON.parse(dataFromStorage) as S) : initialData;
    } catch (e) {
      return initialData;
    }
  });

  const setData: Dispatch<SetStateAction<S>> = (value) => {
    const d = value instanceof Function ? value(data) : value;
    localStorage.setItem(key, JSON.stringify(d));
    _setData(d);
  };

  return [data, setData];
};
