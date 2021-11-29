const Bounty = artifacts.require("Bounty");

contract("Bounty", (accounts) => {
  const graph = [
    [1, 2],
    [0, 2],
    [0, 1],
  ];
  let instance = null;

  before(async () => {
    instance = await Bounty.deployed();
    await instance.addBounty.sendTransaction(graph, {
      from: accounts[0],
      value: web3.utils.toWei("5", "ether"),
    });
  });

  it("Проверяем что задача успешно создалась", async () => {
    const task1 = await instance.bounties.call(1);
    assert.equal(task1.id.toNumber(), 1);
    assert.equal(web3.utils.fromWei(task1.prize, "ether"), "5");

    let graph2 = await instance.getGraph.call(1);
    graph2 = graph2.map((l) => l.map((bn) => bn.toNumber()));
    expect(graph2).to.eql(graph);
  });

  it("Проверяем что задачу нельзя решить с неправильным решением", async () => {
    const incorrectSolutions = [
      [0, 1, 3, 0],
      [0, 1, 0],
      [],
      [0, 1, 0, 1, 2, 0],
      [0],
      [1],
      [0, 1, 2, 0, 0],
    ];
    for (const incorrectSolution of incorrectSolutions) {
      let ok = false;
      try {
        await instance.presentSolution.sendTransaction(1, incorrectSolution, {
          from: accounts[1],
        });
      } catch (error) {
        ok = true;
      }
      assert.ok(ok);
    }
  });

  it("Проверяем что задача успено решается", async () => {
    const correctSolution = [0, 1, 2, 0];
    const balance = web3.utils.fromWei(
      await web3.eth.getBalance(accounts[1]),
      "ether"
    );
    await instance.presentSolution.sendTransaction(1, correctSolution, {
      from: accounts[1],
    });
    const newBalance = web3.utils.fromWei(
      await web3.eth.getBalance(accounts[1]),
      "ether"
    );
    const balanceDiff = newBalance - balance;
    // Проверяем что наш баланс увеличивается
    assert.ok(balanceDiff > 4.9);

    // Проверяем что задача корректно удаляется
    let graph2 = await instance.getGraph.call(1);
    expect(graph2).to.eql([]);
    const task1 = await instance.bounties.call(1);
    assert.equal(task1.id.toNumber(), 0);
    assert.equal(web3.utils.fromWei(task1.prize, "ether"), "0");
  });

  it("Проверяем что задачу нельзя решить дважды", async () => {
    const correctSolution = [0, 1, 2, 0];
    let ok = false;
    try {
      await instance.presentSolution.sendTransaction(1, correctSolution, {
        from: accounts[1],
      });
    } catch (error) {
      ok = true;
    }
    assert.ok(ok);
  });

  it('Проверяем логи', async () => {
    const events = await instance.getPastEvents("Solution", {
      fromBlock: 0,
      toBlock: "latest",
    });
    assert.equal(events.length, 1);
    const event = events[0];
    assert.equal(event.returnValues.task.id, '1');
  })
});
