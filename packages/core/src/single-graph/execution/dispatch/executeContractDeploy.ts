import { Services } from "../../../services/types";
import { ContractDeploy } from "../../types/executionGraph";
import { VertexVisitResult } from "../../types/graph";

import { resolveFrom, toAddress } from "./utils";

export async function executeContractDeploy(
  { artifact, args, libraries }: ContractDeploy,
  resultAccumulator: Map<number, any>,
  { services }: { services: Services }
): Promise<VertexVisitResult> {
  const resolve = resolveFrom(resultAccumulator);

  const resolvedArgs = args.map(resolve).map(toAddress);

  const resolvedLibraries = Object.fromEntries(
    Object.entries(libraries ?? {}).map(([k, v]) => [k, toAddress(resolve(v))])
  );

  const txHash = await services.contracts.deploy(
    artifact,
    resolvedArgs,
    resolvedLibraries
  );

  const receipt = await services.transactions.wait(txHash);

  return {
    _kind: "success",
    result: {
      name: artifact.contractName,
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      address: receipt.contractAddress,
    },
  };
}
