import React from 'react';
import {
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
  useResetRecoilState,
} from 'recoil';
import {
  counterState,
  doubledCounterState,
  asyncCounterState,
  multipliedCounterState,
} from '@stores/counter';

function App() {
  const [counter, setCounter] = useRecoilState(counterState);
  const doubledCounter = useRecoilValue(doubledCounterState);

  // const asyncCounter = useRecoilValue(asyncCounterState); // Suspense Fallback

  const asyncCounterLoadable = useRecoilValueLoadable(asyncCounterState);

  const showAsyncCounterResult = () => {
    switch (asyncCounterLoadable.state) {
      case 'hasValue':
        return <div>async counter : {asyncCounterLoadable.contents}</div>;
      case 'loading':
        return <div>Loading...</div>;
      case 'hasError':
        throw asyncCounterLoadable.contents;
    }
  };

  const multipliedCounter = useRecoilValue(multipliedCounterState(100));

  const resetCounter = useResetRecoilState(counterState);

  return (
    <div>
      <div>
        counter : {counter}
        <br />
        doubled counter : {doubledCounter}
      </div>

      <br />

      <button onClick={() => setCounter((prev) => prev + 1)}>+</button>
      <button onClick={() => setCounter((prev) => prev - 1)}>-</button>

      <br />

      {/* <div>async counter : {asyncCounter}</div> */}

      <br />

      <div>{showAsyncCounterResult()}</div>

      <br />

      <div>multiplied counter : {multipliedCounter}</div>

      <br />

      <button onClick={resetCounter}>reset</button>
    </div>
  );
}

export default App;
