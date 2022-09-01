import { Providers } from "../providers";
import { Artifact } from "../types";

export interface IArtifactsService {
  getArtifact(name: string): Promise<Artifact>;
  hasArtifact(name: string): Promise<boolean>;
}

export class ArtifactsService implements IArtifactsService {
  constructor(private readonly _providers: Providers) {}

  public getArtifact(name: string): Promise<Artifact> {
    return this._providers.artifacts.getArtifact(name);
  }

  public hasArtifact(name: string): Promise<boolean> {
    return this._providers.artifacts.hasArtifact(name);
  }
}
