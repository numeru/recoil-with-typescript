import axios from 'axios';
import { atom, selector, selectorFamily } from 'recoil';

export const counterState = atom({
  key: 'counter',
  default: 0,
});

export const doubledCounterState = selector({
  key: 'doubledCounter',
  get: ({ get }) => {
    const counter = get(counterState);

    return counter * 2;
  },
});

export const asyncCounterState = selector({
  key: 'asyncCounter',
  get: async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_MOCK_URL}/counter`
    );
    const result = await response.data;

    return result.value;
  },
});

export const multipliedCounterState = selectorFamily({
  key: 'multipliedCounterState',
  get:
    (multiplier: number) =>
    ({ get }) => {
      return get(counterState) * multiplier;
    },
});
