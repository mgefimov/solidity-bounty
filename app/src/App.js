import { DrizzleContext } from "@drizzle/react-plugin";
import { Main } from "./Main";

function App() {
  return (
    <DrizzleContext.Consumer>
      {(drizzleContext) => {
        const { drizzle, drizzleState, initialized } = drizzleContext;
        if (!initialized) {
          return "Loading...";
        }
        return <Main drizzle={drizzle} drizzleState={drizzleState}></Main>;
      }}
    </DrizzleContext.Consumer>
  );
}

export default App;
