// Demo React Component - Created by ZERO Agent Code Agent

export function Counter({ initial = 0 }) {
  const [count, setCount] = React.useState(initial);
  
  return (
    <div className="counter">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}

export function App() {
  return <Counter initial={10} />;
}
