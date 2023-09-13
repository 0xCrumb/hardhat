import {
  DeploymentResultType,
  ExecutionErrorDeploymentResult,
  ReconciliationErrorDeploymentResult,
  ValidationErrorDeploymentResult,
} from "@ignored/ignition-core";
import { assert } from "chai";

import { errorDeploymentResultToExceptionMessage } from "../../src/utils/error-deployment-result-to-exception-message";

describe("display error deployment result", () => {
  describe("validation", () => {
    it("should display a validation error", () => {
      const result: ValidationErrorDeploymentResult = {
        type: DeploymentResultType.VALIDATION_ERROR,
        errors: {
          "MyModule:MyContract": [
            "The number of params does not match the constructor",
            "The name of the contract is invalid",
          ],
          "MyModule:AnotherContract": ["No library provided"],
        },
      };

      assert.equal(
        errorDeploymentResultToExceptionMessage(result),
        `The deployment wasn't run because of the following validation errors:

  * MyModule:MyContract: The number of params does not match the constructor
  * MyModule:MyContract: The name of the contract is invalid
  * MyModule:AnotherContract: No library provided`
      );
    });
  });

  describe("reconciliation", () => {
    it("should display a reconciliation error", () => {
      const result: ReconciliationErrorDeploymentResult = {
        type: DeploymentResultType.RECONCILIATION_ERROR,
        errors: {
          "MyModule:MyContract": [
            "The params don't match",
            "The value doesn't match",
          ],
          "MyModule:AnotherContract": ["The future is timed out"],
        },
      };

      assert.equal(
        errorDeploymentResultToExceptionMessage(result),
        `The deployment wasn't run because of the following reconciliation errors:

  * MyModule:MyContract: The params don\'t match
  * MyModule:MyContract: The value doesn\'t match
  * MyModule:AnotherContract: The future is timed out`
      );
    });
  });

  describe("execution", () => {
    it("should display an execution error with timeouts", () => {
      const result: ExecutionErrorDeploymentResult = {
        type: DeploymentResultType.EXECUTION_ERROR,
        started: [],
        timedOut: [
          { futureId: "MyModule:MyContract", networkInteractionId: 1 },
          { futureId: "MyModule:AnotherContract", networkInteractionId: 3 },
        ],
        failed: [],
        successful: [],
      };

      assert.equal(
        errorDeploymentResultToExceptionMessage(result),
        `The deployment wasn't successful, there were timeouts:

Timed out:

  * MyModule:MyContract/1
  * MyModule:AnotherContract/3`
      );
    });

    it("should display an execution error with execution failures", () => {
      const result: ExecutionErrorDeploymentResult = {
        type: DeploymentResultType.EXECUTION_ERROR,
        started: [],
        timedOut: [],
        failed: [
          {
            futureId: "MyModule:MyContract",
            networkInteractionId: 1,
            error: "Reverted with reason x",
          },
          {
            futureId: "MyModule:AnotherContract",
            networkInteractionId: 3,
            error: "Reverted with reason y",
          },
        ],
        successful: [],
      };

      assert.equal(
        errorDeploymentResultToExceptionMessage(result),
        `The deployment wasn't successful, there were failures:

Failures:

  * MyModule:MyContract/1: Reverted with reason x
  * MyModule:AnotherContract/3: Reverted with reason y`
      );
    });

    it("should display an execution error with both timeouts and execution failures", () => {
      const result: ExecutionErrorDeploymentResult = {
        type: DeploymentResultType.EXECUTION_ERROR,
        started: [],
        timedOut: [
          { futureId: "MyModule:FirstContract", networkInteractionId: 1 },
          { futureId: "MyModule:SecondContract", networkInteractionId: 3 },
        ],
        failed: [
          {
            futureId: "MyModule:ThirdContract",
            networkInteractionId: 1,
            error: "Reverted with reason x",
          },
          {
            futureId: "MyModule:FourthContract",
            networkInteractionId: 3,
            error: "Reverted with reason y",
          },
        ],
        successful: [],
      };

      assert.equal(
        errorDeploymentResultToExceptionMessage(result),
        `The deployment wasn't successful, there were timeouts and failures:

Timed out:

  * MyModule:FirstContract/1
  * MyModule:SecondContract/3

Failures:

  * MyModule:ThirdContract/1: Reverted with reason x
  * MyModule:FourthContract/3: Reverted with reason y`
      );
    });
  });
});
