# Recoil with Typescript

## 1. start

```
yarn add recoil
```

<br />

## 2. atom

- atom은 상태의 일부를 나타낸다.
- atom에 어떤 변화가 있으면 그 atom을 구독하는 모든 컴포넌트들이 재 렌더링 되는 결과가 발생할 것이다.

```ts
const textState = atom({
  key: 'textState', // unique ID
  default: '', // default value
});
```

- 컴포넌트가 atom을 읽고 쓰게 하기 위해서는 useRecoilState 를 사용한다.

```ts
function TextInput() {
  const [text, setText] = useRecoilState(textState);

  const onChange = (event) => {
    setText(event.target.value);
  };

  return <div>{text}</div>;
}
```

<br />

## 3. selector

- selector는 파생된 상태(derived state)의 일부를 나타낸다.
- 주어진 상태를 수정하는 순수 함수에 전달된 상태의 결과물로 생각할 수 있다.

```ts
const charCountState = selector({
  key: 'charCountState', // unique ID
  get: ({ get }) => {
    const text = get(textState); // get({atom으로 선언된 변수 이름})

    return text.length;
  },
});
```

- useRecoilValue 훅을 사용해서 selector의 값을 읽을 수 있다.
- setter를 함께 사용할 겅우에는 useRecoilState 사용한다.

```ts
function CharacterCount() {
  const count = useRecoilValue(charCountState);

  return <div>{count}</div>;
}
```

```ts
const userState = atom({
  key: 'user',
  default: {
    firstName: 'Gildong',
    lastName: 'Hong',
    age: 30,
  },
});

const userNameSelector = selector({
  key: 'userName',
  get: ({ get }) => {
    const user = get(userState);
    return user.firstName + ' ' + user.lastName;
  },
  set: ({ set }, name) => {
    const names = name.split(' ');
    set(userState, (prevState) => ({
      ...prevState,
      firstName: names[0],
      lastName: names[1] || '',
    })); // set(atom, (prev) => {})
  },
});

function User() {
  const [userName, setUserName] = useRecoilState(userNameSelector);
  const inputHandler = (event) => setUserName(event.target.value);

  return (
    <div>
      Full name: {userName}
      <br />
      <input type="text" onInput={inputHandler} />
    </div>
  );
}
```

<br />

## 4. atomFamily

- 매개 변수값을 받아 실제 기본값을 반환하는 함수를 제공할 수 있다.

```ts
const countStateByFamily = atomFamily({
  key: 'countState',
  default: (defaultValue) => defaultValue,
});

function Count({ number }) {
  const count = useRecoilValue(countStateByFamily(number));
  return <div>Count: {count}</div>;
}
```

<br />

## 5. selectorFamily

- 파생된 상태만이 아닌 매개변수를 기반으로 쿼리를 하고싶을 때 selectorFamily 를 사용할 수 있다.

```ts
const myNumberState = atom({
  key: 'MyNumber',
  default: 2,
});

const myMultipliedState = selectorFamily({
  key: 'MyMultipliedNumber',
  get:
    (multiplier) =>
    ({ get }) => {
      return get(myNumberState) * multiplier;
    },

  set:
    (multiplier) =>
    ({ set }, newValue) => {
      set(myNumberState, newValue / multiplier);
    },
});

function MyComponent() {
  const number = useRecoilValue(myNumberState);

  const multipliedNumber = useRecoilValue(myMultipliedState(100));

  return <div>...</div>;
}
```

<br />

---

<br />

## 6. useRecoilState, useRecoilValue, useSetRecoilState

- useRecoilState: 첫 요소가 상태의 값이며, 두번째 요소가 호출되었을 때 주어진 값을 업데이트하는 setter 함수인 튜플을 리턴한다.

- useRecoilValue: 주어진 Recoil 상태의 값을 리턴한다.

- useSetRecoilState: Recoil 상태의 값을 업데이트하기 위한 setter 함수를 리턴한다.

<br />

## 7. useRecoilStateLoadable, useRecoilValueLoadable

- 비동기 값을 반환하는 atom, selector를 읽기 위해서 사용된다.

```ts
const counter = atom({
  key: 'counter',
  default: new Promise((resolve) => {
    setTimeout(() => resolve(0), 10000);
  }),
});
```

- Suspense와 함께 사용하지 않으며, Loadable 객체를 리턴한다.

```
// Lodable

- state: selector의 상태(status)를 나타냅니다. 가능한 값은 'hasValue', 'hasError', 'loading'이다.

- contents: 이 Loadable이 나타내는 값이다. 만약 상태가 hasValue이면 이는 실제 값이며, 만약 상태가 hasError라면 이는 던져진 Error 객체입니다. 또한 상태가 loading이면 값의 Promise이다.
```

```ts
function UserInfo({ userID }) {
  const [userNameLoadable, setUserName] = useRecoilStateLoadable(
    userNameQuery(userID) //selectorFamily
  );

  const userNameLoadable = useRecoilValueLoadable(userNameQuery(userID));

  switch (userNameLoadable.state) {
    case 'hasValue':
      return <div>{userNameLoadable.contents}</div>;
    case 'loading':
      return <div>Loading...</div>;
    case 'hasError':
      throw userNameLoadable.contents;
  }
}
```

<br />

---

<br />

## 8. async and error

```ts
const currentUserNameQuery = selector({
  key: 'CurrentUserName',
  get: async ({ get }) => {
    const response = await myDBQuery({
      userID: get(currentUserIDState),
    });
    if (response.error) {
      throw response.error;
    }
    return response.name;
  },
});

function CurrentUserInfo() {
  const userName = useRecoilValue(currentUserNameQuery);
  return <div>{userName}</div>;
}
```

- Recoil은 보류중인 데이터를 다루기 위해 React Suspense와 함께 동작하도록 디자인되어 있다.
- 컴포넌트를 Suspense의 경계로 감싸는 것으로 아직 보류중인 하위 항목들을 잡아내고 대체하기 위한 UI를 렌더한다.

<br />

- Recoil selector는 컴포넌트에서 특정 값을 사용하려고 할 때에 어떤 에러가 생길지에 대한 에러를 던질 수 있다. 이는 React \<ErrorBoundary> 로 잡을 수 있다.

```ts
function MyApp() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <CurrentUserInfo />
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  );
}
```

<br />

## 9. pre-fetching

- recoil state 를 불러오지 않았을때도 callback 함수를 전달해주어 해당 callback 에서 recoil state 에 접근 가능하도록 해준다.

```ts
import { atom, useRecoilCallback } from 'recoil';

const itemsInCart = atom({
  key: 'itemsInCart',
  default: 0,
});

function CartInfoDebug() {
  const logCartItems = useRecoilCallback(({ snapshot }) => async () => {
    const numItemsInCart = await snapshot.getPromise(itemsInCart);
    console.log('Items in cart: ', numItemsInCart);
  });

  return (
    <div>
      <button onClick={logCartItems}>Log Cart Items</button>
    </div>
  );
}
```

<br />

---

<br />

## etc

### 1. useSetRecoilState

- Recoil 상태의 값을 업데이트하기 위한 setter 함수를 리턴한다.

```ts
function Form() {
  const setNamesState = useSetRecoilState(namesState);

  return <FormContent setNamesState={setNamesState} />;
}
```

### 2. useResetRecoilState

- 컴포넌트가 상태가 변경될 때 리렌더링을 위해 컴포넌트를 구독하지 않고도 상태를 기본값으로 리셋할 수 있게 해준다.

```ts
const TodoResetButton = () => {
  const resetList = useResetRecoilState(todoListState);
  return <button onClick={resetList}>Reset</button>;
};
```

### 3. isRecoilValue

- value이 atom이나 selector일 경우 true를 반환하고 그렇지 않을 경우 false를 반환한다.

```ts
const counter = atom({
  key: 'myCounter',
  default: 0,
});

isRecoilValue(counter); // true
```

### 4. constSelector

- 항상 상수를 제공하는 selector이다.
