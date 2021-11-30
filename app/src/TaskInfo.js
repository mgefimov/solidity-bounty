import {toAdjacencyMatrix} from './utils';

export function TaskInfo({ bounty, drizzle }) {
  return (
    <>
      <b>id: {bounty.id}</b>
      <pre>
        {toAdjacencyMatrix(bounty.graph)
          .map((row) => row.join(", ") + ",")
          .join("\n")}
      </pre>
      <p>Приз: {drizzle.web3.utils.fromWei(bounty.prize)} eth</p>
    </>
  );
}