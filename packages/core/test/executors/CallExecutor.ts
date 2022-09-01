import { assert } from "chai";

import { CallExecutor } from "../../src/executors/CallExecutor";
import { InternalCallFuture } from "../../src/futures/InternalCallFuture";
import { InternalContractFuture } from "../../src/futures/InternalContractFuture";
import { CallOptions } from "../../src/futures/types";
import { Artifact } from "../../src/types";

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip("Call Executor", () => {
  describe("validate", () => {
    const exampleArtifact = {
      _format: "hh-sol-artifact-1",
      contractName: "Foo",
      sourceName: "contracts/Foo.sol",
      abi: [
        {
          inputs: [
            {
              internalType: "bool",
              name: "b",
              type: "bool",
            },
          ],
          name: "inc",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bool",
              name: "b",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "n",
              type: "uint256",
            },
          ],
          name: "inc",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "n",
              type: "uint256",
            },
          ],
          name: "inc",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "n",
              type: "uint256",
            },
          ],
          name: "sub",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "x",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      bytecode: "0x0",
      deployedBytecode: "0x0",
      linkReferences: {},
      deployedLinkReferences: {},
    };

    const exampleContractFuture = new InternalContractFuture(
      "MyRecipe",
      "MyContract",
      {
        contractName: "MyContract",
        args: [],
        libraries: [],
      }
    );

    it("should call existing function", async () => {
      const input: CallOptions = {
        contract: exampleContractFuture,
        method: "sub",
        args: [2],
      };

      await assertCallValidation(input, exampleArtifact, []);
    });

    it("should call overloaded function", async () => {
      const input: CallOptions = {
        contract: exampleContractFuture,
        method: "inc(bool,uint256)",
        args: [true, 2],
      };

      await assertCallValidation(input, exampleArtifact, []);
    });

    it("should fail on call to non-existing function", async () => {
      const input: CallOptions = {
        contract: exampleContractFuture,
        method: "nonexistant",
        args: [],
      };

      await assertCallValidation(input, exampleArtifact, [
        "Contract 'MyContract' doesn't have a function nonexistant",
      ]);
    });

    it("should fail on call to existing function with wrong number of args", async () => {
      const input: CallOptions = {
        contract: exampleContractFuture,
        method: "sub",
        args: [],
      };

      await assertCallValidation(input, exampleArtifact, [
        "Function sub in contract MyContract expects 1 arguments but 0 were given",
      ]);
    });

    it("should fail on overloaded call to existing function with wrong number of args", async () => {
      const input: CallOptions = {
        contract: exampleContractFuture,
        method: "inc",
        args: [],
      };

      await assertCallValidation(input, exampleArtifact, [
        "Function inc in contract MyContract is overloaded, but no overload expects 0 arguments",
      ]);
    });
  });
});

async function assertCallValidation(
  input: CallOptions,
  artifact: Artifact,
  expected: string[]
) {
  const mockArtifactsService = {
    hasArtifact: (_contractName: string): boolean => {
      return true;
    },
    getArtifact: (_contractName: string) => {
      return artifact;
    },
  };

  const future = new InternalCallFuture("MyRecipe", "future-1", input);

  const ex = new CallExecutor(future);

  const validationResult = await ex.validate(input, {
    artifacts: mockArtifactsService,
  } as any);

  assert.deepStrictEqual(validationResult, expected);
}
