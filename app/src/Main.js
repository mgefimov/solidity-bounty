import { useCallback, useEffect, useState } from "react";
import { TaskInfo } from "./TaskInfo";
import { toAdjacencyList } from "./utils";

export function Main({ drizzle }) {
  const [task, setTask] = useState("");
  const [prize, setPrize] = useState("0");
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState([]);
  const [events, setEvents] = useState([]);

  const fetch = useCallback(async () => {
    setLoading(true);
    const cnt = await drizzle.contracts.Bounty.methods.count().call();
    const requests = [];
    const graphRequests = [];
    for (let i = 1; i <= cnt; i++) {
      requests.push(drizzle.contracts.Bounty.methods.bounties(i).call());
      graphRequests.push(drizzle.contracts.Bounty.methods.getGraph(i).call());
    }
    const bounties = await Promise.all(requests);
    const graphs = await Promise.all(graphRequests);
    const solutions = [];
    const filteredBounties = [];
    for (let i = 0; i < cnt; i++) {
      if (bounties[i].prize > 0) {
        filteredBounties.push({
          ...bounties[i],
          graph: graphs[i],
        });
        solutions.push("");
      }
    }
    
    async function getPastEvents(options) {
      const web3 = drizzle.web3;
      const contract = drizzle.contracts.Bounty;
      const web3Contract = new web3.eth.Contract(contract.abi, contract.address);
  
      return await web3Contract.getPastEvents("Solution", options);
    }

    setEvents(
      await getPastEvents({
        fromBlock: 0,
        toBlock: "latest",
      })
    );

    setSolutions(solutions);
    setBounties(filteredBounties);
    setLoading(false);
  }, [drizzle.contracts, drizzle.web3]);
  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div>
      <h2>Добавить задачу</h2>
      <textarea
        onChange={(e) => {
          setTask(e.target.value);
        }}
        value={task}
        style={{
          display: "block",
          height: "200px",
          width: "200px",
        }}
        placeholder={
          "0, 1, 0, 0, 1,\n1, 0, 1, 1, 0,\n0, 1, 0, 1, 0,\n0, 1, 1, 0, 1,\n1, 0, 0, 1, 0,\n"
        }
      ></textarea>
      <label>
        Приз (eth)
        <input
          type="number"
          value={prize}
          onChange={(e) => {
            setPrize(e.target.value);
          }}
          style={{
            display: "block",
          }}
          placeholder=""
        ></input>
      </label>
      <button
        disabled={task.length === 0 || prize <= 0}
        onClick={async () => {
          const adjacencyMatrix = task
            .split("\n")
            .filter((s) => s.length > 0)
            .map((s) =>
              s
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .map((s) => parseInt(s))
            );
          const adjacencyList = toAdjacencyList(adjacencyMatrix);
          await drizzle.contracts.Bounty.methods.addBounty(adjacencyList).send({
            value: drizzle.web3.utils.toWei(prize, "ether"),
          });
          alert("Успешно добавлено");
          setPrize("0");
          setTask("");
          fetch();
        }}
      >
        Добавить
      </button>

      <h2>Задачи</h2>
      {loading
        ? "Loading..."
        : bounties.map((bounty, i) => {
            return (
              <div key={bounty.id}>
                <TaskInfo drizzle={drizzle} bounty={bounty} />
                <input
                  value={solutions[i]}
                  type="text"
                  placeholder="0,1,2,3,4,0"
                  onChange={(e) => {
                    setSolutions(
                      solutions.map((s, j) => {
                        if (j === i) {
                          return e.target.value;
                        }
                        return s;
                      })
                    );
                  }}
                ></input>
                <button
                  disabled={solutions[i].length === 0}
                  onClick={async () => {
                    const solution = solutions[i]
                      .split(",")
                      .map((s) => s.trim())
                      .map((s) => parseInt(s));
                    try {
                      await drizzle.contracts.Bounty.methods
                        .presentSolution(bounty.id, solution)
                        .send();
                    } catch (error) {
                      alert("Неправильное решение");
                    }
                    fetch();
                  }}
                >
                  Решить
                </button>
                <hr></hr>
              </div>
            );
          })}
      <h2>События</h2>
      <div>
        {events.map((event) => {
          return (
            <div key={event.returnValues.task.id}>
              <TaskInfo drizzle={drizzle} bounty={event.returnValues.task} />
              <b>Решение:</b>
              <pre>{event.returnValues.solution.join(",")}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
