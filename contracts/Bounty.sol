// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bounty {
  struct Task {
    uint[][]graph;
    uint prize;
    uint id;
  }

  event Solution(Task task, uint[] solution);

  uint public count = 0;
  mapping (uint => Task) public bounties;

  function addBounty(uint [][]calldata graph) external payable {
    require(msg.value > 0);
    count++;
    uint id = count;
    Task storage newTask = bounties[id];
    for (uint i = 0; i < graph.length; i++) {
      newTask.graph.push(graph[i]);
    }
    newTask.prize = msg.value;
    newTask.id = id;
  }

  function presentSolution(uint id, uint[] calldata solution) external {
    Task storage task = bounties[id];
    require(task.prize > 0, "Task not found");
    require(check(id, solution), "Incorrect solution");
    uint prize = task.prize;
    emit Solution(task, solution);
    delete bounties[id];
    payable(msg.sender).transfer(prize);
  }
  
  function getGraph(uint id) external view returns(uint[][] memory) {
    return bounties[id].graph;
  }

  function check(uint id, uint[] calldata solution) private view returns (bool) {
    Task storage task = bounties[id];
    bool[] memory used = new bool[](task.graph.length);
    uint prev = solution[0];
    for(uint i = 1; i < solution.length - 1; i++){
      used[prev] = true;
      uint nxt = solution[i];
      if (contains(task.graph[prev], nxt) && !used[nxt]) {
        prev = nxt;
      } else {
        return false;
      }
    }
    used[prev] = true;
    for(uint i = 0; i < task.graph.length; i++) {
      if (!used[i]) {
        return false;
      }
    }
    return solution[solution.length - 1] == solution[0];
  }

  function contains(uint[]storage arr, uint el) private view returns (bool) {
    for(uint i = 0; i < arr.length; i++) {
      if (el == arr[i]) {
        return true;
      }
    }
    return false;
  }
}